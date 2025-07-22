import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { BASE_URL } from "../constants";

const SOCKET_SERVER_URL = `${BASE_URL}`;
const API_URL = `${BASE_URL}/api/messages`;

export default function ChatRoom({ username, isGroupChat = false }) {
  const { chatWith, groupId } = useParams();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef();
  const typingTimeout = useRef();

  // Determine ROOM_ID based on chat type
  const ROOM_ID = isGroupChat
    ? groupId
    : chatWith
    ? [username, chatWith].sort().join("__")
    : null;

  // Redirect if no room ID
  useEffect(() => {
    if (!ROOM_ID) {
      navigate("/");
    }
  }, [ROOM_ID, navigate]);

  useEffect(() => {
    if (!ROOM_ID) return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join_room", { roomId: ROOM_ID, username });

    socketRef.current.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on("user_online", (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on("typing", (usersTyping) => {
      setTypingUsers(usersTyping.filter((u) => u !== username));
    });

    socketRef.current.on("user_offline", (user) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== user));
    });

    return () => {
      socketRef.current.disconnect();
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    };
  }, [ROOM_ID, username]);

  useEffect(() => {
    if (!ROOM_ID) return;

    async function fetchMessages() {
      try {
        const res = await axios.get(`${API_URL}/${ROOM_ID}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
    fetchMessages();
  }, [ROOM_ID]);

  const sendMessage = () => {
    if (newMsg.trim() === "" || !ROOM_ID) return;

    const messageData = {
      sender: username,
      content: newMsg,
      roomId: ROOM_ID,
    };

    socketRef.current.emit("send_message", messageData);
    socketRef.current.emit("stop_typing", { roomId: ROOM_ID, username });
    setNewMsg("");
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);

    if (!ROOM_ID) return;

    socketRef.current.emit("typing", { roomId: ROOM_ID, username });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit("stop_typing", { roomId: ROOM_ID, username });
    }, 1000);
  };

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onBack = () => {
    if (isGroupChat) {
      navigate("/groups");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (isGroupChat && groupId) {
      console.log("isGroupChat, groupId", isGroupChat, groupId);

      // Try fetching from groups API first
      axios
        .get(`${BASE_URL}/api/groups/detail/${groupId}`)
        .then((res) => setGroupName(res.data.name))
        .catch(() => {
          // If groups fetch fails, try channels
          axios
            .get(`${BASE_URL}/api/channels/${groupId}`)
            .then((res) => setGroupName(res.data.name))
            .catch(() => setGroupName("Group Chat"));
        });
    }
  }, [isGroupChat, groupId]);

  console.log("name ", groupName);

  return (
    <div className="max-w-3xl mx-auto h-screen flex flex-col p-4">
      <header className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">
            {isGroupChat ? groupName || "Group Chat" : `Chat with ${chatWith}`}
          </h1>

          <div className="text-sm text-gray-600 mt-1">
            Logged in as: {username}
          </div>
          <div className="text-sm text-green-600 mt-1">
            Online in this chat:{" "}
            {onlineUsers.join(", ") || "No one else online"}
          </div>
          <div className="text-sm italic text-gray-500 mt-1">
            {typingUsers.length > 0
              ? `${typingUsers.join(", ")} typing...`
              : ""}
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-blue-600 underline hover:text-blue-800 whitespace-nowrap"
        >
          ← Back
        </button>
      </header>

      <main className="flex-grow overflow-y-auto border rounded p-4 bg-white">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-3">
            <strong className="text-blue-600">{msg.sender}: </strong>
            <span>{msg.content}</span>
            <div className="text-xs text-gray-400">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </footer>
    </div>
  );
}
