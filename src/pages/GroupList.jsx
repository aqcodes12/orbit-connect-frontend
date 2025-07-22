import { useEffect, useState } from "react";
import { getGroupsForUser } from "../services/groupService";

export default function GroupList({ currentUser, onSelectGroup }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await getGroupsForUser(currentUser);
        setGroups(res.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    }
    fetchGroups();
  }, [currentUser]);

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Your Groups</h2>
      {groups.length === 0 ? (
        <p>No groups found</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li
              key={group._id}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectGroup(group)}
            >
              {group.name} ({group.members.length} members)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
