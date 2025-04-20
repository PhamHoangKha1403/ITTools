import { useEffect, useState } from "react";
import {
    getAdminTools,
    ToolInfo,
    togglePremium,
    toggleEnabled,
    deleteTool,
} from "../service/api";
import { toast } from "react-toastify";

function ToolManager() {
    const [tools, setTools] = useState<ToolInfo[]>([]);

    const fetchTools = () => {
        getAdminTools()
            .then(setTools)
            .catch(() => toast.error("Failed to load tools list"));
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleTogglePremium = async (toolName: string) => {
        try {
            await togglePremium(toolName);
            toast.success("Premium status updated!");
            fetchTools();
        } catch {
            toast.error("Failed to update premium status");
        }
    };

    const handleToggleEnabled = async (toolName: string) => {
        try {
            await toggleEnabled(toolName);
            toast.success("Tool visibility updated!");
            fetchTools();
        } catch {
            toast.error("Failed to update tool visibility");
        }
    };

    const handleDelete = async (toolName: string) => {
        const confirm = window.confirm(`Are you sure to delete "${toolName}"?`);
        if (!confirm) return;
        try {
            await deleteTool(toolName);
            toast.success("Tool deleted!");
            fetchTools();
        } catch {
            toast.error("Failed to delete tool");
        }
    };

    return (
        <div className="text-white p-6">
            <h2 className="text-2xl font-bold mb-6">🛠 Tool Management</h2>
            <div className="bg-neutral-900 rounded-md p-6 shadow-lg border border-neutral-700 overflow-x-auto">
                <table className="w-full text-left table-auto">
                    <thead className="bg-neutral-800 text-white">
                        <tr>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Name</th>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Description</th>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Category</th>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Premium</th>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Status</th>
                            <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tools.map((tool) => (
                            <tr key={tool.name} className="hover:bg-neutral-800 transition">
                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">{tool.name}</td>
                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">{tool.description}</td>
                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">{tool.category || "Uncategorized"}</td>
                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">
                                    {tool.isPremium ? "✅" : "❌"}
                                </td>
                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">
                                    <button
                                        className={`text-sm underline hover:no-underline transition ${tool.isEnabled
                                                ? "text-orange-400 hover:text-orange-300"
                                                : "text-green-400 hover:text-green-300"
                                            }`}
                                        onClick={() => handleToggleEnabled(tool.name)}
                                    >
                                        {tool.isEnabled ? "✅ Enable": "🚫 Disable"  }
                                    </button>
                                </td>

                                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800 flex gap-3 flex-wrap">
                                    <button
                                        className={`hover:underline transition text-sm ${tool.isPremium
                                            ? "text-yellow-400 hover:text-yellow-300"
                                            : "text-blue-400 hover:text-blue-300"
                                            }`}
                                        onClick={() => handleTogglePremium(tool.name)}
                                    >
                                        {tool.isPremium ? "🔁 Downgrade" : "✨ Promote   "}
                                    </button>

                                    <button
                                        className="text-red-500 hover:text-red-400 hover:underline transition text-sm"
                                        onClick={() => handleDelete(tool.name)}
                                    >
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ToolManager;
