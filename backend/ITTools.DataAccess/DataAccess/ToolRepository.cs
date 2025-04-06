using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;

namespace ITTools.Infrastructure.DataAccess
{
    internal class ToolRepository : IToolRepository
    {
        public Task AddAsync(Tool tool)
        {
            throw new NotImplementedException();
        }

        public Task<List<Tool>> GetByAssemblyPathAsync(string assemblyPath)
        {
            throw new NotImplementedException();
        }

        public Task<Tool> GetByNameAsync(string name)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(Tool tool)
        {
            throw new NotImplementedException();
        }
    }
}
