using ITTools.Application.Services;
using ITTools.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [Route("tool-groups")]
    [ApiController]
    public class ToolGroupsController : ControllerBase
    {
        private readonly ToolGroupService _toolGroupService;
        private readonly ILogger<IToolGroupRepository> _logger;

        public ToolGroupsController(ToolGroupService toolGroupService, ILogger<IToolGroupRepository> logger)
        {
            _toolGroupService = toolGroupService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var toolGroups = await _toolGroupService.GetAllToolGroupsAsync();
                return Ok(new { data = toolGroups });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("menu")]
        public async Task<IActionResult> GetToolGroupMenu()
        {
            try
            {
                var menu = await _toolGroupService.GetToolsMenu();
                return Ok(new { data = menu });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
