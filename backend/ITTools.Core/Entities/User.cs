﻿using ITTools.Domain.Enums;

namespace ITTools.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = String.Empty;
        public string PasswordHash { get; set; } = String.Empty;
        public UserRole Role { get; set; } = UserRole.User; // "User", "Premium", "Admin"
    }
}
