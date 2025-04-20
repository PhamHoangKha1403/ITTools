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
            _context.ToolGroups.Add(toolGroup);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteByIdAsync(int id)
        {
            var toolGroup = await _context.ToolGroups.FindAsync(id);

            if (toolGroup != null)
            {
                _context.ToolGroups.Remove(toolGroup);
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("ToolGroup not found");
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

        public async Task UpdateAsync(ToolGroup toolGroup)
        {
            var existingToolGroup = await _context.ToolGroups.FindAsync(toolGroup.Id);

            if (existingToolGroup != null)
            {
                existingToolGroup.Name = toolGroup.Name;
                existingToolGroup.Description = toolGroup.Description;
                await _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("ToolGroup not found");
            }
        }
    }
}
