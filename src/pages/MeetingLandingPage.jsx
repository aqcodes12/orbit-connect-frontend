import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function MeetingLandingPage() {
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  // Generate new meeting ID and navigate to it
  const createNewMeeting = () => {
    const meetingId = uuidv4(); // unique meeting ID
    navigate(`/meeting/${meetingId}`);
  };

  // Join meeting by code/link entered
  const joinMeeting = () => {
    if (!joinCode.trim()) return;
    // If user entered full URL, extract meeting ID from it
    const id = joinCode.includes("meeting/")
      ? joinCode.split("meeting/")[1]
      : joinCode;
    navigate(`/meeting/${id}`);
  };

  return (
    <div className="landing-page max-w-3xl mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-6">
        Video calls and meetings for everyone
      </h1>
      <p className="mb-10 text-lg text-gray-700">
        Connect, collaborate and celebrate from anywhere with your own instant
        meetings.
      </p>

      <button
        onClick={createNewMeeting}
        className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold mb-6"
      >
        New Meeting
      </button>

      <div className="join-meeting flex justify-center gap-4">
        <input
          type="text"
          placeholder="Enter a code or link"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="border rounded px-4 py-2 w-72"
        />
        <button
          onClick={joinMeeting}
          className="bg-gray-300 px-4 rounded hover:bg-gray-400"
        >
          Join
        </button>
      </div>
    </div>
  );
}
