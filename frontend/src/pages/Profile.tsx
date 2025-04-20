import React, { useEffect, useState } from 'react';

function Profile() {
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('role');
    setUserName(storedUser);
    setRole(storedRole);
  }, []);

  const requestUpgrade = () => {
    alert("Upgrade request has been sent to the admin! 💎");
  };

  return (
    <div className="text-white p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">👤 Profile</h2>
      <div className="bg-neutral-700 p-4 rounded-lg shadow mb-6 space-y-2">
        <p><strong>Username:</strong> {userName}</p>
        <p><strong>Account Type:</strong> {
          role === "2" ? "Admin" : role === "1" ? "Premium" : "Regular"
        }</p>
      </div>

      {role !== "2" && role !== "1" && (
        <button
          onClick={requestUpgrade}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
        >
          Request Premium Upgrade
        </button>
      )}
    </div>
  );
}

export default Profile;
