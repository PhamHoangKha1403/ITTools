import { useState, useEffect } from "react";
import DropdownMenu from "../dropdown-menu-avatar";

interface HeaderProps {
    toggleSidebar: () => void;
}

function SearchBar() {
    return (
        <div className="xl:w-96">
            <div className="relative flex items-stretch bg-neutral-700">
                <input
                    type="search"
                    className="relative m-0 block flex-auto rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] font-normal leading-[1.6] 
                    outline-none transition duration-200 ease-in-out 
                    focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none
                    dark:border-neutral-600 text-white text-xs placeholder-neutral-500
                    dark:focus:border-primary"
                    placeholder="Search"
                />
                <span
                    className="input-group-text flex items-center whitespace-nowrap rounded px-3 py-1.5 text-center text-base font-normal text-white"
                    id="basic-addon2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd"
                        />
                    </svg>
                </span>
            </div>
        </div>
    );
}

function Header({ toggleSidebar }: HeaderProps) {
  

    return (
        <header className="p-4 flex justify-between items-center text-center bg-neutral-800 rounded-lg ">
            <div className="flex space-x-4">
                <button
                    className="px-3 rounded-md hover:bg-neutral-400 focus:outline-none focus:ring-2 focus:ring-white transition transform focus:scale-105"
                    aria-label="Toggle menu"
                    onClick={toggleSidebar}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 612 612"
                        fill="currentColor"
                        className="w-3 h-3 text-white"
                    >
                        <path d="M61.2,122.4h489.6c33.782,0,61.2-27.387,61.2-61.2S584.613,0,550.8,0H61.2C27.387,0,0,27.387,0,61.2     S27.387,122.4,61.2,122.4z M550.8,244.8H61.2C27.387,244.8,0,272.187,0,306c0,33.812,27.387,61.2,61.2,61.2h489.6     c33.782,0,61.2-27.388,61.2-61.2C612,272.187,584.613,244.8,550.8,244.8z M550.8,489.6H61.2C27.387,489.6,0,516.987,0,550.8     C0,584.613,27.387,612,61.2,612h489.6c33.782,0,61.2-27.387,61.2-61.2C612,516.987,584.613,489.6,550.8,489.6z" />
                    </svg>
                </button>
                <SearchBar />
            </div>

            <div className="flex items-center space-x-4 text-sm text-neutral-500">
               <DropdownMenu/>
            </div>
        </header>
    );
}

export default Header;
