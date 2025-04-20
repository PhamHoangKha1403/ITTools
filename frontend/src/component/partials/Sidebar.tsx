import { useState, useEffect } from 'react';

import { getMenuItems } from '../../service/api';


interface Child {
    title: string;
}

function Sidebar({ isVisible }: { isVisible: boolean }) {
    const [menuItems, setMenuItems] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
          try {
            const data = await getMenuItems();
            setMenuItems(Array.isArray(data) ? data : []);
          } catch (error) {
            setError("Lỗi khi tải menu ⁠");
          } finally {
            setLoading(false);
          }
        };
        fetchMenu();
      }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div
            className={`fixed top-0 left-0 w-60 h-screen max-h bg-neutral-800 
            ${isVisible ? 'ml-0' : 'ml-[-240px]'} transition-all duration-500`}
        >
            <a className="flex flex-col z-10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 275" className="mt-[-65px]">
                    <defs>
                        <linearGradient id="a" x1="13.74" x2="303.96" y1="183.7" y2="45.59" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#25636c"></stop>
                            <stop offset=".6" stopColor="#3b956f"></stop>
                            <stop offset="1" stopColor="#14a058"></stop>
                        </linearGradient>
                    </defs>
                    <path fill="#14a058" d="M0 187.5v25s0 37.5 50 50S300 225 300 225v-37.5Z" opacity=".49"></path>
                    <path fill="#14a058" d="M300 237.5S287.5 275 250 275s-128.95-37.5-188.6-75 134.21 0 134.21 0Z" opacity=".49"></path>
                    <path fill="#14a058" d="M0 200v12.5a241.47 241.47 0 0 0 112.5 50c73.6 11.69 130.61-14.86 150-25L300 200Z" opacity=".38"></path>
                    <path fill="url(#a)" d="M0 0v212.5s62.5-12.5 150 25 150 0 150 0V0Z"></path>
                </svg>
                <div className="absolute left-0 w-full text-center top-4 text-white flex flex-col items-center justify-center">
                    <div className="text-[25px] font-medium">IT - TOOLS</div>
                    <div className="w-12 h-0.5 mx-auto my-0 mb-1"></div>
                    <div className="text-[16px]">Handy tools for developers</div>
                </div>
            </a>

            <aside className="w-full overflow-y-auto pl-4 pr-2 pt-4 pb-50
            transition-all duration-300 max-h-[calc(100vh-80px)] custom-scroll">
                {menuItems.length === 0 ? (
                    <div>No menu items available</div> // Display message if menuItems is empty
                ) : (
                    menuItems.map((item, idx) => (
                        <IconSidebar key={idx} item={item} />
                    ))
                )}
            </aside>
        </div>
    );
}

function IconSidebar({ item }: { item: any }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div key={item.title} className="flex flex-col justify-start items-center px-6 border-b border-gray-600 w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="focus:outline-none text-left text-white flex justify-between items-center w-full py-5 space-x-14"
            >
                <p className="text-sm leading-5 uppercase">{item.title}</p>
                <svg
                    className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M18 15L12 9L6 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="flex justify-start flex-col w-full md:w-auto items-start pb-1">
                    {item.children && item.children.length > 0 && (
                        <div className="ml-4">
                            {item.children.map((child: Child, childIdx: number) => (
                                <button
                                    key={childIdx}
                                    className="flex justify-start items-center space-x-6 text-gray-400 hover:text-white focus:bg-gray-700 hover:bg-gray-700 rounded px-3 py-2 w-full md:w-52"
                                >
                                    <span>{child.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Sidebar;