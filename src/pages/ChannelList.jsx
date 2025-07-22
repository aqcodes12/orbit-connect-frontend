import { useState, useEffect } from "react";
import {
  getPublicChannels,
  joinChannel,
  leaveChannel,
} from "../services/channelService";
import { NavLink, useNavigate } from "react-router-dom";

export default function ChannelList({ currentUser }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchChannels() {
      try {
        const res = await getPublicChannels();
        setChannels(res.data);
      } catch (err) {
        console.error("Failed to fetch channels", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const handleJoin = async (channelId) => {
    try {
      await joinChannel(channelId, currentUser);
      navigate(`/chat/group/${channelId}`);
    } catch (err) {
      console.error("Failed to join channel", err);
    }
  };

  const handleLeave = async (channelId) => {
    try {
      await leaveChannel(channelId, currentUser);
      // Optionally update channels or UI here
      setChannels((prev) => prev.filter((c) => c._id !== channelId));
    } catch (err) {
      console.error("Failed to leave channel", err);
    }
  };

  if (loading) return <p>Loading channels...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Public Channels</h2>
      <NavLink
        to="/channels/new"
        className={({ isActive }) =>
          isActive ? "underline" : "hover:underline"
        }
      >
        Create Channel
      </NavLink>

      {channels.length === 0 ? (
        <p>No channels available</p>
      ) : (
        <ul>
          {channels.map((channel) => {
            const isMember = channel.members.includes(currentUser);
            return (
              <li
                key={channel._id}
                className="p-2 border-b flex justify-between items-center hover:bg-gray-100 cursor-pointer"
              >
                <div
                  className="flex-grow"
                  onClick={() => {
                    if (isMember) navigate(`/chat/group/${channel._id}`);
                    else handleJoin(channel._id);
                  }}
                >
                  <strong>{channel.name}</strong>
                  {channel.description && (
                    <div className="text-sm text-gray-600">
                      {channel.description}
                    </div>
                  )}
                </div>
                {isMember ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeave(channel._id);
                    }}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoin(channel._id);
                    }}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Join
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
