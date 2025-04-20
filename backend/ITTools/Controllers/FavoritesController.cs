using System.Security.Claims;
using ITTools.Application.Exceptions;
using ITTools.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [Route("favorites")]
    [ApiController]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly FavoriteService _favoriteService;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(FavoriteService favoriteService, ILogger<FavoritesController> logger)
        {
            _favoriteService = favoriteService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFavorites()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                _logger.LogWarning("Invalid User ID format in token: {UserIdString}", userIdString);
                return BadRequest(new { message = "Invalid User ID format in token." });
            }

            _logger.LogInformation("Fetching favorites for User ID: {UserId}", userId);
            try
            {
                var favorites = await _favoriteService.GetFavoritesAsync(userId);
                return Ok(new { data = favorites });
            }
            catch (Exception ex) // Bắt lỗi chung từ service
            {
                _logger.LogError(ex, "Error fetching favorites for User ID: {UserId}", userId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching favorites." });
            }
        }

        [HttpPost("{toolId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddToFavorites(int toolId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                _logger.LogWarning("Invalid User ID format in token: {UserIdString}", userIdString);
                return BadRequest(new { message = "Invalid User ID format in token." });
            }

            _logger.LogInformation("Adding tool {ToolId} to favorites for User ID: {UserId}", toolId, userId);
            try
            {
                await _favoriteService.AddToFavoritesAsync(toolId, userId);
                return Ok(new { message = "Successfully added tool to favorites!" });
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Tool {ToolId} not found while adding to favorites for User ID: {UserId}", toolId, userId);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Tool {ToolId} is already a favorite for User ID: {UserId}", toolId, userId);
                return StatusCode(StatusCodes.Status409Conflict, new { message = "Tool is already a favorite." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding tool {ToolId} to favorites for User ID: {UserId}", toolId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while adding to favorites." });
            }
        }

        [HttpDelete("{toolId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RemoveFromFavorites(int toolId)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                _logger.LogWarning("Invalid User ID format in token: {UserIdString}", userIdString);
                return BadRequest(new { message = "Invalid User ID format in token." });
            }

            _logger.LogInformation("Removing tool {ToolId} from favorites for User ID: {UserId}", toolId, userId);
            try
            {
                await _favoriteService.RemoveFromFavoritesAsync(userId, toolId);
                return Ok(new { message = "Successfully removed tool from favorites!" });
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Tool {ToolId} is not a favorite for User ID: {UserId}", toolId, userId);
                return NotFound(new { message = "Tool is not in user's favorite." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing tool {ToolId} from favorites for User ID: {UserId}", toolId, userId);
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while removing from favorites." });
            }
        }
    }
}
