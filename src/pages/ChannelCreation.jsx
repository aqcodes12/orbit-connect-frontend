import { useState } from "react";
import { createChannel } from "../services/channelService";
import { useNavigate } from "react-router-dom";

export default function ChannelCreation({ currentUser }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }

    try {
      await createChannel(name, description, currentUser);
      setSuccess("Channel created successfully!");
      setName("");
      setDescription("");
      // Redirect to channels list after creation
      setTimeout(() => navigate("/channels"), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create channel");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border rounded mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Create New Channel</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && <p className="text-green-600 mb-3">{success}</p>}

      <input
        type="text"
        placeholder="Channel Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        rows={4}
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Create Channel
      </button>
    </form>
  );
}
