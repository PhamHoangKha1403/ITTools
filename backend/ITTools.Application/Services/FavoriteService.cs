using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    public class FavoriteService
    {
        private readonly IFavoriteRepository _favoriteRepository;
        private readonly IToolRepository _toolRepository;
        private readonly ILogger<FavoriteService> _logger;

        public FavoriteService(IFavoriteRepository favoriteRepository, IToolRepository toolRepository, ILogger<FavoriteService> logger)
        {
            _favoriteRepository = favoriteRepository;
            _toolRepository = toolRepository;
            _logger = logger;
        }

        public async Task AddToFavoritesAsync(int toolId, int userId)
        {
            _logger?.LogInformation("Adding tool {ToolId} to favorites for user {UserId}", toolId, userId);

            // Check if the favorite already exists
            var exists = await _favoriteRepository.ExistsAsync(userId, toolId);
            if (exists)
            {
                _logger?.LogWarning("Tool {ToolId} is already a favorite for user {UserId}", toolId, userId);
                throw new InvalidOperationException($"Tool is already a favorite: Tool ID {toolId} is already in favorites for user ID {userId}");
            }

            // Check if the toolId exists
            var tool = await _toolRepository.GetByIdAsync(toolId);
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
                await _favoriteRepository.AddAsync(favorite);
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
            var exists = await _favoriteRepository.ExistsAsync(userId, toolId);
            if (!exists)
            {
                _logger?.LogWarning("Tool {ToolId} is not a favorite for user {UserId}", toolId, userId);
                throw new NotFoundException($"Tool is not a favorite: Tool ID {toolId} is not in favorites for user ID {userId}");
            }

            try
            {
                await _favoriteRepository.RemoveAsync(userId, toolId);
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
                var favorites = await _favoriteRepository.GetByUserIdAsync(userId);

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
