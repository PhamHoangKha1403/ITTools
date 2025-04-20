using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)] // This hides the controller from Swagger
    [Route("/error")]
    public class ErrorController : ControllerBase
    {
        [HttpGet]
        [HttpPost]
        [HttpPut]
        [HttpDelete]
        public IActionResult HandleError()
        {
            var exception = HttpContext.Features.Get<IExceptionHandlerFeature>()?.Error;

            return Problem(
                detail: exception?.Message,
                title: "An unexpected error occurred"
            );
        }
    }
}
