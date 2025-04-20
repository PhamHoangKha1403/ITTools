using System.Diagnostics;
using System.Reflection;
using ITTools.Domain.Interfaces;

namespace ITTools.Infrastructure.Plugins
{
    public class PluginLoader : IPluginLoader
    {
        public IEnumerable<ITool> LoadToolsFromAssembly(string assemblyPath)
        {
            var assembly = Assembly.LoadFrom(assemblyPath);
            var toolTypes = assembly.GetTypes().Where(t => typeof(ITool).IsAssignableFrom(t) && !t.IsAbstract);
            Debug.WriteLine($"Loaded {toolTypes.Count()} tool types from assembly: {assemblyPath}");

            return toolTypes.Select(t => (ITool)Activator.CreateInstance(t)).ToList();
        }
    }
}
