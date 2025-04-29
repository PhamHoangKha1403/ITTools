using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    /// <summary>
    /// Service responsible for registering and unregistering tools discovered by the plugin system.
    /// </summary>
    public class ToolRegistrationService : IPluginChangeHandler
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPluginLoader _pluginLoader;
        private readonly ILogger<ToolRegistrationService> _logger;

        public ToolRegistrationService(
            IUnitOfWork unitOfWork,
            IPluginLoader pluginLoader,
            ILogger<ToolRegistrationService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _pluginLoader = pluginLoader ?? throw new ArgumentNullException(nameof(pluginLoader));
            _logger = logger; // Optional
        }

        /// <summary>
        /// Loads tools from the specified assembly path and registers any new tools found in the database.
        /// </summary>
        /// <param name="assemblyPath">The file path to the plugin assembly DLL.</param>
        /// <returns>Task representing the asynchronous operation.</returns>
        public async Task RegisterToolsFromAssemblyAsync(string assemblyPath)
        {
            _logger?.LogInformation("Attempting to register tools from assembly: {AssemblyPath}", assemblyPath);
            try
            {
                IEnumerable<ITool> loadedTools = _pluginLoader.LoadToolsFromAssembly(assemblyPath);

                if (loadedTools == null)
                {
                    _logger?.LogWarning("No tools loaded from assembly: {AssemblyPath}", assemblyPath);
                    return;
                }

                foreach (var toolInstance in loadedTools)
                {
                    if (toolInstance == null)
                    {
                        _logger?.LogWarning("Encountered a null tool instance while loading from: {AssemblyPath}", assemblyPath);
                        continue;
                    }

                    // Check if a tool with the same name already exists
                    var existingTool = await _unitOfWork.Tools.GetByNameAsync(toolInstance.Name);

                    if (existingTool != null)
                    {
                        _logger?.LogInformation("Tool '{ToolName}' already exists. Skipping registration.", toolInstance.Name);
                        continue;
                    }

                    _logger?.LogInformation("Registering new tool: {ToolName} from {AssemblyPath}", toolInstance.Name, assemblyPath);

                    // Create new Tool entity
                    var newToolEntity = new Tool
                    {
                        Name = toolInstance.Name,
                        Description = toolInstance.Description,
                        GroupId = toolInstance.GroupId, // Use the obtained Group ID
                        IsPremium = toolInstance.IsPremium,
                        InputSchema = toolInstance.InputSchema,   // Map InputSchema
                        OutputSchema = toolInstance.OutputSchema, // Map OutputSchema
                        AssemblyPath = assemblyPath,
                        IsEnabled = true // Enable by default when added
                    };

                    try
                    {
                        await _unitOfWork.Tools.AddAsync(newToolEntity);
                        var changes = await _unitOfWork.CommitAsync();
                        _logger?.LogInformation("Successfully registered tool: {ToolName}. Rows affected: {Count}", toolInstance.Name, changes);
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "Error registering tool: {ToolName}", toolInstance.Name);
                        throw;
                    }
                }

                _logger?.LogInformation("Finished processing assembly: {AssemblyPath}", assemblyPath);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error registering tools from assembly: {AssemblyPath}", assemblyPath);
            }
        }

        /// <summary>
        /// Disables all tools associated with the specified assembly path in the database.
        /// This is typically called when a plugin assembly DLL is removed.
        /// </summary>
        /// <param name="assemblyPath">The file path of the removed plugin assembly DLL.</param>
        /// <returns>Task representing the asynchronous operation.</returns>
        public async Task DisableToolsByAssemblyPathAsync(string assemblyPath)
        {
            _logger?.LogInformation("Attempting to disable tools associated with assembly: {AssemblyPath}", assemblyPath);
            var toolsToDisable = await _unitOfWork.Tools.GetByAssemblyPathAsync(assemblyPath);

            if (!toolsToDisable.Any())
            {
                _logger?.LogInformation("No tools found associated with assembly path {AssemblyPath} to disable.", assemblyPath);
                return;
            }

            foreach (var tool in toolsToDisable)
            {
                if (!tool.IsEnabled)
                {
                    _logger?.LogInformation("Tool: {ToolName} (ID: {ToolId}) associated with {AssemblyPath} was already disabled.", tool.Name, tool.Id, assemblyPath);
                    continue;
                }

                tool.IsEnabled = false;

                try
                {
                    await _unitOfWork.Tools.UpdateAsync(tool);
                    var changes = await _unitOfWork.CommitAsync();
                    _logger?.LogInformation("Disabled tool: {ToolName} (ID: {ToolId}) associated with {AssemblyPath}. Rows affected: {Count}", tool.Name, tool.Id, assemblyPath, changes);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disabling tool: {ToolName} (ID: {ToolId}) associated with {AssemblyPath}", tool.Name, tool.Id, assemblyPath);
                    throw;
                }
            }
        }

        public async Task HandlePluginCreatedAsync(string filePath)
        {
            await RegisterToolsFromAssemblyAsync(filePath);
        }

        public async Task HandlePluginDeletedAsync(string filePath)
        {
            await DisableToolsByAssemblyPathAsync(filePath);
        }
    }
}
