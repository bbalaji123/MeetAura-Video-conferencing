import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useAuthUser } from "../hooks/useAuthUser";
import { useCallContext } from "../hooks/useCallContext";
import { getStreamToken, getMyFriends } from "../lib/api";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import {
  Users,
  Copy,
  Share2,
  ArrowLeft,
  Home,
  Phone,
  Loader2,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

import "@stream-io/video-react-sdk/dist/css/styles.css";

// Custom Call Controls Component with MUI Icons
const CustomCallControls = ({ onLeave }) => {
  const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
  const { microphone, isMute } = useMicrophoneState();
  const { camera, isMute: isCameraMute } = useCameraState();
  const { screenShare, isMute: isScreenShareMute } = useScreenShareState();

  const toggleMic = async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to toggle microphone");
    }
  };

  const toggleCamera = async () => {
    try {
      await camera.toggle();
    } catch (error) {
      console.error("Error toggling camera:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (error) {
      console.error("Error toggling screen share:", error);
      toast.error("Failed to toggle screen share");
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-slate-700">
      {/* Microphone Button */}
      <button
        onClick={toggleMic}
        className={`relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isMute
            ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        } shadow-lg hover:shadow-2xl`}
        title={isMute ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isMute ? (
          <MicOffIcon className="text-white" sx={{ fontSize: 28 }} />
        ) : (
          <MicIcon className="text-white" sx={{ fontSize: 28 }} />
        )}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-300 whitespace-nowrap">
            {isMute ? "Unmute" : "Mute"}
          </span>
        </div>
      </button>

      {/* Camera Button */}
      <button
        onClick={toggleCamera}
        className={`relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isCameraMute
            ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            : "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        } shadow-lg hover:shadow-2xl`}
        title={isCameraMute ? "Turn On Camera" : "Turn Off Camera"}
      >
        {isCameraMute ? (
          <VideocamOffIcon className="text-white" sx={{ fontSize: 30 }} />
        ) : (
          <VideocamIcon className="text-white" sx={{ fontSize: 30 }} />
        )}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-300 whitespace-nowrap">
            {isCameraMute ? "Camera On" : "Camera Off"}
          </span>
        </div>
      </button>

      {/* Screen Share Button */}
      <button
        onClick={toggleScreenShare}
        className={`relative group flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isScreenShareMute
            ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            : "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        } shadow-lg hover:shadow-2xl`}
        title={isScreenShareMute ? "Share Screen" : "Stop Sharing"}
      >
        {isScreenShareMute ? (
          <ScreenShareIcon className="text-white" sx={{ fontSize: 28 }} />
        ) : (
          <StopScreenShareIcon className="text-white" sx={{ fontSize: 28 }} />
        )}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-300 whitespace-nowrap">
            {isScreenShareMute ? "Share" : "Stop"}
          </span>
        </div>
      </button>

      {/* End Call Button */}
      <button
        onClick={onLeave}
        className="relative group flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ml-2"
        title="End Call"
      >
        <CallEndIcon className="text-white" sx={{ fontSize: 32 }} />
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-300 whitespace-nowrap">End Call</span>
        </div>
      </button>
    </div>
  );
};

// Custom styles to fix Stream SDK button visibility on dark theme
const streamCustomStyles = `
  /* Main call controls container */
  .str-video__call-controls {
    display: flex !important;
    gap: 20px !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px 32px !important;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    border-radius: 24px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    border: 1px solid #334155 !important;
  }

  /* All buttons in call controls */
  .str-video__call-controls button,
  .str-video__call-controls__button,
  .str-video__composite-button__button {
    background-color: #3b82f6 !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 50% !important;
    width: 60px !important;
    height: 60px !important;
    min-width: 60px !important;
    min-height: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    cursor: pointer !important;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
    position: relative !important;
  }

  .str-video__call-controls button:hover,
  .str-video__call-controls__button:hover,
  .str-video__composite-button__button:hover {
    background-color: #2563eb !important;
    transform: scale(1.1) translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5) !important;
  }

  .str-video__call-controls button:active,
  .str-video__call-controls__button:active {
    transform: scale(0.95) !important;
  }

  /* All SVG icons - make them white and visible */
  .str-video__call-controls svg,
  .str-video__call-controls button svg,
  .str-video__call-controls__button svg,
  .str-video__composite-button svg,
  .str-video__composite-button__button svg {
    width: 28px !important;
    height: 28px !important;
    color: #ffffff !important;
    fill: currentColor !important;
    stroke: currentColor !important;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)) !important;
  }

  /* Microphone button */
  .str-video__call-controls button[title*="Mic"],
  .str-video__call-controls button[aria-label*="Mic"],
  .str-video__call-controls button[title*="microphone"],
  .str-video__call-controls button[aria-label*="microphone"] {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;
  }

  .str-video__call-controls button[title*="Mic"]:hover,
  .str-video__call-controls button[aria-label*="Mic"]:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5) !important;
  }

  /* Video/Camera button */
  .str-video__call-controls button[title*="Video"],
  .str-video__call-controls button[aria-label*="Video"],
  .str-video__call-controls button[title*="Camera"],
  .str-video__call-controls button[aria-label*="Camera"] {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4) !important;
  }

  .str-video__call-controls button[title*="Video"]:hover,
  .str-video__call-controls button[aria-label*="Video"]:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.5) !important;
  }

  /* Screen share button */
  .str-video__call-controls button[title*="Screen"],
  .str-video__call-controls button[aria-label*="Screen"],
  .str-video__call-controls button[title*="Share"],
  .str-video__call-controls button[aria-label*="Share"] {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4) !important;
  }

  .str-video__call-controls button[title*="Screen"]:hover,
  .str-video__call-controls button[aria-label*="Screen"]:hover {
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5) !important;
  }

  /* End call / danger button - RED */
  .str-video__call-controls__button--variant-danger,
  .str-video__end-call-button,
  button[data-testid="end-call-button"],
  .str-video__call-controls button[title*="Leave"],
  .str-video__call-controls button[title*="End"],
  .str-video__call-controls button[aria-label*="Leave"],
  .str-video__call-controls button[aria-label*="End"],
  .str-video__call-controls button[title*="Hang"],
  .str-video__call-controls button[aria-label*="Hang"] {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.5) !important;
    width: 70px !important;
    height: 70px !important;
    min-width: 70px !important;
    min-height: 70px !important;
  }

  .str-video__call-controls__button--variant-danger:hover,
  .str-video__end-call-button:hover,
  .str-video__call-controls button[title*="Leave"]:hover,
  .str-video__call-controls button[aria-label*="Leave"]:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6) !important;
    transform: scale(1.1) translateY(-2px) !important;
  }

  /* Muted/disabled state buttons */
  .str-video__call-controls button[data-enabled="false"],
  .str-video__call-controls__button--disabled,
  .str-video__composite-button__button--disabled {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
    box-shadow: 0 4px 15px rgba(75, 85, 99, 0.3) !important;
    opacity: 0.9 !important;
  }

  .str-video__call-controls button[data-enabled="false"]:hover {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
  }

  /* Composite button group (button + dropdown) */
  .str-video__composite-button {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 4px !important;
  }

  .str-video__composite-button__button-group {
    display: flex !important;
    gap: 2px !important;
  }

  /* Menu toggle / dropdown buttons */
  .str-video__menu-toggle-button,
  .str-video__composite-button__menu-button {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
    color: #fff !important;
    border-radius: 8px !important;
    width: 28px !important;
    height: 28px !important;
    min-width: 28px !important;
    border: none !important;
  }

  /* Notification message styling */
  .str-video__notification-message,
  .str-video__notification {
    color: #ffffff !important;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%) !important;
    padding: 14px 24px !important;
    border-radius: 16px !important;
    font-weight: 500 !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid #475569 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    font-size: 14px !important;
  }

  /* Video layout backgrounds */
  .str-video__speaker-layout,
  .str-video__paginated-grid-layout {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
  }

  /* Participant video tiles */
  .str-video__participant-view {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    border: 3px solid #334155 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.3s ease !important;
  }

  .str-video__participant-view:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.2) !important;
    transform: scale(1.02) !important;
  }

  /* Participant name label */
  .str-video__participant-details,
  .str-video__participant-details__name {
    color: #ffffff !important;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 70%, transparent 100%) !important;
    padding: 10px 16px !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;
  }

  /* Video placeholder (when camera is off) */
  .str-video__video-placeholder {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Recording indicator */
  .str-video__recording-indicator {
    background-color: #dc2626 !important;
    color: #fff !important;
  }
`;

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Component for when in a call
const CallRoom = ({ onLeave }) => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  if (callingState === CallingState.LEFT) {
    onLeave();
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Inject custom styles for Stream SDK */}
      <style>{streamCustomStyles}</style>
      
      {/* Call Info Bar */}
      <div className="bg-base-100/90 backdrop-blur px-4 py-2 flex items-center justify-between border-b border-base-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
            <VideocamIcon sx={{ fontSize: 18 }} className="text-success" />
          </div>
          <div>
            <span className="text-sm font-medium">In Call</span>
            <span className="text-xs text-base-content/60 ml-2">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-base-300">
        <StreamTheme className="h-full">
          <SpeakerLayout participantsBarPosition="bottom" />
        </StreamTheme>
      </div>

      {/* Controls */}
      <div className="bg-base-200 border-t border-base-300 p-6 flex justify-center">
        <CustomCallControls onLeave={onLeave} />
      </div>
    </div>
  );
};

// Pre-call Lobby Component
const CallLobby = ({
  callId,
  onJoin,
  isJoining,
  friends,
  onCreateNew,
  setCallId,
  onCallFriend,
}) => {
  const [showFriends, setShowFriends] = useState(false);

  const copyCallId = () => {
    navigator.clipboard.writeText(callId);
    toast.success("Call ID copied to clipboard!");
  };

  const shareCallLink = async () => {
    if (!callId) {
      toast.error("Generate or enter a call ID first");
      return;
    }

    const callLink = `${window.location.origin}/call?id=${encodeURIComponent(callId)}`;
    const shareText = `Join my Meet Aura call: ${callLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meet Aura Call",
          text: "Join my video call",
          url: callLink,
        });
        toast.success("Call link shared");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );

    try {
      await navigator.clipboard.writeText(callLink);
      toast.success("Opened WhatsApp and copied call link");
    } catch {
      toast.success("Opened WhatsApp share");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-ghost btn-circle btn-sm">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <VideocamIcon sx={{ fontSize: 20 }} className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Video Call</h1>
                <p className="text-xs text-base-content/60">Meet Aura Call</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-ghost btn-sm gap-1">
              <Home className="w-4 h-4 text-primary" />
              Home
            </Link>
            <Link to="/chat" className="btn btn-ghost btn-sm gap-1">
              <MessageCircle className="w-4 h-4 text-secondary" />
              Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Join/Create Call Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Start or Join a Call
              </h2>
              <p className="text-base-content/60 text-sm mb-4">
                Create a new video call or join an existing one with a call ID
              </p>

              {/* Call ID Input */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Call ID</span>
                </label>
                <div className="join w-full">
                  <input
                    type="text"
                    placeholder="Enter call ID or create new"
                    className="input input-bordered join-item flex-1"
                    value={callId}
                    onChange={(e) => setCallId(e.target.value)}
                  />
                  <button
                    className="btn btn-ghost join-item"
                    onClick={copyCallId}
                    disabled={!callId}
                  >
                    <Copy className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  className="btn btn-primary"
                  onClick={onJoin}
                  disabled={!callId || isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <VideocamIcon sx={{ fontSize: 18 }} />
                      Join Call
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline btn-secondary"
                  onClick={shareCallLink}
                  disabled={!callId || isJoining}
                  title="Share meeting link"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
                <button className="btn btn-outline btn-primary" onClick={onCreateNew}>
                  <RefreshCw className="w-4 h-4" />
                  Generate New Call ID
                </button>
              </div>
            </div>
          </div>

          {/* Quick Call with Friends */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Quick Call
              </h2>
              <p className="text-base-content/60 text-sm mb-4">
                Start a video call with your friends instantly
              </p>

              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                  <p className="text-base-content/60">
                    Add friends to start quick calls
                  </p>
                  <Link to="/" className="btn btn-sm btn-primary mt-3">
                    Find Friends
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img
                            src={
                              friend.profilePic ||
                              "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                            }
                            alt={friend.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{friend.fullname}</h4>
                        {friend.location && (
                          <p className="text-xs text-base-content/60 truncate">
                            {friend.location}
                          </p>
                        )}
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onCallFriend(friend)}
                      >
                        <VideocamIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-base-100 mt-6">
          <div className="card-body">
            <h3 className="font-semibold mb-3">How to use Meet Aura Calls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Create or Enter ID</h4>
                  <p className="text-xs text-base-content/60">
                    Generate a new call ID or enter an existing one
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Share with Friends</h4>
                  <p className="text-xs text-base-content/60">
                    Copy the call ID and share it with participants
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Join Together</h4>
                  <p className="text-xs text-base-content/60">
                    Everyone joins with the same ID to connect
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CallPage = () => {
  const { authUser } = useAuthUser();
  const { videoClient: contextVideoClient, outgoingCall, cancelCall } = useCallContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [callId, setCallId] = useState(
    searchParams.get("id") || `meet-${Date.now()}`
  );

  const isCalling = searchParams.get("calling") === "true";
  const isJoined = searchParams.get("joined") === "true";

  const { data: tokenData, isLoading: loadingToken } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getMyFriends,
    enabled: !!authUser,
  });

  // Use context videoClient if available, otherwise create our own
  useEffect(() => {
    if (contextVideoClient) {
      setVideoClient(contextVideoClient);
      return;
    }

    if (!tokenData?.token || !authUser) return;

    // Ensure user ID is a string
    const userId = authUser._id.toString();
    
    const client = new StreamVideoClient({
      apiKey: STREAM_API_KEY,
      user: {
        id: userId,
        name: authUser.fullname,
        image: authUser.profilePic || "",
      },
      token: tokenData.token,
    });

    setVideoClient(client);

    return () => {
      if (!contextVideoClient) {
        client.disconnectUser();
        setVideoClient(null);
      }
    };
  }, [tokenData, authUser, contextVideoClient]);

  // Handle automatic call join when coming from incoming call accept
  useEffect(() => {
    if (isJoined && videoClient && callId && !call) {
      handleJoinCall();
    }
  }, [isJoined, videoClient, callId]);

  // Handle outgoing call from context - join the call when navigating as caller
  useEffect(() => {
    const joinAsCalller = async () => {
      if (isCalling && outgoingCall?.call && !call) {
        console.log("📞 Caller joining the call:", outgoingCall.call.id);
        try {
          await outgoingCall.call.join();
          setCall(outgoingCall.call);
          toast.success("Waiting for the other person to answer...");
        } catch (error) {
          console.error("Error joining as caller:", error);
          toast.error("Failed to connect call");
        }
      }
    };
    joinAsCalller();
  }, [isCalling, outgoingCall]);

  const handleJoinCall = useCallback(async () => {
    if (!videoClient || !callId) return;

    setIsJoining(true);
    try {
      const newCall = videoClient.call("default", callId);
      
      // If joining from incoming call accept, the call already exists
      // If creating a new call, we need create: true
      await newCall.join({ create: !isJoined });
      
      setCall(newCall);
      toast.success(isJoined ? "Call connected!" : "Joined call successfully!");
    } catch (error) {
      console.error("Error joining call:", error);
      toast.error("Failed to join call. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }, [videoClient, callId, isJoined]);

  const handleLeaveCall = useCallback(async () => {
    if (call) {
      await call.leave();
      setCall(null);
      toast.success("Left the call");
      // Navigate back to home
      navigate("/");
    }
  }, [call, navigate]);

  const generateNewCallId = () => {
    const newId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCallId(newId);
    toast.success("New call ID generated!");
  };

  // Start a direct call with a friend (consistent ID)
  const startCallWithFriend = (friend) => {
    // Use shorter IDs to keep call ID under 64 chars (Stream limit)
    const id1 = authUser._id.toString().slice(-8);
    const id2 = friend._id.toString().slice(-8);
    const sortedIds = [id1, id2].sort();
    const newCallId = `call-${sortedIds[0]}-${sortedIds[1]}`;
    setCallId(newCallId);
    navigator.clipboard.writeText(newCallId);
    toast.success(`Call ID copied! Share with ${friend.fullname}`);
  };

  if (loadingToken || !videoClient) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Initializing video...</p>
        </div>
      </div>
    );
  }

  // If in a call, show the call room
  if (call) {
    return (
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <div className="h-screen bg-base-300">
            <CallRoom onLeave={handleLeaveCall} />
          </div>
        </StreamCall>
      </StreamVideo>
    );
  }

  // Show lobby if not in a call
  return (
    <StreamVideo client={videoClient}>
      <CallLobby
        callId={callId}
        setCallId={setCallId}
        onJoin={handleJoinCall}
        isJoining={isJoining}
        friends={friends}
        onCreateNew={generateNewCallId}
        onCallFriend={startCallWithFriend}
      />
    </StreamVideo>
  );
};

export default CallPage;