import { useEffect, useState } from "react";
import {
    getTools,
    ToolInfo,
    togglePremium,
    enableTool,
    disableTool,
    deleteTool,
} from "../service/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ToolManager() {
    const [tools, setTools] = useState<ToolInfo[]>([]);

    const fetchTools = async () => {
        try {
            const res = await getTools("");
            if (res.status === 200 && Array.isArray(res.data?.data)) {
                setTools(res.data.data);
            } else {
                console.error("Failed to load tools list:", res.data?.message || res.status);
                toast.error(res.data?.message || "Failed to load tools list");
                setTools([]);
            }
        } catch (err: any) {
            console.error("Error fetching tools:", err);
            toast.error(err.response?.data?.message || "Error fetching tools");
            setTools([]);
        }
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const handleTogglePremium = async (id: number, isPremium: boolean | undefined) => {
        const originalTools = [...tools];
        setTools(prevTools =>
            prevTools.map(tool =>
                tool.id === id ? { ...tool, isPremium: !isPremium } : tool
            )
        );
        try {
            await togglePremium(id, !isPremium);
            toast.success("Premium status updated!");
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update premium status";
            toast.error(errorMsg);
            setTools(originalTools);
        }
    };

    const handleToggleEnabled = async (id: number, isEnabled: boolean | undefined) => {
        const currentIsEnabled = isEnabled !== false;
        const originalTools = [...tools];
        setTools(prevTools =>
            prevTools.map(tool =>
                tool.id === id ? { ...tool, isEnabled: !currentIsEnabled } : tool
            )
        );

        try {
            if (currentIsEnabled) {
                await disableTool(id);
                toast.success("Tool disabled!");
            } else {
                await enableTool(id);
                toast.success("Tool enabled!");
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update tool visibility";
            toast.error(errorMsg);
            setTools(originalTools);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const confirm = window.confirm(`Are you sure you want to delete the tool "${name}" (ID: ${id})?`);
        if (!confirm) return;

        const originalTools = [...tools];
        setTools(prevTools => prevTools.filter(tool => tool.id !== id));

        try {
            await deleteTool(id);
            toast.success(`Tool "${name}" deleted!`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to delete tool";
            toast.error(errorMsg);
            setTools(originalTools);
        }
    };

    return (
        <div className="text-white p-6 pb-8">
            <h2 className="text-2xl font-bold mb-6">🛠 Tool Management</h2>

            <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-auto">
                <table className="w-full min-w-[800px] text-left table-fixed border-collapse">
                    <thead className="sticky top-0 bg-neutral-700 text-gray-300 uppercase text-sm z-10">
                        <tr>
                            <th className="px-4 py-3 w-[15%] border-b border-neutral-600">Name</th>
                            <th className="px-4 py-3 w-[30%] border-b border-neutral-600">Description</th>
                            <th className="px-4 py-3 w-[15%] border-b border-neutral-600">Category</th>
                            <th className="px-4 py-3 w-[10%] text-center border-b border-neutral-600">Premium</th>
                            <th className="px-4 py-3 w-[10%] text-center border-b border-neutral-600">Status</th>
                            <th className="px-4 py-3 w-[20%] text-center border-b border-neutral-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 divide-y divide-neutral-700">
                        {tools.length > 0 ? tools.map((tool) => (
                             <tr key={tool.id} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out ${tool.isEnabled === false ? 'opacity-60 bg-neutral-800/50 hover:bg-neutral-700/40' : ''}`}>
                                 <td className="px-4 py-3 font-medium truncate">{tool.name}</td>
                                 <td className="px-4 py-3 text-sm truncate">{tool.description}</td>
                                 <td className="px-4 py-3 text-sm truncate">{tool.group?.name || "Uncategorized"}</td>
                                 <td className="px-4 py-3 text-center">
                                     <button
                                         className={`text-xs px-2 py-1 rounded font-semibold ${tool.isPremium ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-200'} transition hover:underline disabled:opacity-50 disabled:cursor-not-allowed`}
                                         onClick={() => handleTogglePremium(tool.id, tool.isPremium)}
                                         title={tool.isPremium ? "Current: Premium. Click to make Standard" : "Current: Standard. Click to make Premium"}
                                         disabled={tool.isEnabled === false}
                                     >
                                         {tool.isPremium ? "Set Standard" : "Set Premium"}
                                     </button>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                     <button
                                         className={`text-xs px-2 py-1 rounded font-semibold ${tool.isEnabled !== false ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'} transition hover:underline`}
                                         onClick={() => handleToggleEnabled(tool.id, tool.isEnabled)}
                                         title={tool.isEnabled !== false ? "Current: Enabled. Click to Disable" : "Current: Disabled. Click to Enable"}
                                     >
                                         {tool.isEnabled !== false ? "Disable" : "Enable"}
                                     </button>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                     <button
                                         className="text-sm text-red-500 hover:text-red-400 hover:underline transition ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                         onClick={() => handleDelete(tool.id, tool.name)}
                                         title={`Delete ${tool.name}`}
                                     >
                                         Delete
                                     </button>
                                 </td>
                             </tr>
                           )) : (
                             <tr>
                                 <td colSpan={6} className="text-center py-10 text-gray-500 italic">
                                     No tools configured yet.
                                 </td>
                             </tr>
                           )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ToolManager;