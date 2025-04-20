using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    /// <summary>
    /// Data access for tools.
    /// </summary>
    public interface IToolRepository
    {
        Task<Tool?> GetByIdAsync(int id);
        Task<Tool?> GetByNameAsync(string name);
        Task<List<Tool>> GetByAssemblyPathAsync(string assemblyPath);
        Task<List<Tool>> GetAllAsync();
        Task AddAsync(Tool tool);
        Task UpdateAsync(Tool tool);
        Task DeleteByIdAsync(int id);
    }
}
