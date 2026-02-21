import { useState, useEffect, useCallback, useRef } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { useAuthUser } from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { CallContext } from "./CallContextValue";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const CallProvider = ({ children }) => {
  const { authUser } = useAuthUser();
  const [videoClient, setVideoClient] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const clientRef = useRef(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize Stream Video Client
  useEffect(() => {
    if (!tokenData?.token || !authUser) {
      console.log("⏳ Waiting for token and auth user...", { hasToken: !!tokenData?.token, hasUser: !!authUser });
      return;
    }

    // Prevent re-initialization
    if (clientRef.current) {
      console.log("🔄 Client already exists, skipping...");
      return;
    }

    const userId = authUser._id.toString();
    console.log("🎬 Initializing Stream Video Client for user:", userId, "with API key:", STREAM_API_KEY);

    try {
      const client = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: userId,
          name: authUser.fullname,
          image: authUser.profilePic || "",
        },
        token: tokenData.token,
      });

      clientRef.current = client;
      setVideoClient(client);

      console.log("✅ Stream Video Client created for:", userId);

      // Listen for incoming calls (ringing)
      const handleCallRinging = (event) => {
        console.log("📞 INCOMING CALL EVENT:", event);
        
        // Extract call info from the event
        const callCid = event.call_cid; // e.g., "default:call-id"
        const callData = event.call;
        const user = event.user; // The caller
        
        if (!callCid) {
          console.log("❌ No call_cid in event");
          return;
        }

        // Parse call type and id from cid (format: "type:id")
        const [callType, callId] = callCid.split(":");
        
        // Get caller info
        const myUserId = authUser._id.toString();
        const callerId = user?.id || callData?.created_by?.id;
        const callerName = user?.name || callData?.created_by?.name || "Someone";
        const callerImage = user?.image || callData?.created_by?.image;
        
        console.log("📞 Call details:", {
          callCid,
          callType,
          callId,
          myUserId,
          callerId,
          callerName,
        });
        
        // Only show incoming call if we're NOT the caller
        if (callerId !== myUserId) {
          console.log("📥 Showing incoming call notification from:", callerName);
          
          // Store call info (not the call object itself)
          setIncomingCall({
            callId,
            callType: callType || "default",
            callerId,
            callerName,
            callerImage,
          });
          
          // Play notification sound
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(console.log);
          } catch (e) {
            console.log("Audio play error:", e);
          }
          
          toast(`📞 ${callerName} is calling you!`, {
            duration: 20000,
            icon: "📞",
          });
        } else {
          console.log("📤 This is our own outgoing call, not showing notification");
        }
      };

      // Listen for call ended/rejected
      const handleCallEnded = (event) => {
        console.log("📴 Call ended/rejected event:", event);
        setIncomingCall(null);
      };

      // Subscribe to events
      const unsubRing = client.on("call.ring", handleCallRinging);
      const unsubEnded = client.on("call.ended", handleCallEnded);
      const unsubRejected = client.on("call.rejected", handleCallEnded);
      const unsubSessionEnd = client.on("call.session_ended", handleCallEnded);
      
      // Debug: Log all call-related events
      const unsubAll = client.on("all", (event) => {
        if (event.type?.startsWith("call.")) {
          console.log("📡 Stream Video Event:", event.type);
        }
      });

      setIsClientReady(true);
      console.log("✅ Stream Video Client ready and listening for calls!");

      // Cleanup
      return () => {
        console.log("🧹 Cleaning up Stream Video Client");
        unsubRing?.();
        unsubEnded?.();
        unsubRejected?.();
        unsubSessionEnd?.();
        unsubAll?.();
        client.disconnectUser();
        clientRef.current = null;
        setVideoClient(null);
        setIsClientReady(false);
      };
    } catch (error) {
      console.error("❌ Error creating Stream Video Client:", error);
    }
  }, [tokenData?.token, authUser]);

  // Start a call with a specific user (with ringing)
  const startCall = useCallback(
    async (targetUser) => {
      if (!videoClient || !authUser) {
        toast.error("Video client not ready. Please wait...");
        return null;
      }

      const myUserId = authUser._id.toString();
      const targetUserId = targetUser._id.toString();
      
      // Create a unique but short call ID
      const id1 = myUserId.slice(-8);
      const id2 = targetUserId.slice(-8);
      const sortedIds = [id1, id2].sort();
      const timestamp = Date.now().toString(36);
      const callId = `c-${sortedIds[0]}-${sortedIds[1]}-${timestamp}`;

      console.log("📞 Starting call:", {
        callId,
        from: { id: myUserId, name: authUser.fullname },
        to: { id: targetUserId, name: targetUser.fullname },
      });

      try {
        const call = videoClient.call("default", callId);

        // Create/get the call with ring enabled
        await call.getOrCreate({
          ring: true,
          data: {
            members: [
              { user_id: myUserId },
              { user_id: targetUserId },
            ],
            custom: {
              caller_name: authUser.fullname,
              caller_image: authUser.profilePic,
            },
          },
        });

        console.log("✅ Call created:", callId);
        console.log("📤 Ringing notification sent to:", targetUserId);

        setOutgoingCall({ call, targetUser });
        
        toast.success(`Calling ${targetUser.fullname}...`, {
          duration: 5000,
          icon: "📞",
        });

        return { call, callId };
      } catch (error) {
        console.error("❌ Error starting call:", error);
        toast.error("Failed to start call: " + (error.message || "Unknown error"));
        return null;
      }
    },
    [videoClient, authUser]
  );

  // Accept incoming call - returns call info, CallPage will handle joining
  const acceptCall = useCallback(async () => {
    if (!incomingCall) {
      console.log("❌ No incoming call to accept");
      return null;
    }

    try {
      const { callId, callType } = incomingCall;
      console.log("✅ Accepting call:", callId, "type:", callType);
      
      const callData = { ...incomingCall };
      setIncomingCall(null);
      toast.success("Connecting to call...");
      return callData;
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      toast.error("Failed to accept call: " + error.message);
      return null;
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback(async () => {
    if (!incomingCall || !videoClient) return;

    try {
      const { callId, callType } = incomingCall;
      console.log("❌ Rejecting call:", callId);
      
      // Get the call instance and reject it
      const call = videoClient.call(callType || "default", callId);
      await call.leave({ reject: true });
      
      setIncomingCall(null);
      toast.success("Call rejected");
    } catch (error) {
      console.error("Error rejecting call:", error);
      setIncomingCall(null);
    }
  }, [incomingCall, videoClient]);

  // Cancel outgoing call
  const cancelCall = useCallback(async () => {
    if (!outgoingCall?.call) return;

    try {
      console.log("🚫 Cancelling call:", outgoingCall.call.id);
      await outgoingCall.call.leave();
      setOutgoingCall(null);
      toast.success("Call cancelled");
    } catch (error) {
      console.error("Error cancelling call:", error);
      setOutgoingCall(null);
    }
  }, [outgoingCall]);

  const value = {
    videoClient,
    incomingCall,
    outgoingCall,
    isClientReady,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    setIncomingCall,
    setOutgoingCall,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
