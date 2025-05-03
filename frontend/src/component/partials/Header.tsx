import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import DropdownMenu from "../dropdown-menu-avatar";

interface HeaderProps {
  toggleSidebar: () => void;
}

function Header({ toggleSidebar }: HeaderProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tools?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="p-4 flex justify-between items-center bg-neutral-800 rounded-lg shadow-md">

      <div className="flex items-center space-x-4">

        <Link
          to="/"
          className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white transition"
          aria-label="Go to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>


        <button
          className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white transition"
          aria-label="Toggle menu"
          onClick={toggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>


        <form onSubmit={handleSearch} className="hidden md:block">
          <div className="relative flex items-center bg-neutral-700 rounded-md w-64 md:w-72 lg:w-80 xl:w-96">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-3 pr-10 py-1.5 text-sm bg-transparent text-white placeholder-neutral-400 border-none focus:outline-none focus:ring-0"
              placeholder="Search tools..."
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-400 hover:text-emerald-400 focus:outline-none"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>


      <div className="flex items-center">
        <DropdownMenu />
      </div>
    </header>
  );
}

export default Header;