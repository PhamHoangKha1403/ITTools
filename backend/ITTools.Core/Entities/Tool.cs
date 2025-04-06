using ITTools.Domain.Interfaces;

namespace ITTools.Domain.Entities
{
    public class Tool : ITool
    {
        public int Id { get; set; }
        public string Name { get; set; } = String.Empty;
        public string Description { get; set; } = String.Empty;
        public string Group { get; set; } = String.Empty;
        public bool IsPremium { get; set; } = false;
        public bool IsEnabled { get; set; } = true;
        public string AssemblyPath { get; set; } = String.Empty;

        public Task<object> ExecuteAsync(object input)
        {
            throw new NotImplementedException();
        }
    }
}
