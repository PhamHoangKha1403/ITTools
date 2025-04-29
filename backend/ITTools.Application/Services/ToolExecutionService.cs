using System.Security.Claims;
using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

namespace ITTools.Application.Services
{
    public class ToolExecutionException : Exception
    {
        public ToolExecutionException(string message) : base(message) { }
        public ToolExecutionException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class ToolNotFoundException : ToolExecutionException
    {
        public ToolNotFoundException(int id) : base($"Tool #{id} not found or is disabled.") { }
    }

    public class ToolAccessForbiddenException : ToolExecutionException
    {
        public ToolAccessForbiddenException(int id) : base($"Access denied to tool #{id}. Premium subscription required.") { }
    }

    public class ToolInputValidationException : ToolExecutionException
    {
        public IList<string> ValidationErrors { get; }
        public ToolInputValidationException(string message, IList<string> errors) : base(message)
        {
            ValidationErrors = errors ?? new List<string>();
        }
    }

    public class ToolExecutionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPluginLoader _pluginLoader;
        private readonly ILogger<ToolExecutionService> _logger;

        public ToolExecutionService(
            IUnitOfWork unitOfWork,
            IPluginLoader pluginLoader,
            ILogger<ToolExecutionService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _pluginLoader = pluginLoader ?? throw new ArgumentNullException(nameof(pluginLoader));
            _logger = logger;
        }

        public async Task<object?> ExecuteToolAsync(int id, object? inputData, ClaimsPrincipal currentUser)
        {
            _logger.LogInformation("Attempting to execute tool: {ToolName} for user: {UserName}", id, currentUser?.Identity?.Name ?? "Anonymous");

            // Get Tool Metadata from Repository
            Tool? toolMetadata = await _unitOfWork.Tools.GetByIdAsync(id);

            if (toolMetadata == null || !toolMetadata.IsEnabled)
            {
                _logger.LogWarning("Execution failed: Tool #{ToolName} not found or disabled.", id);
                throw new ToolNotFoundException(id);
            }

            // Check Permissions
            if (toolMetadata.IsPremium)
            {
                // Check if user is null (anonymous) or doesn't have Premium/Admin role
                if (currentUser == null || !(currentUser.IsInRole("Premium") || currentUser.IsInRole("Admin")))
                {
                    _logger.LogWarning("Execution forbidden: User '{UserName}' lacks permission for premium tool '{ToolName}'.", currentUser?.Identity?.Name ?? "Anonymous", toolMetadata.Name);
                    throw new ToolAccessForbiddenException(id);
                }
            }

            // Validate Input Data against InputSchema
            try
            {
                JSchema schema = JSchema.Parse(toolMetadata.InputSchema);
                JToken inputJson = (inputData == null) ? JValue.CreateNull() : JToken.FromObject(inputData); // Convert input object to JToken

                if (!inputJson.IsValid(schema, out IList<string> validationErrors))
                {
                    _logger.LogWarning("Input validation failed for tool '{ToolName}': {Errors}", id, string.Join("; ", validationErrors));
                    throw new ToolInputValidationException($"Input data does not match the required schema for tool #{id}.", validationErrors);
                }
                _logger.LogInformation("Input validation successful for tool #{ToolName}.", id);
            }
            catch (Exception ex) when (ex is not ToolInputValidationException)
            {
                _logger.LogError(ex, "Error during input schema validation for tool '{ToolName}'. Schema: {Schema}", id, toolMetadata.InputSchema);
                throw new ToolExecutionException($"Failed to validate input schema for tool '{id}'.", ex);
            }

            // Get ITool Instance using Plugin Loader
            var allTools = _pluginLoader.LoadToolsFromAssembly(toolMetadata.AssemblyPath);
            ITool? toolInstance = allTools.FirstOrDefault(t => t.Name == toolMetadata.Name);

            if (toolInstance == null)
            {
                _logger.LogError("Execution failed: Could not find or load ITool instance for '{ToolName}' (AssemblyPath: {Path}). Check PluginLoader/DLL.", id, toolMetadata.AssemblyPath);
                // This might indicate an issue with the plugin loading mechanism or the DLL itself
                throw new ToolExecutionException($"Could not retrieve the implementation for tool '{id}'.");
            }

            // 5. Execute the Tool's Logic
            _logger.LogInformation("Executing ITool.ExecuteAsync for tool: {ToolName}", id);
            try
            {
                // Pass the original inputData object (or the validated JToken if ITool expects it)
                object? result = await toolInstance.ExecuteAsync(inputData); // Or potentially inputJson if ExecuteAsync expects JToken
                _logger.LogInformation("Execution successful for tool: {ToolName}", id);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during execution of tool: {ToolName}", id);
                throw new ToolExecutionException($"An error occurred while executing the tool '{id}'.", ex);
            }
        }
    }
}
