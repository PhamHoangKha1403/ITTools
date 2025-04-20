using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ITTools.Infrastructure.Watchers
{
    /// <summary>
    /// A background service that monitors a specified directory for plugin assembly changes (DLL files).
    /// It triggers registration or disabling of tools via ToolRegistrationService upon file creation or deletion.
    /// </summary>
    public class PluginWatcherService : BackgroundService
    {
        private readonly ILogger<PluginWatcherService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly string _pluginDirectoryPath;
        private FileSystemWatcher? _watcher;

        // Inject IConfiguration to read the plugin path from appsettings.json
        public PluginWatcherService(
            ILogger<PluginWatcherService> logger,
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;

            _pluginDirectoryPath = configuration["PluginSettings:DirectoryPath"] ?? Path.Combine(AppContext.BaseDirectory, "plugins");
            _logger.LogInformation("Plugin directory path configured to: {Path}", _pluginDirectoryPath);
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PluginWatcherService is starting.");

            // Ensure the plugin directory exists
            if (!Directory.Exists(_pluginDirectoryPath))
            {
                _logger.LogWarning("Plugin directory '{Path}' does not exist. Creating it...", _pluginDirectoryPath);
                try
                {
                    Directory.CreateDirectory(_pluginDirectoryPath);
                    _logger.LogInformation("Successfully created plugin directory: {Path}", _pluginDirectoryPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create plugin directory: {Path}. Service will not start watching.", _pluginDirectoryPath);
                    // Stop the service execution if directory creation fails
                    return Task.CompletedTask;
                }
            }
            else
            {
                _logger.LogInformation("Plugin directory '{Path}' found.", _pluginDirectoryPath);
            }


            // Initialize FileSystemWatcher
            _watcher = new FileSystemWatcher(_pluginDirectoryPath)
            {
                NotifyFilter = NotifyFilters.FileName,  // Watch for file name changes (includes creation/deletion)
                Filter = "*.dll",                       // Only watch for DLL files
                IncludeSubdirectories = false,          // Do not watch subdirectories
                EnableRaisingEvents = true              // Start watching
            };

            // Add event handlers
            _watcher.Created += OnPluginCreated;
            _watcher.Deleted += OnPluginDeleted;
            _watcher.Error += OnWatcherError;

            _logger.LogInformation("PluginWatcherService started watching directory: {Path}", _pluginDirectoryPath);

            stoppingToken.Register(() =>
            {
                _logger.LogInformation("PluginWatcherService is stopping.");
                // Clean up watcher resources when the service stops
                if (_watcher != null)
                {
                    _watcher.EnableRaisingEvents = false;
                    _watcher.Created -= OnPluginCreated;
                    _watcher.Deleted -= OnPluginDeleted;
                    _watcher.Error -= OnWatcherError;
                    _watcher.Dispose();
                    _logger.LogInformation("FileSystemWatcher disposed.");
                }
            });


            // BackgroundService will keep running. Return CompletedTask as the setup is done.
            return Task.CompletedTask;
        }

        private async void OnPluginCreated(object sender, FileSystemEventArgs e)
        {
            _logger.LogInformation("Plugin DLL created: {FullPath}", e.FullPath);
            await Task.Delay(500); // Small delay to ensure file is ready

            if (!File.Exists(e.FullPath))
            {
                _logger.LogWarning("File {FullPath} detected by 'Created' event no longer exists. Skipping registration.", e.FullPath);
                return;
            }

            using var scope = _serviceProvider.CreateScope();
            var pluginChangeHandler = scope.ServiceProvider.GetRequiredService<IPluginChangeHandler>();

            try
            {
                await pluginChangeHandler.HandlePluginCreatedAsync(e.FullPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing created plugin file: {FullPath}", e.FullPath);
            }
        }

        private async void OnPluginDeleted(object sender, FileSystemEventArgs e)
        {
            _logger.LogInformation("Plugin DLL deleted: {FullPath}", e.FullPath);

            using var scope = _serviceProvider.CreateScope();
            var pluginChangeHandler = scope.ServiceProvider.GetRequiredService<IPluginChangeHandler>();

            try
            {
                await pluginChangeHandler.HandlePluginDeletedAsync(e.FullPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing deleted plugin file event for path: {FullPath}", e.FullPath);
            }
        }

        // Handle errors from the FileSystemWatcher
        private void OnWatcherError(object sender, ErrorEventArgs e)
        {
            _logger.LogError(e.GetException(), "FileSystemWatcher encountered an error.");
        }
    }
}