using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    public class FavoriteService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<FavoriteService> _logger;

        public FavoriteService(IUnitOfWork unitOfWork, ILogger<FavoriteService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task AddToFavoritesAsync(int toolId, int userId)
        {
            _logger?.LogInformation("Adding tool {ToolId} to favorites for user {UserId}", toolId, userId);

            // Check if the favorite already exists
            var exists = await _unitOfWork.Favorites.ExistsAsync(userId, toolId);
            if (exists)
            {
                _logger?.LogWarning("Tool {ToolId} is already a favorite for user {UserId}", toolId, userId);
                throw new InvalidOperationException($"Tool is already a favorite: Tool ID {toolId} is already in favorites for user ID {userId}");
            }

            // Check if the toolId exists
            var tool = await _unitOfWork.Tools.GetByIdAsync(toolId);
            if (tool == null)
            {
                _logger?.LogWarning("Tool with ID {ToolId} not found.", toolId);
                throw new NotFoundException($"Tool with ID {toolId} not found!");
            }

            var favorite = new Favorite
            {
                ToolId = toolId,
                UserId = userId
            };

            try
            {
                await _unitOfWork.Favorites.AddAsync(favorite);
                await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully added tool {ToolId} to favorites for user {UserId}", toolId, userId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error adding tool {ToolId} to favorites for user {UserId}", toolId, userId);
                throw;
            }
        }

        public async Task RemoveFromFavoritesAsync(int userId, int toolId)
        {
            _logger?.LogInformation("Removing tool {ToolId} from favorites for user {UserId}", toolId, userId);

            // Check if the favorite exists
            var exists = await _unitOfWork.Favorites.ExistsAsync(userId, toolId);
            if (!exists)
            {
                _logger?.LogWarning("Tool {ToolId} is not a favorite for user {UserId}", toolId, userId);
                throw new NotFoundException($"Tool is not a favorite: Tool ID {toolId} is not in favorites for user ID {userId}");
            }

            try
            {
                await _unitOfWork.Favorites.RemoveAsync(userId, toolId);
                await _unitOfWork.CommitAsync();
                _logger?.LogInformation("Successfully removed tool {ToolId} from favorites for user {UserId}", toolId, userId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error removing tool {ToolId} from favorites for user {UserId}", toolId, userId);
                throw;
            }
        }

        public async Task<List<int>> GetFavoritesAsync(int userId)
        {
            _logger?.LogInformation("Retrieving favorites for user {UserId}", userId);

            try
            {
                var favorites = await _unitOfWork.Favorites.GetByUserIdAsync(userId);

                _logger?.LogInformation("Successfully retrieved {Count} favorites for user {UserId}", favorites.Count, userId);
                return favorites;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving favorites for user {UserId}", userId);
                throw;
            }
        }
    }
}
