import { useState } from 'react';
import Header from './partials/Header'
import Footer from './partials/Footer'
import { Outlet } from 'react-router-dom'
import Sidebar from './partials/Sidebar'


function Layout() {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const toggleSidebar = () => {
        console.log('Toggling sidebar...');
        setIsSidebarVisible(prev => !prev);
    };

    return (
        <div className="flex min-h-screen bg-neutral-900  text-white font-sans layout-content ">
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
