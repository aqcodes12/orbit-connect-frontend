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
import { io } from "socket.io-client";
import { BASE_URL } from "../../constants"; // adjust your import path
import VideoGrid from "./VideoGrid";
import VideoControls from "./VideoControls";

const SOCKET_SERVER_URL = `${BASE_URL}`;
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function VideoCall({ roomId }) {
  const socketRef = useRef(null);
  const pcs = useRef(new Map()); // peerId -> RTCPeerConnection
  const localVideoRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // peerId -> MediaStream
  const [screenSharing, setScreenSharing] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);

    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Join the room and announce presence
        socketRef.current.emit("join_room", {
          roomId,
          username: socketRef.current.id,
        });
      } catch (err) {
        console.error("Error accessing media devices", err);
      }
    };

    setupLocalStream();

    // New user joined, create offer for them
    socketRef.current.on("user-joined", (peerId) => {
      if (peerId === socketRef.current.id) return;
      createOffer(peerId);
    });

    // Offer received from peer
    socketRef.current.on("offer", async ({ sdp, sender }) => {
      if (sender === socketRef.current.id) return;
      await handleOffer(sdp, sender);
    });

    // Answer received from peer
    socketRef.current.on("answer", async ({ sdp, sender }) => {
      if (sender === socketRef.current.id) return;
      const pc = pcs.current.get(sender);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // ICE candidate received from peer
    socketRef.current.on("ice_candidate", ({ candidate, sender }) => {
      if (sender === socketRef.current.id) return;
      const pc = pcs.current.get(sender);
      if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Peer left room
    socketRef.current.on("user-left", (peerId) => {
      const pc = pcs.current.get(peerId);
      if (pc) {
        pc.close();
        pcs.current.delete(peerId);
      }
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[peerId];
        return updated;
      });
    });

    return () => {
      endCall();
    };
  }, [roomId]);

  async function createOffer(peerId) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcs.current.set(peerId, pc);

    // Add local stream tracks to connection
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // When remote stream arrives, add it
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
    };

    // Send ICE candidates to signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice_candidate", {
          candidate: event.candidate,
          roomId,
          sender: socketRef.current.id,
          receiver: peerId,
        });
      }
    };

    // Create and send offer SDP
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit("offer", {
      sdp: offer,
      roomId,
      sender: socketRef.current.id,
      receiver: peerId,
    });
  }

  async function handleOffer(sdp, sender) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcs.current.set(sender, pc);

    // Add local stream tracks
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    // When remote stream arrives, add it
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [sender]: event.streams[0] }));
    };

    // Send ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice_candidate", {
          candidate: event.candidate,
          roomId,
          sender: socketRef.current.id,
          receiver: sender,
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      sdp: answer,
      roomId,
      sender: socketRef.current.id,
      receiver: sender,
    });
  }

  async function toggleScreenShare() {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        pcs.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => {
          pcs.current.forEach((pc) => {
            const sender = pc
              .getSenders()
              .find((s) => s.track.kind === "video");
            if (sender) sender.replaceTrack(localStream.getVideoTracks()[0]);
          });
          setScreenSharing(false);
        };

        if (localVideoRef.current)
          localVideoRef.current.srcObject = screenStream;
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen sharing error:", err);
      }
    } else {
      pcs.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(localStream.getVideoTracks()[0]);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      setScreenSharing(false);
    }
  }

  function toggleMic() {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn(!micOn);
  }

  function toggleVideo() {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !videoOn;
    });
    setVideoOn(!videoOn);
  }

  function endCall() {
    pcs.current.forEach((pc) => pc.close());
    pcs.current.clear();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setRemoteStreams({});
    setScreenSharing(false);
    setMicOn(true);
    setVideoOn(true);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }

  return (
    <div>
      <h2>Video Call Room: {roomId}</h2>
      <VideoGrid
        localStream={localStream}
        remoteStreams={remoteStreams}
        localVideoRef={localVideoRef}
      />
      <VideoControls
        micOn={micOn}
        videoOn={videoOn}
        screenSharing={screenSharing}
        onToggleMic={toggleMic}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onEndCall={endCall}
      />
    </div>
  );
}
