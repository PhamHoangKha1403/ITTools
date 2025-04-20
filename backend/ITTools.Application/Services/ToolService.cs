using System.Reflection;
using ITTools.Application.Exceptions;
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
        private readonly ILogger<ToolService> _logger;

        public ToolService(IToolRepository toolRepository, ILogger<ToolService> logger)
        {
            _toolRepository = toolRepository;
            _logger = logger;
        }

        public async Task<bool> EnableToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to enable tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("EnableToolAsync: Tool with ID {ToolId} not found.", toolId);
                return false;
            }

            if (tool.IsEnabled)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) is already enabled.", tool.Name, toolId);
                return true;
            }

            tool.IsEnabled = true;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully enabled tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error enabling tool with ID: {ToolId}", toolId);
                return false;
            }
        }

        public async Task<bool> DisableToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to disable tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("DisableToolAsync: Tool with ID {ToolId} not found.", toolId);
                return false;
            }

            if (!tool.IsEnabled)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) is already disabled.", tool.Name, toolId);
                return true; // Already disabled, consider it success
            }

            tool.IsEnabled = false;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully disabled tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error disabling tool with ID: {ToolId}", toolId);
                return false;
            }
        }

        public async Task<bool> DeleteToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to delete tool with ID: {ToolId}", toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId); // Check if exists before deleting

            if (tool == null)
            {
                _logger?.LogWarning("DeleteToolAsync: Tool with ID {ToolId} not found.", toolId);
                return false; // Indicate tool not found
            }

            try
            {
                await _toolRepository.DeleteByIdAsync(toolId);
                _logger?.LogInformation("Successfully deleted tool: {ToolName} (ID: {ToolId})", tool.Name, toolId);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting tool with ID: {ToolId}", toolId);
                return false;
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

                if (toolType == null) throw new Exception("ITool implementation not found");
                var toolInstance = (ITool)Activator.CreateInstance(toolType);
                return await toolInstance.ExecuteAsync(input);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing tool");
                throw new Exception($"Error executing tool: {ex.Message}", ex);
            }
        }

        // --- Phương thức mới để thay đổi trạng thái Premium ---
        /// <summary>
        /// Sets the premium status for a specific tool.
        /// </summary>
        /// <param name="toolId">The ID of the tool to modify.</param>
        /// <param name="isPremium">The desired premium status (true for premium, false for free).</param>
        /// <returns>True if the tool was found and updated successfully, false otherwise.</returns>
        public async Task<bool> SetToolPremiumStatusAsync(int toolId, bool isPremium)
        {
            _logger?.LogInformation("Attempting to set premium status to {IsPremium} for tool ID: {ToolId}", isPremium, toolId);
            var tool = await _toolRepository.GetByIdAsync(toolId);

            if (tool == null)
            {
                _logger?.LogWarning("SetToolPremiumStatusAsync: Tool with ID {ToolId} not found.", toolId);
                return false;
            }

            if (tool.IsPremium == isPremium)
            {
                _logger?.LogInformation("Tool {ToolName} (ID: {ToolId}) already has premium status set to {IsPremium}.", tool.Name, toolId, isPremium);
                return true;
            }

            tool.IsPremium = isPremium;
            try
            {
                await _toolRepository.UpdateAsync(tool);
                _logger?.LogInformation("Successfully set premium status to {IsPremium} for tool: {ToolName} (ID: {ToolId})", isPremium, tool.Name, toolId);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting premium status for tool with ID: {ToolId}", toolId);
                return false;
            }
        }

        // --- Phương thức lấy danh sách tools cho trang quản lý ---
        /// <summary>
        /// Gets a list of all tools for management purposes.
        /// </summary>
        /// <returns>A list of Tool objects.</returns>
        public async Task<List<Domain.Entities.Tool>> GetAllToolsAsync()
        {
            _logger?.LogInformation("Fetching all tools for admin.");
            try
            {
                // Assuming GetAllAsync exists in the repository
                return await _toolRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error fetching all tools for admin.");
                return new List<Domain.Entities.Tool>(); // Return empty list on error
            }
        }
    }
}
