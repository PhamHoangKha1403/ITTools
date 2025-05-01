using ITTools.Application.DTO;
using ITTools.Application.Exceptions;
using ITTools.Application.Services;
using ITTools.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace ITTools.API.Controllers
{
    [Route("auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] AuthModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return BadRequest(new { Message = "Already logged in!" });
            }

            try
            {
                var (token, user) = await _authService.Login(model.Username, model.Password);
                if (token == null)
                {
                    return Unauthorized(new { Message = "Wrong username or password!" });
                }

                // Store JWT in HttpOnly cookie
                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Requires HTTPS
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddHours(3) // Match JWT expiration
                });

                return Ok(new
                {
                    Message = "Logged in successfully!",
                    User = UserToDTO(user)
                });
            }
            catch (NotFoundException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Logout()
        {
            if (!Request.Cookies.ContainsKey("jwt"))
            {
                return Ok(new { Message = "No session found. Already logged out." });
            }

            // Expire the JWT cookie
            Response.Cookies.Delete("jwt");

            return Ok(new { Message = "Logged out successfully!" });
        }

        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] AuthModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            try
            {
                await _authService.Register(model.Username, model.Password);
                return Ok(new { Message = "Registered successfully!" });
            }
            catch (AlreadyExistException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error", Details = ex.Message });
            }
        }

        private static UserDTO UserToDTO(User user) =>
           new UserDTO
           {
               Username = user.Username,
               Role = user.Role
           };
    }

    public class AuthModel
    {
        public string Username { get; set; } = String.Empty;
        public string Password { get; set; } = String.Empty;
    }
}
