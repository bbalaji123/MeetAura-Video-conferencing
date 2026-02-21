import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { useAuthUser } from "../hooks/useAuthUser";
import { getStreamToken, getMyFriends } from "../lib/api";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Video,
  Users,
  Home,
  Bell,
  MessageCircle,
  Loader2,
  Phone,
} from "lucide-react";

import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getMyFriends,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Ensure user ID is a string
        const userId = authUser._id.toString();
        
        await client.connectUser(
          {
            id: userId,
            name: authUser.fullname,
            image: authUser.profilePic || "",
          },
          tokenData.token
        );

        setChatClient(client);
        setIsConnecting(false);
      } catch (error) {
        console.error("Error connecting to Stream Chat:", error);
        toast.error("Failed to connect to chat");
        setIsConnecting(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tokenData, authUser]);

  const createDirectChannel = async (friend) => {
    if (!chatClient || !friend) return;

    try {
      // Create a unique channel ID sorted by user IDs to ensure consistency
      // Use shorter IDs to stay under Stream's 64 char limit
      const id1 = authUser._id.toString().slice(-8);
      const id2 = friend._id.toString().slice(-8);
      const sortedIds = [id1, id2].sort();
      const channelId = `dm-${sortedIds[0]}-${sortedIds[1]}`;
      
      const channel = chatClient.channel("messaging", channelId, {
        members: [authUser._id.toString(), friend._id.toString()],
        name: friend.fullname,
        image: friend.profilePic,
      });

      await channel.watch();
      setSelectedChannel(channel);
      toast.success(`Chat with ${friend.fullname} opened`);
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("Failed to open chat");
    }
  };

  const startVideoCall = (friend) => {
    // Use shorter IDs to keep call ID under 64 chars
    const id1 = authUser._id.toString().slice(-8);
    const id2 = friend._id.toString().slice(-8);
    const sortedIds = [id1, id2].sort();
    const callId = `call-${sortedIds[0]}-${sortedIds[1]}`;
    navigate(`/call?id=${callId}`);
  };

  if (isConnecting || !chatClient) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-base-content/60">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200 flex flex-col">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn btn-ghost btn-circle btn-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-lg font-bold">Messages</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="btn btn-ghost btn-sm gap-1">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/notifications" className="btn btn-ghost btn-sm gap-1">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Link>
          <Link to="/call" className="btn btn-primary btn-sm gap-1">
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Call</span>
          </Link>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        <Chat client={chatClient} theme="str-chat__theme-dark">
          {/* Sidebar with Friends and Channels */}
          <div className="w-80 bg-base-100 border-r border-base-300 flex flex-col">
            {/* Friends List */}
            <div className="p-4 border-b border-base-300">
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Friends ({friends.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-sm text-base-content/50 text-center py-4">
                    No friends yet. Add some friends to start chatting!
                  </p>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors"
                    >
                      <button
                        onClick={() => createDirectChannel(friend)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="avatar online">
                          <div className="w-8 h-8 rounded-full">
                            <img
                              src={friend.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                              alt={friend.fullname}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium truncate text-left">
                          {friend.fullname}
                        </span>
                      </button>
                      <button
                        onClick={() => startVideoCall(friend)}
                        className="btn btn-ghost btn-xs btn-circle"
                        title="Video Call"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-hidden">
              <ChannelList
                filters={{
                  type: "messaging",
                  members: { $in: [authUser._id.toString()] },
                }}
                sort={{ last_message_at: -1 }}
                options={{ state: true, presence: true, limit: 20 }}
                showChannelSearch
                setActiveChannelOnMount={false}
                onSelect={(channel) => setSelectedChannel(channel)}
              />
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <div className="str-chat__header-livestream">
                    <ChannelHeader />
                  </div>
                  <MessageList />
                  <MessageInput focus />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-base-200">
                <div className="text-center px-4">
                  <div className="w-20 h-20 rounded-full bg-base-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-base-content/30" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                  <p className="text-base-content/60 max-w-sm">
                    Select a friend from the list or choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;