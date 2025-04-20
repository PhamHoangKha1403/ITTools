using ITTools.Domain.Entities;

namespace ITTools.Application.DTO
{
    public class ToolDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public string? Description { get; set; }
        public ToolGroup Group { get; set; } = new ToolGroup();
        public bool IsPremium { get; set; } = false;
        public bool IsEnabled { get; set; } = true;
        public string InputSchema { get; set; } = String.Empty;
        public string OutputSchema { get; set; } = String.Empty;
    }
}
