using ITTools.Domain.Enums;

namespace ITTools.Application.DTO
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string Username { get; set; } = String.Empty;
        public UserRole Role { get; set; } = UserRole.User; // "User", "Premium", "Admin"
    }
}
