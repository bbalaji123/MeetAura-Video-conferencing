import { useCallContext } from "../hooks/useCallContext";
import { useNavigate } from "react-router";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useState } from "react";

const AVATAR_PLACEHOLDER = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, rejectCall } = useCallContext();
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);

  // Get caller info directly from incomingCall (now an object with callerName, callerImage)
  const callerInfo = incomingCall ? {
    name: incomingCall.callerName || "Someone",
    image: incomingCall.callerImage || AVATAR_PLACEHOLDER,
  } : null;

  useEffect(() => {
    if (incomingCall) {
      console.log("📞 Incoming call modal showing:", incomingCall);
    }
  }, [incomingCall]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const callData = await acceptCall();
      if (callData) {
        // Navigate to call page with the call ID
        navigate(`/call?id=${callData.callId}&joined=true`);
      }
    } catch (error) {
      console.error("Error accepting call:", error);
    }
    setIsAccepting(false);
  };

  const handleReject = async () => {
    await rejectCall();
  };

  if (!incomingCall) return null;

  console.log("🔔 Rendering incoming call modal for:", callerInfo?.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-pulse-slow">
        {/* Incoming Call Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/20 rounded-full text-success mb-4">
            <Phone className="w-4 h-4 animate-bounce" />
            <span className="text-sm font-medium">Incoming Video Call</span>
          </div>
        </div>

        {/* Caller Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary ring-offset-base-100 ring-offset-4">
              <img
                src={callerInfo?.image || AVATAR_PLACEHOLDER}
                alt={callerInfo?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-base-content">
            {callerInfo?.name || "Someone"}
          </h3>
          <p className="text-base-content/60 text-sm">wants to video call you</p>
        </div>

        {/* Call Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute"></div>
            <div className="w-16 h-16 rounded-full bg-primary/40 animate-pulse flex items-center justify-center relative">
              <Phone className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReject}
            className="btn btn-circle btn-lg bg-red-500 hover:bg-red-600 border-none text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="btn btn-circle btn-lg bg-green-500 hover:bg-green-600 border-none text-white"
          >
            {isAccepting ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <Phone className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Labels */}
        <div className="flex justify-center gap-16 mt-3">
          <span className="text-xs text-base-content/60">Decline</span>
          <span className="text-xs text-base-content/60">Accept</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;


