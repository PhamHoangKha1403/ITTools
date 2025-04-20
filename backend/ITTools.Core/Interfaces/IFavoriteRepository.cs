using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    public interface IFavoriteRepository
    {
        /// <summary>
        /// Get the list of Tools that are favorites of a specific User.
        /// </summary>
        Task<List<int>> GetByUserIdAsync(int userId);

        /// <summary>
        /// Add a Tool to the User's favorite list.
        /// </summary>
        /// <param name="favorite">Favorite object containing UserId and ToolId.</param>
        Task AddAsync(Favorite favorite);
        // Or Task AddAsync(int userId, int toolId);

        /// <summary>
        /// Remove a Tool from the User's favorite list.
        /// </summary>
        Task RemoveAsync(int userId, int toolId);

        /// <summary>
        /// Check if a Tool is already a favorite of the User.
        /// </summary>
        Task<bool> ExistsAsync(int userId, int toolId);
    }
}
