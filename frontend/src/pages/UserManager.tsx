import { useEffect, useState } from "react";
import { getUsers, User } from "../service/api";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function UserManager() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      if (res.status === 200 && Array.isArray(res.data?.data)) {
        setUsers(res.data.data);
      } else {
        console.error("Failed to load users list:", res.data?.message || res.status);
        toast.error(res.data?.message || "Failed to load users list");
        setUsers([]);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users list due to a network or server error.");
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleLabel = (role: number): string => {
    switch (role) {
      case 0: return "User";
      case 1: return "Premium";
      case 2: return "Admin";
      default: return "Unknown";
    }
  };

  const getRoleStyle = (role: number): string => {
    switch (role) {
      case 0: return "text-blue-400";
      case 1: return "text-yellow-400";
      case 2: return "text-red-500";
      default: return "text-gray-500";
    }
  }

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-6">👤 User Management (View Only)</h2>

      <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-auto">
        <table className="w-full min-w-[400px] text-left table-fixed border-collapse">
          <thead className="sticky top-0 bg-neutral-700 text-gray-300 uppercase text-sm z-10">
            <tr>
              <th className="px-4 py-3 w-3/4 border-b border-neutral-600">Username</th>
              <th className="px-4 py-3 w-1/4 border-b border-neutral-600">Role</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 divide-y divide-neutral-700">
            {users.length > 0 ? users.map((user, index) => (
              <tr key={user.id || index} className={`hover:bg-neutral-700/50 transition duration-150 ease-in-out`}>
                <td className="px-4 py-3 font-medium truncate">{user.username}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold ${getRoleStyle(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={2} className="text-center py-10 text-gray-500 italic">
                  No users found or unable to load user list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManager;