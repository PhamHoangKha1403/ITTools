using System.Diagnostics;
using System.Reflection;
using ITTools.Domain.Interfaces;

namespace ITTools.Infrastructure.Plugins
{
    public class PluginLoader : IPluginLoader
    {
        public IEnumerable<ITool> LoadToolsFromAssembly(string assemblyPath)
        {
            Assembly assembly;

            try
            {
                byte[] assemblyBytes = File.ReadAllBytes(assemblyPath);
                assembly = Assembly.Load(assemblyBytes);
            }
            catch (Exception ex)
            {
                return Enumerable.Empty<ITool>();
            }

            var toolTypes = assembly.GetTypes()
                        .Where(t => typeof(ITool).IsAssignableFrom(t) && !t.IsAbstract && t.IsClass);

            Debug.WriteLine($"Loaded {toolTypes.Count()} tool types from assembly: {assemblyPath}");

            var tools = new List<ITool>();
            foreach (var type in toolTypes)
            {
                try
                {
                    if (Activator.CreateInstance(type) is ITool toolInstance)
                    {
                        tools.Add(toolInstance);
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine("Failed to create instance of tool type '{TypeName}' from assembly {AssemblyPath}", type.FullName, assemblyPath);
                }
            }

            return tools;
        }
    }
}
