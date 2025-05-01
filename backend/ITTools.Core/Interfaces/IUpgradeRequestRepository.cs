using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    public interface IUpgradeRequestRepository
    {
        Task<IEnumerable<PremiumUpgradeRequest>> GetAllAsync();
        Task<PremiumUpgradeRequest?> GetByIdAsync(int id);
        Task<IEnumerable<PremiumUpgradeRequest>> GetByUserIdAsync(int userId);
        Task AddAsync(PremiumUpgradeRequest request);
        Task UpdateAsync(PremiumUpgradeRequest request);
        Task DeleteAsync(int id);
    }
}
