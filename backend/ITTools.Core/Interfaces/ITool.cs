namespace ITTools.Domain.Interfaces
{
    /// <summary>
    /// Defines the contract for all tool plugins.
    /// Each tool must implement this interface to be dynamically loaded and executed.
    /// </summary>
    public interface ITool
    {
        /// <summary>
        /// Unique name of the tool. Used for identification and API routing.
        /// </summary>
        string Name { get; }

        /// <summary>
        /// A brief description of what the tool does.
        /// </summary>
        string Description { get; }

        /// <summary>
        /// The ID of the ToolGroup this tool belongs to.
        /// Corresponds to the primary key in the ToolGroups table.
        /// </summary>
        int GroupId { get; }

        /// <summary>
        /// Indicates if the tool requires a premium subscription to use.
        /// </summary>
        bool IsPremium { get; }

        /// <summary>
        /// JSON Schema definition for the tool's input parameters.
        /// Used by the frontend to dynamically render the input form.
        /// </summary>
        string InputSchema { get; }

        /// <summary>
        /// JSON Schema definition for the tool's output structure.
        /// Helps the frontend understand how to display the results.
        /// </summary>
        string OutputSchema { get; }

        /// <summary>
        /// Executes the core logic of the tool.
        /// </summary>
        /// <param name="input">Input data for the tool, expected to match the InputSchema.</param>
        /// <returns>The result of the tool's execution, aligning with the OutputSchema.</returns>
        Task<object> ExecuteAsync(object input);
    }
}