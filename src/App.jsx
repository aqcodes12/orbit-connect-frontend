import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserList from "./pages/UserList";
import GroupList from "./pages/GroupList";
import GroupCreation from "./pages/GroupCreation";
import ChatRoom from "./pages/ChatRoom";
import ChannelList from "./pages/ChannelList";
import ChannelCreation from "./pages/ChannelCreation";
import VideoCall from "./pages/video/VideoCall";
import NavV2 from "./components/NavV2";
import MeetingLandingPage from "./pages/MeetingLandingPage";
import VideoCallWrapper from "./pages/VideoCallWrapper";

function UsersPage({ currentUser }) {
  const navigate = useNavigate();
  const handleSelectUser = (username) => {
    navigate(`/chat/user/${username}`);
  };
  return <UserList currentUser={currentUser} onSelectUser={handleSelectUser} />;
}

function GroupsPage({ currentUser }) {
  const navigate = useNavigate();
  const handleSelectGroup = (group) => {
    navigate(`/chat/group/${group._id}`);
  };
  return (
    <GroupList currentUser={currentUser} onSelectGroup={handleSelectGroup} />
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("username");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    setUser(null);
    navigate("/login");
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route
          path="/signup"
          element={<Signup onSignup={() => navigate("/login")} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-0 relative min-h-screen flex flex-col">
      <NavV2 username={user} onLogout={handleLogout} />
      <main className="flex-grow p-4">
        <Routes>
          <Route path="/" element={<UsersPage currentUser={user} />} />
          <Route path="/groups" element={<GroupsPage currentUser={user} />} />
          <Route
            path="/groups/new"
            element={<GroupCreation currentUser={user} />}
          />
          <Route
            path="/chat/user/:chatWith"
            element={<ChatRoom username={user} />}
          />
          <Route
            path="/chat/group/:groupId"
            element={<ChatRoom username={user} isGroupChat />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/channels"
            element={<ChannelList currentUser={user} />}
          />
          <Route
            path="/channels/new"
            element={<ChannelCreation currentUser={user} />}
          />
          <Route path="/meet" element={<MeetingLandingPage />} />
          <Route path="/meeting/:roomId" element={<VideoCallWrapper />} />
        </Routes>
      </main>
    </div>
  );
}
