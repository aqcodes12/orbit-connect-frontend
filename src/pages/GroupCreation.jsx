import { useState, useEffect } from "react";
import { createGroup } from "../services/groupService";
import axios from "axios";
import { BASE_URL } from "../constants";

const API_USERS = `${BASE_URL}/api/users`;

export default function GroupCreation({ currentUser, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.get(API_USERS, {
          params: { exclude: currentUser },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsers();
  }, [currentUser]);

  const toggleMember = (username) => {
    setSelectedMembers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }
    if (selectedMembers.length === 0) {
      setError("Select at least one member");
      return;
    }

    setError("");
    try {
      await createGroup(
        groupName,
        [...selectedMembers, currentUser],
        currentUser
      );
      setSuccess("Group created successfully!");
      setGroupName("");
      setSelectedMembers([]);
      onGroupCreated(); // notify parent to refresh groups list or close form
    } catch {
      setError("Failed to create group");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border rounded"
    >
      <h2 className="text-2xl mb-4 font-bold">Create New Group</h2>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />
      <div className="mb-3 max-h-40 overflow-auto border rounded p-2">
        {users.map((user) => (
          <label key={user.username} className="block">
            <input
              type="checkbox"
              checked={selectedMembers.includes(user.username)}
              onChange={() => toggleMember(user.username)}
              className="mr-2"
            />
            {user.username}
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Create Group
      </button>
    </form>
  );
}
