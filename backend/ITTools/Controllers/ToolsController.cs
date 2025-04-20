using ITTools.Application.DTO;
using ITTools.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [Route("tools")]
    [ApiController]
    public class ToolsController : ControllerBase
    {
        private readonly ToolService _toolService;
        private readonly ToolExecutionService _toolExecutionService;
        private readonly ILogger<ToolsController> _logger;
        private readonly string _pluginDirectoryPath; // Store the path

        public ToolsController(
            ToolService toolService,
            ToolExecutionService toolExecutionService,
            ILogger<ToolsController> logger,
            IConfiguration configuration) // Inject IConfiguration to get plugin path
        {
            _toolService = toolService;
            _toolExecutionService = toolExecutionService;
            _logger = logger;

            // Read plugin directory path from configuration
            _pluginDirectoryPath = configuration.GetValue<string>("PluginSettings:DirectoryPath") ?? Path.Combine(AppContext.BaseDirectory, "plugins");

            // Ensure the directory exists (optional here, watcher service also does this)
            if (!Directory.Exists(_pluginDirectoryPath))
            {
                try { Directory.CreateDirectory(_pluginDirectoryPath); } catch { /* Log error if needed */ }
            }
        }

        // Get list of all tools
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllTools()
        {
            _logger.LogInformation("Admin request to get all tools.");
            var tools = await _toolService.GetAllToolsAsync();

            // Map the tools to DTOs if needed
            // For example, if you have a ToolDTO class, you can map it here
            var toolDTOs = tools.Select(t => new ToolDTO
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                GroupId = t.GroupId,
                IsPremium = t.IsPremium,
                IsEnabled = t.IsEnabled,
            });

            return Ok(toolDTOs);
        }

        // Endpoint to upload new DLL plugin file
        [HttpPost("upload")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadPlugin(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("UploadPlugin: No file uploaded.");
                return BadRequest("No file uploaded.");
            }

            // Basic validation: check for .dll extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".dll")
            {
                _logger.LogWarning("UploadPlugin: Invalid file type uploaded: {FileName}", file.FileName);
                return BadRequest("Invalid file type. Only .dll files are allowed.");
            }

            // Generate a safe file name using GUID
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_pluginDirectoryPath, fileName);

            _logger.LogInformation("Attempting to save uploaded plugin to: {FilePath}", filePath);

            try
            {
                // Ensure directory exists one more time before saving
                if (!Directory.Exists(_pluginDirectoryPath)) { Directory.CreateDirectory(_pluginDirectoryPath); }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation("Successfully saved plugin file: {FilePath}", filePath);
                // The PluginWatcherService will handle registration automatically
                return Ok(new { message = $"File {fileName} uploaded successfully. Tool registration will be processed automatically." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving uploaded plugin file: {FileName}", fileName);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the plugin file.");
            }
        }

        // Enable a tool
        [HttpPatch("{toolId:int}/enable")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EnableTool(int toolId)
        {
            var success = await _toolService.EnableToolAsync(toolId);
            if (!success)
            {
                return NotFound(new { Message = $"Tool with ID {toolId} not found or already enabled." });
            }
            return NoContent();
        }

        // Disable a tool
        [HttpPatch("{toolId:int}/disable")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DisableTool(int toolId)
        {
            var success = await _toolService.DisableToolAsync(toolId);
            if (!success)
            {
                return NotFound(new { Message = $"Tool with ID {toolId} not found or already disabled." });
            }
            return NoContent();
        }

        // Change premium/free status for a tool
        [HttpPatch("{toolId:int}/premium")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetPremiumStatus(int toolId, [FromBody] SetPremiumStatusRequestDto request)
        {
            if (request == null) return BadRequest(new { Message = "Invalid request body." });

            var success = await _toolService.SetToolPremiumStatusAsync(toolId, request.IsPremium);
            if (!success)
            {
                // Could be NotFound or already in the desired state, service layer handles logging
                return NotFound(new { Message = $"Tool with ID {toolId} not found or status could not be updated." });
            }
            return NoContent();
        }

        // Delete a tool
        [HttpDelete("{toolId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTool(int toolId)
        {
            var success = await _toolService.DeleteToolAsync(toolId);
            if (!success)
            {
                return NotFound(new { Message = $"Tool with ID {toolId} not found." });
            }
            return NoContent();
        }

        // Execute a tool
        [HttpPost("{toolId:int}/execute")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // For validation errors
        [ProducesResponseType(StatusCodes.Status403Forbidden)] // For premium access denial
        [ProducesResponseType(StatusCodes.Status404NotFound)]   // For tool not found
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // For other errors
        public async Task<IActionResult> ExecuteTool(int toolId, [FromBody] Dictionary<string, object>? inputData) // Receive as JObject for flexibility
        {
            _logger.LogInformation("Received execution request for tool: {ToolName}", toolId);

            // --- DEBUG LOGGING START ---
            if (inputData != null)
            {
                _logger.LogInformation("Raw inputData dictionary received: {DictionaryContent}",
                    System.Text.Json.JsonSerializer.Serialize(inputData)); // Log dictionary content

                if (inputData.TryGetValue("inputText", out var valueObject))
                {
                    if (valueObject != null)
                    {
                        _logger.LogInformation("Type of value for 'inputText' key: {ValueType}", valueObject.GetType().FullName);
                        _logger.LogInformation("Value for 'inputText' key: {Value}", valueObject.ToString());
                    }
                    else
                    {
                        _logger.LogInformation("'inputText' key found but its value is null.");
                    }
                }
                else
                {
                    _logger.LogInformation("'inputText' key not found in the received dictionary.");
                }
            }
            else
            {
                _logger.LogInformation("inputData received as null.");
            }
            // --- DEBUG LOGGING END ---

            try
            {
                // Get current user from HttpContext
                var currentUser = HttpContext.User;

                // Call the execution service
                var result = await _toolExecutionService.ExecuteToolAsync(toolId, inputData);

                // Return successful result
                return Ok(result);
            }
            // Catch specific exceptions from the service layer and map to HTTP status codes
            catch (ToolNotFoundException ex)
            {
                _logger.LogWarning(ex, "ExecuteTool failed: Tool not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (ToolAccessForbiddenException ex)
            {
                _logger.LogWarning(ex, "ExecuteTool failed: Access forbidden.");
                // Return 403 Forbidden - client needs premium
                return Forbid(); // Returns 403
                // Or return custom object: return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ToolInputValidationException ex)
            {
                _logger.LogWarning(ex, "ExecuteTool failed: Input validation error.");
                // Return 400 Bad Request with validation details
                return BadRequest(new { message = ex.Message, errors = ex.ValidationErrors });
            }
            catch (ToolExecutionException ex) // Catch general execution errors
            {
                _logger.LogError(ex, "ExecuteTool failed: General execution error.");
                // Return 500 Internal Server Error
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
            catch (Exception ex) // Catch any other unexpected errors
            {
                _logger.LogError(ex, "ExecuteTool failed: Unexpected error.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred." });
            }
        }
    }

    // DTO for setting premium status
    public class SetPremiumStatusRequestDto
    {
        public bool IsPremium { get; set; }
    }
}
