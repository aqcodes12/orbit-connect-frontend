// import React, { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import { BASE_URL } from "../../constants";
// import VideoGrid from "./VideoGrid";
// import VideoControls from "./VideoControls";

// const SOCKET_SERVER_URL = `${BASE_URL}`;

// export default function VideoCall({ roomId }) {
//   const pcRef = useRef(null);
//   const socketRef = useRef(null);

//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const [micOn, setMicOn] = useState(true);
//   const [videoOn, setVideoOn] = useState(true);

//   useEffect(() => {
//     socketRef.current = io(SOCKET_SERVER_URL);

//     socketRef.current.emit("join_room", {
//       roomId,
//       username: socketRef.current.id,
//     });

//     socketRef.current.on("offer", async ({ sdp, sender }) => {
//       if (!pcRef.current) await startCall(false);
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);
//       socketRef.current.emit("answer", {
//         sdp: answer,
//         roomId,
//         sender: socketRef.current.id,
//       });
//     });

//     socketRef.current.on("answer", async ({ sdp }) => {
//       if (!pcRef.current) return;
//       await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
//     });

//     socketRef.current.on("ice_candidate", ({ candidate }) => {
//       if (!pcRef.current) return;
//       pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     startCall(true);

//     return () => {
//       endCall();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [roomId]);

//   async function startCall(isOfferer) {
//     pcRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true,
//       });
//       setLocalStream(stream);

//       stream.getTracks().forEach((track) => {
//         pcRef.current.addTrack(track, stream);
//       });
//     } catch (err) {
//       console.error("Error accessing media devices.", err);
//       return;
//     }

//     pcRef.current.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//     };

//     pcRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("ice_candidate", {
//           candidate: event.candidate,
//           roomId,
//           sender: socketRef.current.id,
//         });
//       }
//     };

//     if (isOfferer) {
//       const offer = await pcRef.current.createOffer();
//       await pcRef.current.setLocalDescription(offer);
//       socketRef.current.emit("offer", {
//         sdp: offer,
//         roomId,
//         sender: socketRef.current.id,
//       });
//     }
//   }

//   async function toggleScreenShare() {
//     if (!screenSharing) {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//         });
//         const screenTrack = screenStream.getVideoTracks()[0];

//         const sender = pcRef.current
//           .getSenders()
//           .find((s) => s.track.kind === "video");
//         await sender.replaceTrack(screenTrack);

//         screenTrack.onended = () => {
//           if (localStream) {
//             sender.replaceTrack(localStream.getVideoTracks()[0]);
//           }
//           setScreenSharing(false);
//         };

//         setLocalStream(screenStream);
//         setScreenSharing(true);
//       } catch (err) {
//         console.error("Screen sharing error:", err);
//       }
//     } else {
//       const sender = pcRef.current
//         .getSenders()
//         .find((s) => s.track.kind === "video");
//       sender.replaceTrack(localStream.getVideoTracks()[0]);
//       setLocalStream(localStream);
//       setScreenSharing(false);
//     }
//   }

//   function toggleMic() {
//     if (!localStream) return;
//     localStream.getAudioTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setMicOn((prev) => !prev);
//   }

//   function toggleVideo() {
//     if (!localStream) return;
//     localStream.getVideoTracks().forEach((track) => {
//       track.enabled = !track.enabled;
//     });
//     setVideoOn((prev) => !prev);
//   }

//   function endCall() {
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//     setScreenSharing(false);
//     setMicOn(true);
//     setVideoOn(true);
//     setRemoteStream(null);
//   }

//   return (
//     <div>
//       <h2>Video Call Room: {roomId}</h2>
//       <VideoGrid localStream={localStream} remoteStream={remoteStream} />
//       <VideoControls
//         micOn={micOn}
//         videoOn={videoOn}
//         screenSharing={screenSharing}
//         onToggleMic={toggleMic}
//         onToggleVideo={toggleVideo}
//         onToggleScreenShare={toggleScreenShare}
//         onEndCall={endCall}
//       />
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer/simplepeer.min.js";
import { io } from "socket.io-client";
import { BASE_URL } from "../../constants";
import VideoControls from "./VideoControls";

const SOCKET_SERVER_URL = BASE_URL;

export default function VideoCall({ roomId }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peersRef = useRef({});
  const socketRef = useRef();
  const localVideoRef = useRef();

  // Step 1: Initialize socket and local stream
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    getLocalStream().then(() => {
      // Wait slightly to allow video/audio tracks to fully bind
      setTimeout(() => {
        socketRef.current.emit("join_room", {
          roomId,
          username: socketRef.current.id,
        });
      }, 300);
    });

    return () => {
      endCall();
    };
  }, []);

  // Step 2: Setup peer events only after localStream is ready
  useEffect(() => {
    if (!localStream || !socketRef.current) return;

    const socket = socketRef.current;

    socket.on("all-users", (users) => {
      users.forEach((userId) => {
        if (!peersRef.current[userId]) {
          console.log("Creating peer (initiator=true):", userId);
          const peer = createPeer(userId, true);
          if (peer) peersRef.current[userId] = peer;
        }
      });
    });

    socket.on("user-joined", (userId) => {
      if (!peersRef.current[userId]) {
        console.log("Creating peer (initiator=false):", userId);
        const peer = createPeer(userId, false);
        if (peer) peersRef.current[userId] = peer;
      }
    });

    socket.on("signal", ({ from, signal }) => {
      console.log("Received signal from:", from);
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      }
    });

    socket.on("user-disconnected", (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    });

    return () => {
      socket.off("all-users");
      socket.off("user-joined");
      socket.off("signal");
      socket.off("user-disconnected");
    };
  }, [localStream]);

  // Get local media stream
  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
    }
  };

  const createPeer = (remoteSocketId, initiator) => {
    if (!localStream) {
      console.warn("⏳ Tried to create peer before localStream was ready.");
      return null;
    }

    console.log("Creating peer:", remoteSocketId, "Initiator:", initiator);

    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: localStream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", {
        to: remoteSocketId,
        signal,
      });
    });

    peer.on("stream", (stream) => {
      console.log("📹 Stream received from", remoteSocketId);
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteSocketId]: stream,
      }));
    });

    peer.on("error", (err) => console.error("Peer error:", err));

    peer.on("close", () => {
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[remoteSocketId];
        return updated;
      });
    });

    return peer;
  };

  const toggleMic = () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = isMicMuted;
    });
    setIsMicMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOff;
    });
    setIsCameraOff((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      replaceVideoTrack(screenTrack);

      screenTrack.onended = () => {
        replaceVideoTrack(localStream.getVideoTracks()[0]);
        setIsScreenSharing(false);
      };

      setIsScreenSharing(true);
    } else {
      replaceVideoTrack(localStream.getVideoTracks()[0]);
      setIsScreenSharing(false);
    }
  };

  const replaceVideoTrack = (newTrack) => {
    Object.values(peersRef.current).forEach((peer) => {
      const sender = peer._pc
        .getSenders()
        .find((s) => s.track.kind === "video");
      if (sender) sender.replaceTrack(newTrack);
    });
    localVideoRef.current.srcObject = isScreenSharing
      ? new MediaStream([newTrack])
      : localStream;
  };

  const endCall = () => {
    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    peersRef.current = {};
    socketRef.current.disconnect();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStreams({});
  };

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <div className="videos" style={{ display: "flex", flexWrap: "wrap" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          width="320"
          height="240"
        />
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <video
            key={id}
            autoPlay
            playsInline
            width="320"
            height="240"
            ref={(video) => {
              if (video) video.srcObject = stream;
            }}
          />
        ))}
      </div>
      <VideoControls
        micOn={!isMicMuted}
        videoOn={!isCameraOff}
        screenSharing={isScreenSharing}
        onToggleMic={toggleMic}
        onToggleVideo={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={endCall}
      />
    </div>
  );
}
