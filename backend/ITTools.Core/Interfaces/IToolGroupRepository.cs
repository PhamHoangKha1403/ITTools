using ITTools.Domain.Entities;

namespace ITTools.Domain.Interfaces
{
    public interface IToolGroupRepository
    {
        /// <summary>
        /// Retrieves a tool group by its ID.
        /// </summary>
        /// <param name="id">The ID of the tool group.</param>
        /// <returns>The tool group if found; otherwise, null.</returns>
        Task<ToolGroup?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves a tool group by its name.
        /// </summary>
        /// <param name="name">The name of the tool group.</param>
        /// <returns>The tool group if found; otherwise, null.</returns>
        Task<ToolGroup?> GetByNameAsync(string name);

        /// <summary>
        /// Retrieves all tool groups.
        /// </summary>
        /// <returns>A list of all tool groups.</returns>
        Task<List<ToolGroup>> GetAllAsync();

        /// <summary>
        /// Adds a new tool group.
        /// </summary>
        /// <param name="toolGroup">The tool group to add.</param>
        Task AddAsync(ToolGroup toolGroup);

        /// <summary>
        /// Updates an existing tool group.
        /// </summary>
        /// <param name="toolGroup">The tool group to update.</param>
        Task UpdateAsync(ToolGroup toolGroup);

        /// <summary>
        /// Deletes a tool group by its ID.
        /// </summary>
        /// <param name="id">The ID of the tool group to delete.</param>
        Task DeleteByIdAsync(int id);
    }
}
