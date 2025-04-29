using System.Security.Claims;
using System.Text;
using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Enums;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace ITTools.Application.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<(string?, User?)> Login(string username, string password)
        {
            var user = await _unitOfWork.Users.GetByUsernameAsync(username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                _logger.LogWarning("Login failed for user: {Username}", username);
                throw new NotFoundException("Username or password is incorrect.");
            }

            // Generate JWT token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwt:secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                ]),
                Expires = DateTime.UtcNow.AddHours(3), // Longer-lived JWT since no refresh token
                Issuer = _configuration["jwt:issuer"],
                Audience = _configuration["jwt:audience"],
                SigningCredentials = creds
            };

            var tokenHandler = new JsonWebTokenHandler();
            string token = tokenHandler.CreateToken(tokenDescriptor);

            // Log the successful login
            _logger.LogInformation("User {Username} logged in successfully.", username);

            return (token, user);
        }

        public async Task Register(string username, string password)
        {
            var existingUser = await _unitOfWork.Users.GetByUsernameAsync(username);

            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Username already exists: {Username}", username);
                throw new AlreadyExistException("Username already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var newUser = new User
            {
                Username = username,
                PasswordHash = hashedPassword,
                Role = UserRole.User // Default role
            };

            try
            {
                await _unitOfWork.Users.AddAsync(newUser);
                var changes = await _unitOfWork.CommitAsync();
                _logger.LogInformation("User {Username} registered successfully. Changes committed: {Changes}", username, changes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user: {Username}", username);
                throw;
            }
        }
    }
}
