import React from "react";

export default function VideoControls({
  micOn,
  videoOn,
  screenSharing,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
}) {
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
      <button onClick={onToggleMic}>{micOn ? "Mute Mic" : "Unmute Mic"}</button>
      <button onClick={onToggleVideo}>
        {videoOn ? "Stop Video" : "Start Video"}
      </button>
      <button onClick={onToggleScreenShare}>
        {screenSharing ? "Stop Sharing" : "Share Screen"}
      </button>
      <button
        onClick={onEndCall}
        style={{ backgroundColor: "red", color: "white", marginLeft: 10 }}
      >
        End Call
      </button>
    </div>
  );
}
