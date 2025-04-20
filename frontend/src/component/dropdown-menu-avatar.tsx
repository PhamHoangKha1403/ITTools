import { useEffect, useRef, useState } from "react";
import { logoutUser } from '../service/api';

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [role, setRole] = useState<Number | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("userName");
        const storedRole = localStorage.getItem("role");

        if (storedUser) {
            setIsLoggedIn(true);
            setUserName(storedUser);
        }

        if (storedRole !== null) {
            const parsedRole = parseInt(storedRole, 10);
            setRole(!isNaN(parsedRole) ? parsedRole : null);
        } else {
            setRole(null);
        }
    }, []);

    const handleLogin = () => {
        window.location.href = "/login";
    };

    const handleLogout = async () => {
        try {
          await logoutUser();
          localStorage.clear();
          setIsLoggedIn(false);
          setUserName(null);
        } catch (err) {
          alert("Đăng xuất thất bại (");
        }
      };

    const goToProfile = () => {
        if (userName) {
            window.location.href = `/profile/${userName}`;
        }
    };

    const goToAdminPage = () => {
        window.location.href = "/admin";
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return isLoggedIn ? (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center cursor-pointer rounded-full hover:bg-gray-100 p-1 transition bg-black"
            >
                <img
                    className="w-10 h-10 rounded-full"
                    src="https://gravatar.com/avatar/00000000000000000000000000000000?d=mp"
                    alt="avatar"
                />
            </button>

            {isOpen && (
                <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <li className="bg-gray-100 px-4 py-2 rounded-t-lg">
                        <p className="flex flex-row">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="9" cy="9" r="2" stroke="#1C274C" strokeWidth="1.5" />
                                <path d="M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z" stroke="#1C274C" strokeWidth="1.5" />
                                <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="#1C274C" strokeWidth="1.5" />
                                <path d="M19 12H15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M19 9H14" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M19 15H16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="ml-2 block italic text-sm text-gray-600">
                                {userName}
                            </span>
                        </p>
                    </li>
                    {role === 2 && (
                        <li>
                            <a
                                href="#"
                                className="flex items-center gap-2 px-4 py-2 hover:text-blue-500 transition"
                                onClick={goToAdminPage}
                            >
                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6H21M3 10H21M3 14H21M3 18H21" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M12 2V22" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Trang Quản Lý
                            </a>
                        </li>
                    )}
                    <li>
                        <a
                            href="#"
                            className="flex items-center gap-2 px-4 py-2 hover:text-pink-500 transition"
                            onClick={goToProfile}
                        >
                            <svg width="20px" height="20px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0h48v48H0z" fill="none" />
                                <g id="Shopicon">
                                    <path d="M33.843,26.914L24,36l-9.843-9.086C8.674,30.421,5,36.749,5,44h38C43,36.749,39.326,30.421,33.843,26.914z" />
                                    <path d="M24,28c3.55,0,6.729-1.55,8.926-4C34.831,21.876,36,19.078,36,16c0-6.627-5.373-12-12-12S12,9.373,12,16
                                        c0,3.078,1.169,5.876,3.074,8C17.271,26.45,20.45,28,24,28z" />
                                </g>
                            </svg>
                            Account
                        </a>
                    </li>
                    <li className="border-t border-gray-200 my-1"></li>
                    <li>
                        <a
                            href="#"
                            className="flex items-center gap-2 px-4 py-2 hover:text-red-600 transition"
                            onClick={handleLogout}
                        >
                            <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                                <path fill="#000000" fillRule="evenodd"
                                    d="M6 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6zm10.293 5.293a1 1 0 0 1 1.414
                                    0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L18.586 13H10a1 1 0 1 1 0-2h8.586l-2.293-2.293a1 1 0
                                    0 1 0-1.414z"
                                    clipRule="evenodd" />
                            </svg>
                            Logout
                        </a>
                    </li>
                </ul>
            )}
        </div>
    ) : (
        <div>
            <button
                onClick={handleLogin}
                className="flex items-center cursor-pointer border border-gray-600 rounded-full hover:bg-gray-100 p-1 transition bg-white"
            >
                <svg width="20px" height="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path d="M20 12C20 7.58172 16.4183 4 12 4M12 20C14.5264 20 16.7792 18.8289 18.2454 17" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 12H14M14 12L11 9M14 12L11 15" stroke="#1C274C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <a>Login</a>
        </div>
    );
}
