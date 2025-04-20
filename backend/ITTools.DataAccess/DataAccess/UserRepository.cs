using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddAsync(User user)
        {
            _context.Users.Add(user);
            return await _context.SaveChangesAsync();
        }

        public async Task<User> GetByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }
    }
}
