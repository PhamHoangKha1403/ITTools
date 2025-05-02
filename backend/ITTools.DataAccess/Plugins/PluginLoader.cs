using System.Diagnostics;
using System.Reflection;
using System.Runtime.Loader;
using ITTools.Domain.Interfaces;

namespace ITTools.Infrastructure.Plugins
{
    public class PluginLoader : IPluginLoader
    {
        public IEnumerable<ITool> LoadToolsFromAssembly(string assemblyPath)
        {
            try
            {
                string pluginDir = Path.GetDirectoryName(assemblyPath)!;
                string dllName = Path.GetFileNameWithoutExtension(assemblyPath);

                var context = new MemoryLoadContext(pluginDir);
                var assembly = context.LoadMainAssembly(dllName);

                var toolTypes = assembly.GetTypes()
                        .Where(t => typeof(ITool).IsAssignableFrom(t) && !t.IsAbstract && t.IsClass);
                Debug.WriteLine($"Loaded {toolTypes.Count()} tool types from assembly: {assemblyPath}");

                var tools = new List<ITool>();
                foreach (var type in toolTypes)
                {
                    if (Activator.CreateInstance(type) is ITool toolInstance)
                    {
                        tools.Add(toolInstance);
                    }
                }

                return tools;
            }
            catch (Exception ex)
            {
                return Enumerable.Empty<ITool>();
            }
        }
    }

    public class MemoryLoadContext : AssemblyLoadContext
    {
        private readonly Dictionary<string, byte[]> _assemblies;

        public MemoryLoadContext(string pluginDirectory)
        {
            _assemblies = Directory.GetFiles(pluginDirectory, "*.dll")
                .ToDictionary(Path.GetFileNameWithoutExtension, File.ReadAllBytes);
        }

        protected override Assembly? Load(AssemblyName assemblyName)
        {
            if (_assemblies.TryGetValue(assemblyName.Name!, out var assemblyBytes))
            {
                return LoadFromStream(new MemoryStream(assemblyBytes));
            }

            return null;
        }

        public Assembly LoadMainAssembly(string dllFileName)
        {
            return LoadFromStream(new MemoryStream(_assemblies[Path.GetFileNameWithoutExtension(dllFileName)]));
        }
    }
}
