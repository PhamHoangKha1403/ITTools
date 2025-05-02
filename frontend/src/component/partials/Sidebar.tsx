import React, { useState, useEffect } from 'react';
import { getMenuItems, MenuItem } from '../../service/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Sidebar({ isVisible }: { isVisible: boolean }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const res = await getMenuItems();
        if (res.status === 200 && Array.isArray(res.data?.data)) {
          const filteredMenuItems = res.data.data
            .map(group => ({
              ...group,
              tools: group.tools.filter(tool => tool.isEnabled !== false)
            }))
            .filter(group => group.tools.length > 0);
          setMenuItems(filteredMenuItems);
        } else {
          toast.error(res.data?.message || "Failed to load menu structure");
          setMenuItems([]);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Failed to load menu items");
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="p-4 text-gray-400">Loading menu...</div>;
    }
    if (menuItems.length === 0) {
      return <div className="p-4 text-gray-400">No tools available.</div>;
    }
    return menuItems.map((item) => (
      <IconSidebar key={item.toolGroupId} item={item} />
    ));
  };

  return (
 
    <div
      className={`fixed top-0 left-0 w-60 h-screen bg-neutral-800 text-white z-30 shadow-lg
                 flex flex-col  /* Thêm flex và flex-col */
                 transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
    >

      <a className="flex flex-col z-10 flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 275" className="mt-[-65px]">
           <defs>
             <linearGradient id="sidebar-logo-original-gradient" x1="13.74" x2="303.96" y1="183.7" y2="45.59" gradientUnits="userSpaceOnUse">
               <stop offset="0" stopColor="#25636c" />
               <stop offset=".6" stopColor="#3b956f" />
               <stop offset="1" stopColor="#14a058" />
             </linearGradient>
           </defs>
           <path fill="#14a058" d="M0 187.5v25s0 37.5 50 50S300 225 300 225v-37.5Z" opacity=".49" />
           <path fill="#14a058" d="M300 237.5S287.5 275 250 275s-128.95-37.5-188.6-75 134.21 0 134.21 0Z" opacity=".49" />
           <path fill="#14a058" d="M0 200v12.5a241.47 241.47 0 0 0 112.5 50c73.6 11.69 130.61-14.86 150-25L300 200Z" opacity=".38" />
           <path fill="url(#sidebar-logo-original-gradient)" d="M0 0v212.5s62.5-12.5 150 25 150 0 150 0V0Z" />
         </svg>
         <div className="absolute left-0 w-full text-center top-4 text-white flex flex-col items-center justify-center">
           <div className="text-[25px] font-medium">IT - TOOLS</div>
           <div className="w-12 h-0.5 mx-auto my-0 mb-1 bg-white opacity-50" />
           <div className="text-[16px]">Handy tools for developers</div>
         </div>
       </a>
    
      <aside className="w-full flex-grow overflow-y-auto custom-scroll min-h-0 pt-4">
         {renderContent()}
      </aside>
    </div>
 
  );
}


function IconSidebar({ item }: { item: MenuItem }) {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const handleToolClick = (toolId: number, isPremium?: boolean) => {
      if (isPremium && userRole !== '1') {
          toast.info("Upgrade to Premium to access this tool.");
      } else {
          navigate(`/tools/${toolId}`);
      }
  };

  return (
    <div className="flex flex-col justify-start items-start w-full border-b border-neutral-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none text-left text-white flex justify-between items-center w-full px-4 py-3 hover:bg-neutral-700"
      >
        <span className="text-sm font-medium uppercase tracking-wider">{item.toolGroupName}</span>
        <svg
          className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : "rotate-0"}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="flex flex-col w-full items-start pb-2 pl-4 pr-2">
          {item.tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id, tool.isPremium)}
              className="flex justify-start items-center space-x-2 text-gray-300 hover:text-white focus:bg-neutral-600 hover:bg-neutral-600 rounded px-3 py-1.5 w-full text-left text-sm relative"
            >
              <span>{tool.name}</span>
               {tool.isPremium && (
                  <span className="text-yellow-400 text-xs absolute right-2 top-1/2 transform -translate-y-1/2">★</span>
               )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidebar;