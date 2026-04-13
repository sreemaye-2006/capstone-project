import React, { useEffect, useState } from "react";

function AdminProfile() {
  const [users, setUsers] = useState([]);

  const API = "http://localhost:5000/admin-api";

  // Fetch users
  const fetchUsers = async () => {
    try {
      let res = await fetch(`${API}/users`);
      let data = await res.json();
      setUsers(data.payload);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Block
  const blockUser = async (id) => {
    await fetch(`${API}/block/${id}`, { method: "PUT" });
    fetchUsers();
  };

  // Unblock
  const unblockUser = async (id) => {
    await fetch(`${API}/unblock/${id}`, { method: "PUT" });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        Admin Dashboard
      </h2>

      <div className="max-w-md mx-auto">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="border p-4 mb-3 rounded"
            >
              <p className="font-semibold">
                {user.username}
              </p>

              <p className="text-sm text-gray-600">
                {user.role}
              </p>

              <div className="mt-2">
                {user.isUserActive ? (
                  <button
                    onClick={() => blockUser(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Block
                  </button>
                ) : (
                  <button
                    onClick={() => unblockUser(user._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Unblock
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminProfile;
