using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    public class FavoriteRepository : IFavoriteRepository
    {
        private readonly ApplicationDbContext _context;

        public FavoriteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Favorite favorite)
        {
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int userId, int toolId)
        {
            return await _context.Favorites
                .AnyAsync(f => f.UserId == userId && f.ToolId == toolId);
        }

        public async Task<List<int>> GetByUserIdAsync(int userId)
        {
            return await _context.Favorites
                .Where(f => f.UserId == userId)
                .Select(f => f.ToolId)
                .ToListAsync();
        }

        public async Task RemoveAsync(int userId, int toolId)
        {
            var favoriteToRemove = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ToolId == toolId);

            _context.Favorites.Remove(favoriteToRemove);
            await _context.SaveChangesAsync();
        }
    }
}
