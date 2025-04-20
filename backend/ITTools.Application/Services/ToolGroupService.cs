using ITTools.Application.DTO;
using ITTools.Domain.Entities;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace ITTools.Application.Services
{
    public class ToolGroupService
    {
        private readonly IToolGroupRepository _toolGroupRepository;
        private readonly IToolRepository _toolRepository;
        private readonly ILogger<ToolGroupService> _logger;

        public ToolGroupService(IToolGroupRepository toolGroupRepository, IToolRepository toolRepository, ILogger<ToolGroupService> logger)
        {
            _toolGroupRepository = toolGroupRepository;
            _toolRepository = toolRepository;
            _logger = logger;
        }

        public async Task<ToolGroup?> GetToolGroupByIdAsync(int id)
        {
            _logger?.LogInformation("Attempting to get tool group with ID: {ToolGroupId}", id);
            var toolGroup = await _toolGroupRepository.GetByIdAsync(id);

            if (toolGroup == null)
            {
                _logger?.LogWarning("Tool group with ID {ToolGroupId} not found.", id);
                return null;
            }

            return toolGroup;
        }

        public async Task<List<ToolGroup>> GetAllToolGroupsAsync()
        {
            _logger?.LogInformation("Attempting to get all tool groups.");

            return await _toolGroupRepository.GetAllAsync();
        }

        public async Task<List<ToolGroupMenuDTO>> GetToolsMenu()
        {
            _logger?.LogInformation("Attempting to get tools menu.");
            var toolGroups = await _toolGroupRepository.GetAllAsync();
            var toolGroupMenus = new List<ToolGroupMenuDTO>();

            foreach (var group in toolGroups)
            {
                var tools = await _toolRepository.GetAllAsync();
                var toolGroupMenu = new ToolGroupMenuDTO
                {
                    ToolGroupId = group.Id,
                    ToolGroupName = group.Name,
                    ToolGroupDescription = group.Description,
                    Tools = tools.Where(t => t.GroupId == group.Id)
                     .Select(t => new MinimalToolDTO
                     {
                         Id = t.Id,
                         Name = t.Name
                     })
                     .ToList()
                };

                toolGroupMenus.Add(toolGroupMenu);
            }

            return toolGroupMenus;
        }
    }
}
