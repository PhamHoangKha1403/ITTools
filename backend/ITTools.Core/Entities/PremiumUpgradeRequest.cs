namespace ITTools.Domain.Entities
{
    public class PremiumUpgradeRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime RequestTimestamp { get; set; }
        public PremiumUpgradeRequestStatus Status { get; set; }
        public int? ProcessedByUserId { get; set; } // ID of the user who processed the request (admin)
        public DateTime? ProcessedTimestamp { get; set; } // Timestamp when the request was processed
        public string? AdminNotes { get; set; } // Optional field for admin response
    }

    public enum PremiumUpgradeRequestStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
}
