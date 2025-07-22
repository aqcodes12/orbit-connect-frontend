import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api/users";

export default function UserList({ currentUser, onSelectUser }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get(API_URL, {
          params: { exclude: currentUser },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [currentUser]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user.username}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectUser(user.username)}
            >
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
