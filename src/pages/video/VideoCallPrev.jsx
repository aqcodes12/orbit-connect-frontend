import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../../constants";

const SOCKET_SERVER_URL = `${BASE_URL}`;

export default function VideoCallPrev({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const [screenSharing, setScreenSharing] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.emit("join_room", {
      roomId,
      username: socketRef.current.id,
    });

    socketRef.current.on("offer", async ({ sdp, sender }) => {
      if (!pcRef.current) await startCall(false);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", {
        sdp: answer,
        roomId,
        sender: socketRef.current.id,
      });
    });

    socketRef.current.on("answer", async ({ sdp }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on("ice_candidate", ({ candidate }) => {
      if (!pcRef.current) return;
      pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    startCall(true);

    return () => {
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  async function startCall(isOfferer) {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setWebcamStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, stream);
      });
    } catch (err) {
      console.error("Error accessing media devices.", err);
      return;
    }

    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice_candidate", {
          candidate: event.candidate,
          roomId,
          sender: socketRef.current.id,
        });
      }
    };

    if (isOfferer) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("offer", {
        sdp: offer,
        roomId,
        sender: socketRef.current.id,
      });
    }
  }

  async function toggleScreenShare() {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        const sender = pcRef.current
          .getSenders()
          .find((s) => s.track.kind === "video");
        await sender.replaceTrack(screenTrack);

        screenTrack.onended = () => {
          if (webcamStream) {
            sender.replaceTrack(webcamStream.getVideoTracks()[0]);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = webcamStream;
            }
          }
          setScreenSharing(false);
        };

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen sharing error:", err);
      }
    } else {
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track.kind === "video");
      sender.replaceTrack(webcamStream.getVideoTracks()[0]);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = webcamStream;
      }
      setScreenSharing(false);
    }
  }

  function toggleMic() {
    if (!webcamStream) return;
    webcamStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicOn((prev) => !prev);
  }

  function toggleVideo() {
    if (!webcamStream) return;
    webcamStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setVideoOn((prev) => !prev);
  }

  function endCall() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setScreenSharing(false);
    setMicOn(true);
    setVideoOn(true);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }

  return (
    <div>
      <h2>Video Call Room: {roomId}</h2>
      <div style={{ display: "flex", gap: 10 }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: 300, height: 200, backgroundColor: "black" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{ width: 300, height: 200, backgroundColor: "black" }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={toggleMic}>{micOn ? "Mute Mic" : "Unmute Mic"}</button>
        <button onClick={toggleVideo}>
          {videoOn ? "Stop Video" : "Start Video"}
        </button>
        <button onClick={toggleScreenShare}>
          {screenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          onClick={endCall}
          style={{ backgroundColor: "red", color: "white", marginLeft: 10 }}
        >
          End Call
        </button>
      </div>
    </div>
  );
}
