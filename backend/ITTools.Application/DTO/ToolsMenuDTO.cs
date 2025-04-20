namespace ITTools.Application.DTO
{
    public class ToolGroupMenuDTO
    {
        public int ToolGroupId { get; set; }
        public string ToolGroupName { get; set; } = String.Empty;
        public string? ToolGroupDescription { get; set; }
        public List<MinimalToolDTO> Tools { get; set; } = new List<MinimalToolDTO>();
    }

    public class MinimalToolDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
    }
}
