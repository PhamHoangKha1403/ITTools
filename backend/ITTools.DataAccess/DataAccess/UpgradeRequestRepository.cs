using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    public class UpgradeRequestRepository : IUpgradeRequestRepository
    {
        private readonly ApplicationDbContext _context;

        public UpgradeRequestRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(PremiumUpgradeRequest request)
        {
            await _context.PremiumUpgradeRequests.AddAsync(request);
        }

        public async Task DeleteAsync(int id)
        {
            var request = await _context.PremiumUpgradeRequests.FindAsync(id);
            if (request != null)
            {
                _context.PremiumUpgradeRequests.Remove(request);
            }
        }

        public async Task<IEnumerable<PremiumUpgradeRequest>> GetAllAsync()
        {
            return await _context.PremiumUpgradeRequests.ToListAsync();
        }
        public async Task<PremiumUpgradeRequest?> GetByIdAsync(int id)
        {
            return await _context.PremiumUpgradeRequests
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<PremiumUpgradeRequest>> GetByUserIdAsync(int userId)
        {
            return await _context.PremiumUpgradeRequests
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }

        public Task UpdateAsync(PremiumUpgradeRequest request)
        {
            _context.PremiumUpgradeRequests.Update(request);
            return Task.CompletedTask;
        }
    }
}
