import { writable } from 'svelte/store';

export interface VideoSession {
  id: string;
  mission_id: string;
  patient_id: string;
  professional_id: string;
  status: 'pending' | 'active' | 'ended';
  started_at: string | null;
  ended_at: string | null;
  room_id: string;
}

function createVideoStore() {
  const { subscribe, set, update } = writable<{
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isInCall: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    session: VideoSession | null;
  }>({
    localStream: null,
    remoteStream: null,
    isInCall: false,
    isMuted: false,
    isVideoOff: false,
    session: null
  });

  let peerConnection: RTCPeerConnection | null = null;

  const config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  return {
    subscribe,

    startLocalStream: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        update(s => ({ ...s, localStream: stream }));
        return stream;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        return null;
      }
    },

    toggleMute: () => {
      update(s => {
        if (s.localStream) {
          s.localStream.getAudioTracks().forEach(track => {
            track.enabled = s.isMuted;
          });
        }
        return { ...s, isMuted: !s.isMuted };
      });
    },

    toggleVideo: () => {
      update(s => {
        if (s.localStream) {
          s.localStream.getVideoTracks().forEach(track => {
            track.enabled = s.isVideoOff;
          });
        }
        return { ...s, isVideoOff: !s.isVideoOff };
      });
    },

    startCall: async (roomId: string) => {
      peerConnection = new RTCPeerConnection(config);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      update(s => ({ ...s, localStream: stream, isInCall: true }));

      stream.getTracks().forEach(track => {
        peerConnection?.addTrack(track, stream);
      });

      peerConnection.ontrack = (event) => {
        update(s => ({ ...s, remoteStream: event.streams[0] }));
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send to signaling server (Supabase in real app)
          console.log('ICE candidate:', event.candidate);
        }
      };

      return peerConnection;
    },

    endCall: () => {
      update(s => {
        if (s.localStream) {
          s.localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection) {
          peerConnection.close();
          peerConnection = null;
        }
        return {
          localStream: null,
          remoteStream: null,
          isInCall: false,
          isMuted: false,
          isVideoOff: false,
          session: null
        };
      });
    },

    createOffer: async () => {
      if (!peerConnection) return null;
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      return offer;
    },

    handleOffer: async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnection) return null;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    },

    handleAnswer: async (answer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    },

    addIceCandidate: async (candidate: RTCIceCandidateInit) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  };
}

export const videoCall = createVideoStore();
