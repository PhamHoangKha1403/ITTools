import { useEffect, useState } from "react";
import { getUsers, changeUserRole } from "../service/api";
import { toast } from "react-toastify";

interface User {
  userName: string;
  role: number; // 0 = user, 1 = premium, 2 = admin
}

function UserManager() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = () => {
    getUsers()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users list"));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (userName: string, newRole: number) => {
    try {
      await changeUserRole(userName, newRole);
      toast.success("User role updated!");
      fetchUsers();
    } catch {
      toast.error("Failed to update user role");
    }
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0:
        return "User";
      case 1:
        return "Premium";
      case 2:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-6">👤 User Management</h2>
      <div className="bg-neutral-900 rounded-md p-6 shadow-lg border border-neutral-700 overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-neutral-800 text-white">
            <tr>
              <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Username</th>
              <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Role</th>
              <th className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userName} className="hover:bg-neutral-800 transition">
                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">{user.userName}</td>
                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800">{getRoleLabel(user.role)}</td>
                <td className="px-4 py-3 border-b border-neutral-700 bg-neutral-800 flex gap-3 flex-wrap">
                  {user.role < 2 && (
                    <button
                      className="text-yellow-400 hover:text-yellow-300 hover:underline transition text-sm"
                      onClick={() =>
                        handleChangeRole(user.userName, user.role + 1)
                      }
                    >
                      ✨ Promote
                    </button>
                  )}
                  {user.role > 0 && (
                    <button
                      className="text-orange-400 hover:text-orange-300 hover:underline transition text-sm"
                      onClick={() =>
                        handleChangeRole(user.userName, user.role - 1)
                      }
                    >
                      🔁 Demote
                    </button>
                  )}
                  {user.role < 2 && (
                    <button
                      className="text-red-500 hover:text-red-400 hover:underline transition text-sm"
                      onClick={() => toast("Delete not implemented")}
                    >
                      🗑 Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManager;
