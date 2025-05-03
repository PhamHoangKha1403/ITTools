import { useState } from 'react';
import Header from './partials/Header'
import Footer from './partials/Footer'
import { Outlet } from 'react-router-dom'
import Sidebar from './partials/Sidebar'
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';  


function Layout() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        console.log('Toggling sidebar...');
        setIsSidebarVisible(prev => !prev);
    };

    return (
        <div className="flex min-h-screen bg-neutral-900  text-white font-sans layout-content ">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                style={{ zIndex: 9999 }}
            />
            <Sidebar isVisible={isSidebarVisible} />
            <div className={`flex  flex-1 flex-col justify-between transition-all duration-500 ${isSidebarVisible ? 'ml-60' : 'ml-0'}`}>
                <Header toggleSidebar={toggleSidebar} />
                <div className="pt-4 ">
                    <Outlet />
                </div>

                <Footer />

            </div>
        </div>
    );
}

export default Layout;
