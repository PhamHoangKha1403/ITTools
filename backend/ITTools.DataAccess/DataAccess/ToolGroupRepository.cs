using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    public class ToolGroupRepository : IToolGroupRepository
    {
        private readonly ApplicationDbContext _context;

        public ToolGroupRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ToolGroup toolGroup)
        {
            await _context.ToolGroups.AddAsync(toolGroup);
        }

        public async Task DeleteByIdAsync(int id)
        {
            var toolGroup = await _context.ToolGroups.FindAsync(id);

            if (toolGroup != null)
            {
                _context.ToolGroups.Remove(toolGroup);
            }
        }

        public async Task<List<ToolGroup>> GetAllAsync()
        {
            return await _context.ToolGroups.ToListAsync();
        }

        public async Task<ToolGroup?> GetByIdAsync(int id)
        {
            return await _context.ToolGroups.FirstOrDefaultAsync(tg => tg.Id == id);
        }

        public async Task<ToolGroup?> GetByNameAsync(string name)
        {
            return await _context.ToolGroups.FirstOrDefaultAsync(tg => tg.Name == name);
        }

        public Task UpdateAsync(ToolGroup toolGroup)
        {
            _context.ToolGroups.Update(toolGroup);
            return Task.CompletedTask;
        }
    }
}
