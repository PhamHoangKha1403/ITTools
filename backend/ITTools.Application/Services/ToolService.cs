using System.Reflection;
using ITTools.Application.DTO;
using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    /// <summary>
    /// Manages tool operations.
    /// </summary>
    public class ToolService
    {
        private readonly IToolRepository _toolRepository;
        private readonly IToolGroupRepository _toolGroupRepository;
        private readonly ILogger<ToolService> _logger;

        public ToolService(IToolRepository toolRepository, IToolGroupRepository toolGroupRepository, ILogger<ToolService> logger)
        {
            _toolRepository = toolRepository;
            _toolGroupRepository = toolGroupRepository;
            _logger = logger;
        }

        public async Task EnableToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to enable tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("EnableToolAsync: Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            if (tool.IsEnabled)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) is already enabled.", tool.Name, toolId);
                return;
            }

            tool.IsEnabled = true;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully enabled tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error enabling tool with ID: {ToolId}", toolId);
                throw;
            }
        }

        public async Task DisableToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to disable tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("DisableToolAsync: Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            if (!tool.IsEnabled)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) is already disabled.", tool.Name, toolId);
                return;
            }

            tool.IsEnabled = false;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully disabled tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error disabling tool with ID: {ToolId}", toolId);
                throw;
            }
        }

        public async Task DeleteToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to delete tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId); // Check if exists before deleting

            if (tool == null)
            {
                _logger?.LogWarning("DeleteToolAsync: Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            var assemblyPath = tool.AssemblyPath; // Lấy đường dẫn DLL

            try
            {
                await _toolRepository.DeleteByIdAsync(toolId);
                _logger?.LogInformation("Successfully deleted tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting tool with ID: {ToolId}", toolId);
                throw;
            }

            // Delete DLL file
            if (!string.IsNullOrEmpty(assemblyPath))
            {
                try
                {
                    if (File.Exists(assemblyPath))
                    {
                        File.Delete(assemblyPath);
                        _logger?.LogInformation("Successfully deleted associated plugin file: {AssemblyPath}", assemblyPath);
                    }
                    else
                    {
                        _logger?.LogWarning("Associated plugin file not found at path: {AssemblyPath}", assemblyPath);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error deleting associated plugin file {AssemblyPath} for tool ID {ToolId}. Database record was already deleted.", assemblyPath, toolId);
                }
            }
            else
            {
                _logger?.LogInformation("No assembly path associated with tool ID {ToolId}. Skipping file deletion.", toolId);
            }
        }

        public async Task<object> ExecuteToolAsync(int id, object input)
        {
            try
            {
                var tool = await _toolRepository.GetByIdAsync(id);
                if (tool == null || !tool.IsEnabled) throw new NotFoundException("Tool not found or disabled");
                var assembly = Assembly.LoadFrom(tool.AssemblyPath);
                var toolType = assembly.GetTypes().FirstOrDefault(t => typeof(ITool).IsAssignableFrom(t) && !t.IsAbstract);

                if (toolType == null) throw new ToolNotImplementedException("ITool implementation not found");
                var toolInstance = (ITool)Activator.CreateInstance(toolType);
                return await toolInstance.ExecuteAsync(input);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing tool");
                throw;
            }
        }

        // --- Phương thức mới để thay đổi trạng thái Premium ---
        /// <summary>
        /// Sets the premium status for a specific tool.
        /// </summary>
        /// <param name="toolId">The ID of the tool to modify.</param>
        /// <param name="isPremium">The desired premium status (true for premium, false for free).</param>
        /// <returns>True if the tool was found and updated successfully, false otherwise.</returns>
        public async Task SetToolPremiumStatusAsync(int toolId, bool isPremium)
        {
            _logger?.LogInformation("Attempting to set premium status to {IsPremium} for tool ID: {ToolId}", isPremium, toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("SetToolPremiumStatusAsync: Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            if (tool.IsPremium == isPremium)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) already has premium status set to {IsPremium}.", tool.Name, toolId, isPremium);
                return;
            }

            tool.IsPremium = isPremium;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully set premium status to {IsPremium} for tool: {ToolName} (ID: {ToolId})", isPremium, tool.Name, toolId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting premium status for tool with ID: {ToolId}", toolId);
                throw;
            }
        }

        /// <summary>
        /// Gets a list of all tools for management purposes.
        /// </summary>
        /// <returns>A list of Tool objects.</returns>
        public async Task<List<ToolDTO>> GetAllToolsAsync(string? name)
        {
            _logger?.LogInformation("Fetching all tools.");
            try
            {
                // Assuming GetAllAsync exists in the repository
                var allTools = await _toolRepository.GetAllAsync(name);
                var allToolGroups = await _toolGroupRepository.GetAllAsync();

                // Map to DTOs
                var toolDTOs = allTools.Select(tool => new ToolDTO
                {
                    Id = tool.Id,
                    Name = tool.Name,
                    Description = tool.Description,
                    IsEnabled = tool.IsEnabled,
                    IsPremium = tool.IsPremium,
                    Group = new ToolGroup
                    {
                        Id = tool.GroupId,
                        Name = allToolGroups.FirstOrDefault(g => g.Id == tool.GroupId)?.Name ?? "Unknown",
                    },
                }).ToList();

                _logger?.LogInformation("Successfully fetched all tools.");
                return toolDTOs;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error fetching all tools for admin.");
                throw;
            }
        }
    }
}
