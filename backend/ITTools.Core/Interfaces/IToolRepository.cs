using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    /// <summary>
    /// Data access for tools.
    /// </summary>
    public interface IToolRepository
    {
        Task<Tool> GetByNameAsync(string name);
        Task<List<Tool>> GetByAssemblyPathAsync(string assemblyPath);
        Task AddAsync(Tool tool);
        Task UpdateAsync(Tool tool);
    }
}
