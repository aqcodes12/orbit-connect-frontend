import React from "react";

export default function VideoGrid({ localStream, remoteStream }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "10px",
      }}
    >
      <video
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "auto", backgroundColor: "black" }}
        ref={(video) => {
          if (video && localStream) {
            video.srcObject = localStream;
          }
        }}
      />
      {remoteStream && (
        <video
          autoPlay
          playsInline
          style={{ width: "100%", height: "auto", backgroundColor: "black" }}
          ref={(video) => {
            if (video) {
              video.srcObject = remoteStream;
            }
          }}
        />
      )}
    </div>
  );
}
