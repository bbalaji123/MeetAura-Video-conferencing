import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriendRequests, acceptFriendRequest, getOutgoingFriendRequests } from "../lib/api";
import { Link } from "react-router";
import toast from "react-hot-toast";
import {
  Bell,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Globe,
  Languages,
  Users,
  Home,
  MessageCircle,
  Video,
} from "lucide-react";

const AVATAR_PLACEHOLDER = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { data: outgoingRequests = [], isLoading: loadingOutgoing } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingFriendRequests,
  });

  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast.success("Friend request accepted!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to accept request");
    },
  });

  const incomingReqs = friendRequests?.incomingReqs || [];
  const acceptedReqs = friendRequests?.acceptedReqs || [];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="btn btn-ghost btn-circle">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                <p className="text-sm text-base-content/60">
                  Manage your friend requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Quick Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Link to="/" className="btn btn-ghost btn-sm gap-2">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link to="/chat" className="btn btn-ghost btn-sm gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </Link>
          <Link to="/call" className="btn btn-ghost btn-sm gap-2">
            <Video className="w-4 h-4" />
            Call
          </Link>
        </div>

        {/* Incoming Requests */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">
              Friend Requests ({incomingReqs.length})
            </h2>
          </div>

          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : incomingReqs.length === 0 ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-base-content/30" />
                </div>
                <h3 className="font-semibold">No pending requests</h3>
                <p className="text-base-content/60 text-sm">
                  When someone sends you a friend request, it will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingReqs.map((request) => (
                <div
                  key={request._id}
                  className="card bg-base-100 border border-base-300 hover:border-primary/30 transition-all"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start gap-4">
                      <div className="avatar">
                        <div className="w-14 h-14 rounded-full">
                          <img
                            src={request.sender.profilePic || AVATAR_PLACEHOLDER}
                            alt={request.sender.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{request.sender.fullname}</h3>
                        {request.sender.bio && (
                          <p className="text-sm text-base-content/60 line-clamp-1 mb-2">
                            {request.sender.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {request.sender.nativeLanguage && (
                            <span className="badge badge-primary badge-sm gap-1">
                              <Globe className="w-3 h-3" />
                              {request.sender.nativeLanguage}
                            </span>
                          )}
                          {request.sender.location && (
                            <span className="badge badge-ghost badge-sm gap-1">
                              <MapPin className="w-3 h-3" />
                              {request.sender.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => acceptRequest(request._id)}
                          disabled={isAccepting}
                        >
                          {isAccepting ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold">
              Pending Sent Requests ({outgoingRequests.length})
            </h2>
          </div>

          {loadingOutgoing ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : outgoingRequests.length === 0 ? (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body items-center text-center py-8">
                <Clock className="w-10 h-10 text-base-content/20 mb-2" />
                <p className="text-base-content/60 text-sm">
                  No pending outgoing requests
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outgoingRequests.map((request) => (
                <div
                  key={request._id}
                  className="card bg-base-100 border border-base-300"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img
                            src={request.recipient.profilePic || AVATAR_PLACEHOLDER}
                            alt={request.recipient.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {request.recipient.fullname}
                        </h4>
                        <p className="text-xs text-warning flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Awaiting response
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Requests (New Friends) */}
        {acceptedReqs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-success" />
              <h2 className="text-lg font-bold">
                Recently Accepted ({acceptedReqs.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {acceptedReqs.map((request) => (
                <div
                  key={request._id}
                  className="card bg-success/5 border border-success/20"
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-success ring-offset-base-100 ring-offset-1">
                          <img
                            src={request.recipient.profilePic || AVATAR_PLACEHOLDER}
                            alt={request.recipient.fullname}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {request.recipient.fullname}
                        </h4>
                        <p className="text-xs text-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Now friends
                        </p>
                      </div>
                      <Link to="/chat" className="btn btn-ghost btn-sm btn-circle">
                        <MessageCircle className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
