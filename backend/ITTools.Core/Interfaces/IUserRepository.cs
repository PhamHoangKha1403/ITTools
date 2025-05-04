using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(User user);
        Task<IEnumerable<User>> GetAllAsync();
        void Update(User user);
    }
}
