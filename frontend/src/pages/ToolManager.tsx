import { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
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

interface PortalProps {
  children: React.ReactNode;
  wrapperId?: string;
}

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute("id", wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

function ReactPortal({ children, wrapperId = 'react-portal-wrapper' }: PortalProps) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);
  const portalWrapperRef = useRef<HTMLElement | null>(null);

  if (!portalWrapperRef.current) {
      portalWrapperRef.current = document.getElementById(wrapperId) || createWrapperAndAppendToBody(wrapperId);
  }

  useEffect(() => {
    setWrapperElement(portalWrapperRef.current);
    return () => {};
  }, [wrapperId]);

  if (wrapperElement === null) return null;

  return createPortal(children, wrapperElement);
}

interface ToolActionMenuProps {
    tool: ToolInfo;
    onTogglePremium: (id: number, isPremium: boolean | undefined) => Promise<void>;
    onToggleEnabled: (id: number, isEnabled: boolean | undefined) => Promise<void>;
    onDelete: (id: number, name: string) => Promise<void>;
}

function ToolActionMenu({ tool, onTogglePremium, onToggleEnabled, onDelete }: ToolActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const top = rect.bottom + window.scrollY;
            const right = window.innerWidth - rect.right - window.scrollX;

            setDropdownPosition({ top, right });
        }
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action: () => Promise<void>) => {
        action();
        setIsOpen(false);
    };

    const handleDeleteClick = () => {
        handleActionClick(() => onDelete(tool.id, tool.name));
    };

    const handleTogglePremiumClick = () => {
        if (tool.isEnabled === false) return;
        handleActionClick(() => onTogglePremium(tool.id, tool.isPremium));
    };

    const handleToggleEnabledClick = () => {
        handleActionClick(() => onToggleEnabled(tool.id, tool.isEnabled));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
                 return;
            }
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef, buttonRef]);


    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    ref={buttonRef}
                    type="button"
                    className="inline-flex justify-center items-center rounded-full p-1 text-gray-400 hover:text-gray-200 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-neutral-500"
                    id={`tool-menu-button-${tool.id}`}
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={handleToggle}
                    title="Tool actions"
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                 <ReactPortal wrapperId="tool-dropdown-portal">
                    <div
                        ref={menuRef}
                        className="origin-top-right absolute mt-0 w-48 rounded-md shadow-lg bg-neutral-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                        style={{
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                        }}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby={`tool-menu-button-${tool.id}`}
                    >
                        <div className="py-1" role="none">
                           <button
                                className={`flex items-center w-full text-left px-4 py-2 text-sm ${tool.isEnabled === false ? 'text-gray-500 cursor-not-allowed' : 'text-gray-200 hover:bg-neutral-600 hover:text-white'} border-b border-neutral-600`}
                                role="menuitem"
                                onClick={handleTogglePremiumClick}
                                disabled={tool.isEnabled === false}
                            >
                                <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.693h3.46c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.927 8.72c-.783-.57-.38-1.81.588-1.81h3.46a1 1 0 00.95-.693l1.07-3.292z" />
                                 </svg>
                                {tool.isPremium ? "Set Standard" : "Set Premium"}
                            </button>
                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neutral-600 hover:text-white border-b border-neutral-600"
                                role="menuitem"
                                onClick={handleToggleEnabledClick}
                            >
                                {tool.isEnabled !== false ? (
                                     <svg className="mr-3 h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                 ) : (
                                     <svg className="mr-3 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                         <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                     </svg>
                                 )}
                                {tool.isEnabled !== false ? "Disable" : "Enable"}
                            </button>
                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-600 hover:text-red-300"
                                role="menuitem"
                                onClick={handleDeleteClick}
                            >
                                <svg className="mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553l-.724 1.447H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                 </ReactPortal>
            )}
        </div>
    );
}

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
        try {
            await togglePremium(id, !isPremium);
            toast.success("Premium status updated!");
            fetchTools();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update premium status";
            toast.error(errorMsg);
        }
    };

    const handleToggleEnabled = async (id: number, isEnabled: boolean | undefined) => {
        const currentIsEnabled = isEnabled !== false;
        try {
            if (currentIsEnabled) {
                await disableTool(id);
                toast.success("Tool disabled!");
            } else {
                await enableTool(id);
                toast.success("Tool enabled!");
            }
            fetchTools();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update tool visibility";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const confirm = window.confirm(`Are you sure you want to delete the tool "${name}" (ID: ${id})?`);
        if (!confirm) return;

        try {
            await deleteTool(id);
            toast.success(`Tool "${name}" deleted!`);
            fetchTools();
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to delete tool";
            toast.error(errorMsg);
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
                            <th className="px-4 py-3 w-[10%] text-center border-b border-neutral-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-200 divide-y divide-neutral-700">
                        {tools.length > 0 ? tools.map((tool) => (
                             <tr key={tool.id} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out ${tool.isEnabled === false ? 'opacity-60 bg-neutral-800/50 hover:bg-neutral-700/40' : ''}`}>
                                 <td className="px-4 py-3 font-medium truncate">{tool.name}</td>
                                 <td className="px-4 py-3 text-sm truncate">{tool.description}</td>
                                 <td className="px-4 py-3 text-sm truncate">{tool.group?.name || "Uncategorized"}</td>
                                 <td className="px-4 py-3 text-center">
                                     <span className={`text-xs px-2 py-1 rounded font-semibold ${tool.isPremium ? 'text-yellow-400' : 'text-gray-400'}`}>
                                         {tool.isPremium ? "Premium" : "Standard"}
                                     </span>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                     <span className={`text-xs px-2 py-1 rounded font-semibold ${tool.isEnabled !== false ? 'text-green-500' : 'text-red-500'}`}>
                                         {tool.isEnabled !== false ? "Enabled" : "Disabled"}
                                     </span>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    <ToolActionMenu
                                        tool={tool}
                                        onTogglePremium={handleTogglePremium}
                                        onToggleEnabled={handleToggleEnabled}
                                        onDelete={handleDelete}
                                    />
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