using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ITTools.Infrastructure.DataAccess
{
    public class ToolRepository : IToolRepository
    {
        private readonly ApplicationDbContext _context;

        public ToolRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Tool?> GetByNameAsync(string name)
        {
            return await _context.Tools.FirstOrDefaultAsync(t => t.Name == name);
        }

        public async Task<List<Tool>> GetByAssemblyPathAsync(string assemblyPath)
        {
            return await _context.Tools.Where(t => t.AssemblyPath == assemblyPath).ToListAsync();
        }

        public async Task AddAsync(Tool tool)
        {
            await _context.Tools.AddAsync(tool);
        }

        public Task UpdateAsync(Tool tool)
        {
            _context.Tools.Update(tool);
            return Task.CompletedTask;
        }

        public async Task<List<Tool>> GetAllAsync(string? name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return await _context.Tools.ToListAsync();
            }
            else
            {
                return await _context.Tools.Where(t => t.Name.ToLower().Contains(name.Trim().ToLower())).ToListAsync();
            }
        }

        public async Task<Tool?> GetByIdAsync(int id)
        {
            return await _context.Tools.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task DeleteByIdAsync(int id)
        {
            var tool = await _context.Tools.FindAsync(id);

            if (tool != null)
            {
                _context.Tools.Remove(tool);
            }
        }
    }
}
