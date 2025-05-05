using System.Security.Claims;
using ITTools.Application.Exceptions;
using ITTools.Application.Services;
using ITTools.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [Route("users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOnly")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllUsers()
        {
            _logger.LogInformation("Retrieving all users list...");
            try
            {
                var users = await _userService.GetAllUsersAsync();
                _logger.LogInformation("Successfully retrieved all users list!");
                return Ok(new { data = users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while retrieving all users...");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("premium-requests")]
        [Authorize(Policy = "AdminOnly")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllPremiumUpgradeRequests()
        {
            _logger.LogInformation("Retrieving all premium upgrade requests...");
            try
            {
                var requests = await _userService.GetAllPremiumUpgradeRequestsAsync();
                _logger.LogInformation("Successfully retrieved all premium upgrade requests!");
                return Ok(new { data = requests });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while retrieving all premium upgrade requests...");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPost("premium-requests")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreatePremiumUpgradeRequest()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                _logger.LogWarning("Invalid User ID format in token: {UserIdString}", userIdString);
                return BadRequest(new { message = "Invalid User ID format in token." });
            }

            _logger.LogInformation("Creating premium upgrade request for user with ID: {UserId}", userId);
            try
            {
                await _userService.CreatePremiumUpgradeRequest(userId);
                _logger.LogInformation("Successfully created premium upgrade request for user with ID: {UserId}", userId);
                return CreatedAtAction(nameof(GetAllPremiumUpgradeRequests), new { userId }, null);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "User with ID {UserId} has a bad request.", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "User with ID {UserId} not found.", userId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while creating premium upgrade request for user with ID: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("premium-requests/{requestId}")]
        [Authorize(Policy = "AdminOnly")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeletePremiumUpgradeRequest(int requestId)
        {
            _logger.LogInformation("Deleting premium upgrade request with ID: {RequestId}", requestId);
            try
            {
                await _userService.DeletePremiumRequestAsync(requestId);
                _logger.LogInformation("Successfully deleted premium upgrade request with ID: {RequestId}", requestId);
                return NoContent();
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Premium upgrade request with ID {RequestId} not found.", requestId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while deleting premium upgrade request with ID: {RequestId}", requestId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPatch("premium-requests/{requestId}")]
        [Authorize(Policy = "AdminOnly")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdatePremiumUpgradeRequest(int requestId, [FromBody] PremiumUpgradeRequestModel bodyContent)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                _logger.LogWarning("Invalid User ID format in token: {UserIdString}", userIdString);
                return BadRequest(new { message = "Invalid User ID format in token." });
            }

            _logger.LogInformation("Updating premium upgrade request with ID: {RequestId}", requestId);
            try
            {
                await _userService.UpdateUpgradeRequest(requestId, userId, bodyContent.Status, bodyContent.Notes);
                _logger.LogInformation("Successfully updated premium upgrade request with ID: {RequestId}", requestId);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "User with ID {UserId} has a bad request.", userId);
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Premium upgrade request with ID {RequestId} not found.", requestId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating premium upgrade request with ID: {RequestId}", requestId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
    }

    public class PremiumUpgradeRequestModel
    {
        public PremiumUpgradeRequestStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
