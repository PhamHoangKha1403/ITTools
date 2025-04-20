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
            _context.Tools.Add(tool);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Tool tool)
        {
            _context.Tools.Update(tool);
            await _context.SaveChangesAsync();
        }

        public Task<List<Tool>> GetAllAsync(string? name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return _context.Tools.ToListAsync();
            }
            else
            {
                return _context.Tools.Where(t => t.Name.ToLower().Contains(name.Trim().ToLower())).ToListAsync();
            }
        }

        public Task<Tool?> GetByIdAsync(int id)
        {
            return _context.Tools.FirstOrDefaultAsync(t => t.Id == id);
        }

        public Task DeleteByIdAsync(int id)
        {
            var tool = _context.Tools.Find(id);
            if (tool != null)
            {
                _context.Tools.Remove(tool);
                return _context.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Tool not found");
            }
        }
    }
}
