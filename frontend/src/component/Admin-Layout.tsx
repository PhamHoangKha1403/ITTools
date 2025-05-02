import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-neutral-900 text-white">
      <aside className="w-60 bg-neutral-800 p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">🛠 Admin Panel</h2>
        <nav className="space-y-2">
          <Link to="/admin" className="block hover:text-emerald-400">Dashboard</Link>
          <Link to="/admin/users" className="block hover:text-emerald-400">User Manager</Link>
          <Link to="/admin/tools" className="block hover:text-emerald-400">Tool Manager</Link>
          <Link to="/admin/tools/add" className="block hover:text-emerald-400">Add Tool</Link>
          <Link to="/admin/premium-requests" className="block hover:text-emerald-400">Premium Requests</Link>
 
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
