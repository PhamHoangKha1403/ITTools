namespace ITTools.Domain.Interfaces
{
    /// <summary>
    /// Contract for plugin implementations.
    /// </summary>
    public interface ITool
    {
        string Name { get; }
        string Description { get; }
        string Group { get; }
        bool IsPremium { get; }
        Task<object> ExecuteAsync(object input);
    }
}
