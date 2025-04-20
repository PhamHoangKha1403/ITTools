namespace ITTools.Domain.Interfaces
{
    /// <summary>
    /// Loads plugin implementations.
    /// </summary>
    public interface IPluginLoader
    {
        IEnumerable<ITool> LoadToolsFromAssembly(string assemblyPath);
    }
}
