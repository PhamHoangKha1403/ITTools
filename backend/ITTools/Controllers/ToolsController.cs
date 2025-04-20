using ITTools.Application.Exceptions;
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
                try
                {
                    Directory.CreateDirectory(_pluginDirectoryPath);
                }
                catch
                {
                    _logger.LogError("Failed to create plugin directory: {Path}.", _pluginDirectoryPath);
                }
            }
        }

        // Get list of all tools
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllTools(string? name)
        {
            _logger.LogInformation("Request to get all tools.");
            var tools = await _toolService.GetAllToolsAsync(name);

            return Ok(new { data = tools });
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
                return BadRequest(new { message = "No file uploaded." });
            }

            // Basic validation: check for .dll extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".dll")
            {
                _logger.LogWarning("UploadPlugin: Invalid file type uploaded: {FileName}", file.FileName);
                return BadRequest(new { message = "Invalid file type. Only .dll files are allowed." });
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
            try
            {
                await _toolService.EnableToolAsync(toolId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "EnableTool failed: Tool not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"EnableTool failed: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Disable a tool
        [HttpPatch("{toolId:int}/disable")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DisableTool(int toolId)
        {
            try
            {
                await _toolService.DisableToolAsync(toolId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "DisableTool failed: Tool not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"DisableTool failed: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Change premium/free status for a tool
        [HttpPatch("{toolId:int}/premium")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetPremiumStatus(int toolId, [FromBody] SetPremiumStatusRequestDto request)
        {
            if (request == null) return BadRequest(new { message = "Invalid request body." });

            try
            {
                await _toolService.SetToolPremiumStatusAsync(toolId, request.IsPremium);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "SetPremiumStatus failed: Tool not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"SetPremiumStatus failed: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        // Delete a tool
        [HttpDelete("{toolId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTool(int toolId)
        {
            try
            {
                await _toolService.DeleteToolAsync(toolId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "DeleteTool failed: Tool not found.");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"DeleteTool failed: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
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

            try
            {
                // Get current user from HttpContext
                var currentUser = HttpContext.User;

                // Call the execution service
                var result = await _toolExecutionService.ExecuteToolAsync(toolId, inputData, currentUser);

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
                return Forbid();
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
