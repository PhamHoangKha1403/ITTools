namespace ITTools.Domain.Interfaces
{
    public interface IPluginChangeHandler
    {
        Task HandlePluginCreatedAsync(string filePath);
        Task HandlePluginDeletedAsync(string filePath);
    }
}
