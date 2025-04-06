using System.Security.Claims;
using System.Text;
using ITTools.Application.Exceptions;
using ITTools.Domain.Entities;
using ITTools.Domain.Enums;
using ITTools.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace ITTools.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<(string?, User?)> Login(string username, string password)
        {
            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
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
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                ]),
                Expires = DateTime.UtcNow.AddHours(3), // Longer-lived JWT since no refresh token
                Issuer = _configuration["jwt:issuer"],
                Audience = _configuration["jwt:audience"],
                SigningCredentials = creds
            };

            var tokenHandler = new JsonWebTokenHandler();
            string token = tokenHandler.CreateToken(tokenDescriptor);

            return (token, user);
        }

        public async Task Register(string username, string password)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(username);
            if (existingUser != null)
            {
                throw new AlreadyExistException("Username already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var newUser = new User
            {
                Username = username,
                PasswordHash = hashedPassword,
                Role = UserRole.User // Default role
            };

            var result = await _userRepository.AddAsync(newUser);
            if (result == 0)
            {
                throw new Exception("Failed to register user.");
            }
        }
    }
}
