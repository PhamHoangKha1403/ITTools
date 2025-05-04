using ITTools.Domain.Entities;

namespace ITTools.Application.DTO
{
    public class UpgradeRequestDTO
    {
        public int Id { get; set; }
        public UserDTO RequestedUser { get; set; }
        public DateTime RequestTimestamp { get; set; }
        public PremiumUpgradeRequestStatus Status { get; set; } = PremiumUpgradeRequestStatus.Pending;
        public UserDTO? ProcessedByUser { get; set; }
        public DateTime? ProcessedTimestamp { get; set; }
        public string? AdminNotes { get; set; }
    }
}
