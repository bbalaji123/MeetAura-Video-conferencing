import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "../hooks/useAuthUser";
import { getRecommendedUsers, getMyFriends, sendFriendRequest, logout, getOutgoingFriendRequests } from "../lib/api";
import { useCallContext } from "../hooks/useCallContext";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Video,
  MessageCircle,
  Users,
  Bell,
  LogOut,
  UserPlus,
  MapPin,
  Globe,
  Languages,
  Search,
  Home,
  Settings,
  CheckCircle,
  Clock,
  Phone,
} from "lucide-react";

const AVATAR_PLACEHOLDER = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const HomePage = () => {
  const { authUser } = useAuthUser();
  const { startCall } = useCallContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [callingFriendId, setCallingFriendId] = useState(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getMyFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingRecommended } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendRequests,
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
      navigate("/login");
    },
  });

  const { mutate: sendRequest, isPending: isSendingRequest } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
      toast.success("Friend request sent!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  const filteredFriends = friends.filter((friend) =>
    friend.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasPendingRequest = (userId) => {
    return outgoingRequests.some((req) => req.recipient._id === userId);
  };

  // Direct call a friend with notification
  const handleCallFriend = async (friend) => {
    setCallingFriendId(friend._id);
    const result = await startCall(friend);
    if (result) {
      // Navigate to call page with the call
      navigate(`/call?id=${result.callId}&calling=true`);
    }
    setCallingFriendId(null);
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-base-100 border-r border-base-300 flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meet Aura
            </span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4">
          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={authUser?.profilePic || AVATAR_PLACEHOLDER}
                    alt={authUser?.fullname}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{authUser?.fullname}</h3>
                <p className="text-xs text-base-content/60 truncate">
                  {authUser?.email}
                </p>
              </div>
            </div>
            {authUser?.bio && (
              <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                {authUser.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {authUser?.nativeLanguage && (
                <span className="badge badge-primary badge-sm">
                  <Globe className="w-3 h-3 mr-1" />
                  {authUser.nativeLanguage}
                </span>
              )}
              {authUser?.location && (
                <span className="badge badge-ghost badge-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {authUser.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="menu gap-1">
            <li>
              <Link to="/" className="active">
                <Home className="w-5 h-5" />
                Home
              </Link>
            </li>
            <li>
              <Link to="/chat">
                <MessageCircle className="w-5 h-5" />
                Messages
              </Link>
            </li>
            <li>
              <Link to="/notifications">
                <Bell className="w-5 h-5" />
                Notifications
              </Link>
            </li>
            <li>
              <Link to="/onboarding">
                <Settings className="w-5 h-5" />
                Edit Profile
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={() => logoutMutation()}
            className="btn btn-ghost w-full justify-start text-error hover:bg-error/10"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {authUser?.fullname?.split(" ")[0]}! 👋
          </h1>
          <p className="text-base-content/60">
            Connect with friends and start conversations through video calls and messages.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <div className="card-body">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="card-title text-lg">Start a Call</h3>
              <p className="text-sm text-base-content/60 mb-4">
                Begin a video call with your friends instantly
              </p>
              <Link to="/call" className="btn btn-primary btn-sm">
                Start Call
              </Link>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20">
            <div className="card-body">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-2">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="card-title text-lg">Send Message</h3>
              <p className="text-sm text-base-content/60 mb-4">
                Chat with your friends and exchange ideas
              </p>
              <Link to="/chat" className="btn btn-secondary btn-sm">
                Open Chat
              </Link>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20">
            <div className="card-body">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="card-title text-lg">Find Friends</h3>
              <p className="text-sm text-base-content/60 mb-4">
                Discover new people and expand your network
              </p>
              <a href="#discover" className="btn btn-accent btn-sm">
                Discover
              </a>
            </div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Friends ({friends.length})
            </h2>
            <div className="form-control">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="input input-bordered input-sm w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : friends.length === 0 ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center text-center">
                <Users className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="font-semibold text-lg">No friends yet</h3>
                <p className="text-base-content/60">
                  Start connecting with people below to build your network!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="card bg-base-100 border border-base-300 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                      <div className="avatar">
                        <div className="w-14 h-14 rounded-full">
                          <img
                            src={friend.profilePic || AVATAR_PLACEHOLDER}
                            alt={friend.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{friend.fullname}</h3>
                        {friend.bio && (
                          <p className="text-sm text-base-content/60 line-clamp-1 mb-2">
                            {friend.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {friend.location && (
                            <span className="badge badge-ghost badge-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {friend.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="card-actions mt-3 justify-end">
                      <Link
                        to={`/chat`}
                        className="btn btn-ghost btn-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleCallFriend(friend)}
                        disabled={callingFriendId === friend._id}
                        className="btn btn-primary btn-sm"
                      >
                        {callingFriendId === friend._id ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Calling...
                          </>
                        ) : (
                          <>
                            <Video className="w-4 h-4" />
                            Call
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discover Section */}
        <div id="discover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-secondary" />
              Discover People
            </h2>
          </div>

          {loadingRecommended ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-secondary"></span>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center text-center">
                <CheckCircle className="w-16 h-16 text-success/50 mb-4" />
                <h3 className="font-semibold text-lg">All caught up!</h3>
                <p className="text-base-content/60">
                  You've discovered all available users. Check back later!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => (
                <div
                  key={user._id}
                  className="card bg-base-100 border border-base-300 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                      <div className="avatar">
                        <div className="w-14 h-14 rounded-full">
                          <img
                            src={user.profilePic || AVATAR_PLACEHOLDER}
                            alt={user.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{user.fullname}</h3>
                        {user.bio && (
                          <p className="text-sm text-base-content/60 line-clamp-2 mb-2">
                            {user.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {user.nativeLanguage && (
                            <span className="badge badge-primary badge-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              {user.nativeLanguage}
                            </span>
                          )}
                          {user.location && (
                            <span className="badge badge-ghost badge-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {user.location}
                            </span>
                          )}
                        </div>
                        {user.learningLanguages?.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-base-content/50">
                            <Languages className="w-3 h-3" />
                            Learning: {user.learningLanguages.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-actions mt-3 justify-end">
                      {hasPendingRequest(user._id) ? (
                        <button className="btn btn-ghost btn-sm" disabled>
                          <Clock className="w-4 h-4" />
                          Pending
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => sendRequest(user._id)}
                          disabled={isSendingRequest}
                        >
                          {isSendingRequest ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;