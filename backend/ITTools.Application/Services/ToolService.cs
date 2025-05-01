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
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ToolService> _logger;

        public ToolService(IUnitOfWork unitOfWork, ILogger<ToolService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task EnableToolAsync(int toolId)
        {
            _logger?.LogInformation("Attempting to enable tool with ID: {ToolId}", toolId);
            var tool = await _unitOfWork.Tools.GetByIdAsync(toolId);

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
                await _unitOfWork.Tools.UpdateAsync(tool);
                await _unitOfWork.CommitAsync();
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
            var tool = await _unitOfWork.Tools.GetByIdAsync(toolId);

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
                await _unitOfWork.Tools.UpdateAsync(tool);
                await _unitOfWork.CommitAsync();
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
            var tool = await _unitOfWork.Tools.GetByIdAsync(toolId); // Check if exists before deleting

            if (tool == null)
            {
                _logger?.LogWarning("DeleteToolAsync: Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            var assemblyPath = tool.AssemblyPath;
            var toolName = tool.Name;

            try
            {
                await _unitOfWork.Tools.DeleteByIdAsync(toolId);
                int changes = await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully committed database changes for deleting Tool ID {ToolId}. Rows affected: {Count}", toolId, changes);
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
                var tool = await _unitOfWork.Tools.GetByIdAsync(id);
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

        public async Task SetToolPremiumStatusAsync(int toolId, bool isPremium)
        {
            _logger?.LogInformation("Attempting to set premium status to {IsPremium} for tool ID: {ToolId}", isPremium, toolId);
            var tool = await _unitOfWork.Tools.GetByIdAsync(toolId);

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
                await _unitOfWork.Tools.UpdateAsync(tool);
                var changes = await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully set premium status for tool: {ToolName} (ID: {ToolId}) to {IsPremium}.Rows affected: {Count}", tool.Name, toolId, isPremium, changes);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error setting premium status for tool with ID: {ToolId}", toolId);
                throw;
            }
        }

        public async Task<List<ToolDTO>> GetAllToolsAsync(string? name)
        {
            _logger?.LogInformation("Fetching all tools.");
            try
            {
                // Assuming GetAllAsync exists in the repository
                var allTools = await _unitOfWork.Tools.GetAllAsync(name);
                var allToolGroups = await _unitOfWork.ToolGroups.GetAllAsync();

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

        public async Task<Tool?> GetByIdAsync(int id)
        {
            _logger?.LogInformation("Fetching tool by ID: {ToolId}", id);
            try
            {
                var tool = await _unitOfWork.Tools.GetByIdAsync(id);
                if (tool == null)
                {
                    _logger?.LogWarning("Tool with ID {ToolId} not found.", id);
                    throw new NotFoundException($"Tool with ID {id} not found!");
                }
                return tool;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error fetching tool by ID: {ToolId}", id);
                throw;
            }
        }
    }
}
