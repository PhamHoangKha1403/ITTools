import { useEffect, useRef, useState } from "react";
import { logoutUser } from '../service/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { AxiosError, AxiosResponse } from 'axios';

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [role, setRole] = useState<Number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("userName");
        const storedRole = localStorage.getItem("role");

        if (storedUser) {
            setIsLoggedIn(true);
            setUserName(storedUser);
        } else {
            setIsLoggedIn(false); 
            setUserName(null);
        }

        if (storedRole !== null) {
            const parsedRole = parseInt(storedRole, 10);
            setRole(!isNaN(parsedRole) ? parsedRole : null);
        } else {
            setRole(null);
        }
       
    }, [isLoggedIn]);

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = async () => {
        try {
    
          const res: AxiosResponse = await logoutUser();

          if (res.status === 200 || res.status === 204) {
            toast.success(res.data?.message || "Logged out successfully!");
            localStorage.clear();
            setIsLoggedIn(false);
            setUserName(null);
            setRole(null);
            setIsOpen(false);
            navigate('/');
          } else {
   
             toast.error(res.data?.message || `Logout failed (Status: ${res.status})`);
          }
        } catch (err) {
         
          const error = err as AxiosError<{ message?: string }>;
          const errorMsg = error.response?.data?.message || "Logout failed due to an error.";
          toast.error(errorMsg); 
          console.error("Logout error:", error.response || error.message || err);
        }
      };

    const goToProfile = () => {
        if (userName) {
            navigate(`/profile/${userName}`);
        }
        setIsOpen(false);
    };

    const goToAdminPage = () => {
        navigate("/admin");
        setIsOpen(false);
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


    const linkClasses = "flex items-center gap-2 px-4 py-2 text-neutral-700 transition text-sm";

    return isLoggedIn ? (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center cursor-pointer rounded-full hover:bg-neutral-700 p-1 transition bg-neutral-800"
            >
                <img
                    className="w-8 h-8 rounded-full"
                    src="https://gravatar.com/avatar/00000000000000000000000000000000?d=mp"
                    alt="avatar"
                />
            </button>

            {isOpen && (
                <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                    <li className="border-b border-gray-100">
                        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-500">
                                <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M19.9975 20C20 17.0067 16.4146 15 12 15C7.58539 15 4 17.0067 4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <span className="block font-medium text-sm text-neutral-700 truncate">
                                {userName}
                            </span>
                        </div>
                    </li>
                    {role === 2 && (
                        <li>
                            <button
                                className={`${linkClasses} hover:bg-blue-50 hover:text-blue-600 w-full text-left`}
                                onClick={goToAdminPage}
                            >
                                <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.6949 3.5C16.6949 3.5 16.0551 3.5 15.4449 3.5C13.6149 3.5 12.4349 4.86 11.9949 6.5M16.6949 3.5C17.0449 3.5 17.9949 3.62 17.9949 4.5C17.9949 5.38 17.0449 5.5 16.6949 5.5M16.6949 3.5V5.5M16.6949 5.5C16.0551 5.5 15.4449 5.5 14.9949 5.5C13.1649 5.5 11.9949 6.86 11.9949 8.5V10.5M16.6949 5.5C17.0449 5.5 17.9949 5.62 17.9949 6.5C17.9949 7.38 17.0449 7.5 16.6949 7.5M16.6949 5.5V7.5M16.6949 7.5C17.0449 7.5 17.9949 7.62 17.9949 8.5C17.9949 9.38 17.0449 9.5 16.6949 9.5M16.6949 7.5V9.5M16.6949 9.5C17.0449 9.5 17.9949 9.62 17.9949 10.5C17.9949 11.38 17.0449 11.5 16.6949 11.5M16.6949 9.5V11.5M7.29489 3.5C7.29489 3.5 7.93485 3.5 8.54489 3.5C10.3749 3.5 11.5549 4.86 11.9949 6.5M7.29489 3.5C6.94489 3.5 6.00487 3.62 6.00487 4.5C6.00487 5.38 6.94489 5.5 7.29489 5.5M7.29489 3.5V5.5M7.29489 5.5C7.93485 5.5 8.54489 5.5 8.99489 5.5C10.8249 5.5 11.9949 6.86 11.9949 8.5V10.5M7.29489 5.5C6.94489 5.5 6.00487 5.62 6.00487 6.5C6.00487 7.38 6.94489 7.5 7.29489 7.5M7.29489 5.5V7.5M7.29489 7.5C6.94489 7.5 6.00487 7.62 6.00487 8.5C6.00487 9.38 6.94489 9.5 7.29489 9.5M7.29489 7.5V9.5M7.29489 9.5C6.94489 9.5 6.00487 9.62 6.00487 10.5C6.00487 11.38 6.94489 11.5 7.29489 11.5M7.29489 9.5V11.5M11.9949 13.5C11.9949 13.5 10.7949 15.5 8.99489 15.5C7.19489 15.5 5.99489 13.5 5.99489 13.5M11.9949 13.5V17.5C11.9949 19.04 10.6549 20.5 8.99489 20.5C7.33489 20.5 5.99489 19.04 5.99489 17.5V13.5M11.9949 13.5H5.99489" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Trang Quản Lý
                            </button>
                        </li>
                    )}
                    <li>
                        <button
                            className={`${linkClasses} hover:bg-pink-50 hover:text-pink-600 w-full text-left`}
                            onClick={goToProfile}
                        >
                            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Account
                        </button>
                    </li>
                 
                    <li className="border-t border-gray-100 my-1"></li>
                    <li>
                        <button
                            className={`${linkClasses} hover:bg-red-50 hover:text-red-600 w-full text-left`}
                            onClick={handleLogout}
                        >
                            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 16.5V19.8C15 20.9201 14.1201 21.8 13 21.8H6.2C5.0799 21.8 4.2 20.9201 4.2 19.8V4.2C4.2 3.0799 5.0799 2.2 6.2 2.2H13C14.1201 2.2 15 3.0799 15 4.2V7.5M11 12H21M21 12L18 15M21 12L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Logout
                        </button>
                    </li>
                </ul>
            )}
        </div>
    ) : (
        <button
            onClick={handleLogin}
            className="flex items-center justify-center w-9 h-9 rounded-full text-neutral-700 border border-neutral-300 hover:bg-neutral-100 transition bg-white"
            aria-label="Login"
        >
            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 7.5V4.2C15 3.0799 14.1201 2.2 13 2.2H6.2C5.0799 2.2 4.2 3.0799 4.2 4.2V19.8C4.2 20.9201 5.0799 21.8 6.2 21.8H13C14.1201 21.8 15 20.9201 15 19.8V16.5M11 12H21M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}