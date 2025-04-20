using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByUsernameAsync(string username);
        Task<int> AddAsync(User user);
    }
}
