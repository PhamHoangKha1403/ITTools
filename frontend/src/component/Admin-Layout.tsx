import { Outlet, Link } from 'react-router-dom';
import Header from '../component/partials/Header';
import Footer from '../component/partials/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLayout() {

  return (
    // Áp dụng layout-content ở đây giống trang khách hàng
    // Bỏ flex, thêm relative
    <div className="min-h-screen bg-neutral-900 text-white font-sans relative layout-content">
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

      {/* Sidebar cố định */}
      <aside className="fixed top-0 left-0 z-30 w-60 h-screen bg-neutral-800 p-4 flex flex-col border-r border-neutral-700/50">
        <div className="text-center mb-5 flex-shrink-0">
          <h2 className="text-xl font-semibold text-emerald-400"> Admin Panel</h2>
        </div>
        <nav className="space-y-1.5 flex-grow overflow-y-auto custom-scroll min-h-0">
          <Link to="/admin" className="block py-1.5 px-3 rounded hover:bg-neutral-700 hover:text-emerald-400 transition">Dashboard</Link>
          <Link to="/admin/users" className="block py-1.5 px-3 rounded hover:bg-neutral-700 hover:text-emerald-400 transition">User Manager</Link>
          <Link to="/admin/tools" className="block py-1.5 px-3 rounded hover:bg-neutral-700 hover:text-emerald-400 transition">Tool Manager</Link>
          <Link to="/admin/tools/add" className="block py-1.5 px-3 rounded hover:bg-neutral-700 hover:text-emerald-400 transition">Add Tool</Link>
          <Link to="/admin/premium-requests" className="block py-1.5 px-3 rounded hover:bg-neutral-700 hover:text-emerald-400 transition">Premium Requests</Link>
        </nav>
        <div className="mt-auto pt-4 flex-shrink-0 border-t border-neutral-700/50">
          <Link to="/" className="block text-sm text-center text-neutral-400 hover:text-blue-400 transition">← Back to Home</Link>
        </div>
      </aside>

      {/* Nội dung chính bị đẩy sang phải */}
      {/* Thêm ml-60, bỏ flex-1, giữ flex flex-col min-h-screen */}
      <div className="ml-60 flex flex-col min-h-screen min-w-0">
        <div className="flex-shrink-0 border-b border-neutral-700/50">
          <Header toggleSidebar={() => { console.warn("Admin sidebar is fixed.") }} />
        </div>

        {/* Thẻ main bây giờ chỉ cần flex-grow và padding, không cần overflow */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>

        <div className="flex-shrink-0 border-t border-neutral-700/50">
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;