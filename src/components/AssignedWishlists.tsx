"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  ExternalLink,
  DollarSign,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";
import { Item, User as UserType } from "../types";
import ReserveDialog from "./ReserveDialog";
import toast from "react-hot-toast";
import { getRandomMessage } from "../lib/utils";

interface AssignedWishlistsProps {
  currentUser: string;
  commentCounts: Record<number, number>;
  onCommentClick: (item: Item) => void;
  onItemDetailClick: (item: Item) => void;
}

export default function AssignedWishlists({
  currentUser,
  commentCounts,
  onCommentClick,
  onItemDetailClick,
}: AssignedWishlistsProps) {
  const [assignedUsers, setAssignedUsers] = useState<UserType[]>([]);
  const [assignedItems, setAssignedItems] = useState<Record<number, Item[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());
  const [reserveDialog, setReserveDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });

  useEffect(() => {
    fetchAssignedUsers();
  }, [currentUser]);

  const fetchAssignedUsers = async () => {
    try {
      // Get current user's assignments
      const response = await fetch("/api/assignments");
      const data = await response.json();

      if (data.success && data.users) {
        const currentUserData = data.users.find(
          (user: UserType) =>
            user.name.toLowerCase() === currentUser.toLowerCase()
        );

        if (currentUserData && currentUserData.assigned_users) {
          // Get the assigned users' details
          const assignedUsersList = data.users.filter((user: UserType) =>
            currentUserData.assigned_users!.includes(user.id)
          );

          setAssignedUsers(assignedUsersList);

          // Fetch items for each assigned user
          await fetchAssignedItems(assignedUsersList);

          // Auto-expand first user
          if (assignedUsersList.length > 0) {
            setExpandedUsers(new Set([assignedUsersList[0].id]));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching assigned users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedItems = async (users: UserType[]) => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();

      if (data.items) {
        const itemsByUser: Record<number, Item[]> = {};

        users.forEach((user) => {
          itemsByUser[user.id] = data.items.filter(
            (item: Item) => item.author_id === user.id
          );
        });

        setAssignedItems(itemsByUser);
      }
    } catch (error) {
      console.error("Error fetching assigned items:", error);
    }
  };

  const toggleUserExpanded = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleReserveItem = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gifter_name: currentUser }),
      });

      const result = await response.json();

      if (response.ok && result.item) {
        // Update the item in the assigned items
        setAssignedItems((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((userId) => {
            updated[parseInt(userId)] = updated[parseInt(userId)].map((i) =>
              i.id === item.id ? result.item : i
            );
          });
          return updated;
        });
        toast.success("🎅 You're now the secret Santa for this gift!");
        setReserveDialog({ isOpen: false, item: null });
      } else if (result.alreadyReserved) {
        if (result.item) {
          // Update the item if provided
          setAssignedItems((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((userId) => {
              updated[parseInt(userId)] = updated[parseInt(userId)].map((i) =>
                i.id === item.id ? result.item : i
              );
            });
            return updated;
          });
        }
        toast.error(
          result.error || "🎅 Oops! Someone else just reserved this gift!"
        );
        setReserveDialog({ isOpen: false, item: null });
      } else {
        toast.error(result.error || getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

  const handleUnreserveItem = async (item: Item) => {
    if (!confirm("🎄 Are you sure you want to unreserve this gift?")) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${item.id}/reserve`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.item) {
        setAssignedItems((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((userId) => {
            updated[parseInt(userId)] = updated[parseInt(userId)].map((i) =>
              i.id === item.id ? result.item : i
            );
          });
          return updated;
        });
        toast.success("🎁 Gift unreserved! It's available for others now.");
      } else {
        toast.error(result.error || getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

  if (loading) {
    return (
      <div className="christmas-section order-2 lg:order-1">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🎅</div>
            <p className="text-lg text-gray-600">
              Loading your Secret Santa assignments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (assignedUsers.length === 0) {
    return (
      <div className="christmas-section order-2 lg:order-1">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎄</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No assignments yet!
          </h3>
          <p className="text-gray-500 mb-4">
            Secret Santa assignments haven't been generated yet.
          </p>
          <p className="text-sm text-gray-400">
            Once assignments are ready, you'll see your special people here! 🎅
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="christmas-section order-2 lg:order-1">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-red flex items-center mb-4">
          🎅 <span className="ml-2">Your Secret Santa Assignments</span>
        </h2>

        {/* Christmas Message */}
        <div className="bg-gradient-to-r from-christmas-red/10 to-christmas-green/10 p-4 rounded-lg border border-christmas-gold/30 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-christmas-gold/30 rounded-full flex items-center justify-center mr-4">
              <Sparkles className="w-5 h-5 text-christmas-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-christmas-green mb-2">
                🤫 Shhhh... Secret Santa Time!
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Ho ho ho! You've been assigned{" "}
                <strong>{assignedUsers.length} special people</strong> to
                surprise this Christmas! Browse their wishlists below and
                prepare wonderful presents.
                <span className="font-medium text-christmas-red">
                  {" "}
                  Remember to label each gift with their user ID
                </span>{" "}
                so Santa knows who gets what! 🎁✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-320px)] pr-2 py-2 christmas-scroll">
        {assignedUsers.map((user) => {
          const userItems = assignedItems[user.id] || [];
          const isExpanded = expandedUsers.has(user.id);

          return (
            <div key={user.id} className="christmas-gift-card">
              <button
                onClick={() => toggleUserExpanded(user.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 mr-3 text-christmas-green" />
                    ) : (
                      <ChevronRight className="w-5 h-5 mr-3 text-christmas-green" />
                    )}
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-christmas-red" />
                      <span className="font-bold text-lg text-gray-800">
                        {user.name}
                      </span>
                      <span className="ml-2 text-sm text-christmas-gold font-medium">
                        (ID: {user.id})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Gift className="w-4 h-4 mr-1" />
                    <span>{userItems.length} items</span>
                  </div>
                </div>

                {/* Christmas message for this user */}
                <div className="mt-3 ml-8 p-3 bg-christmas-green/10 rounded-lg border-l-4 border-christmas-green">
                  <p className="text-sm text-christmas-green font-medium">
                    🎄 "Prepare {user.name} a present and label it with ID:{" "}
                    {user.id}" 🎁
                  </p>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  {userItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No items in {user.name}'s wishlist yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 mt-4">
                      {userItems.map((item) => {
                        const isMyReservation =
                          item.gifter_id &&
                          item.gifter?.name?.toLowerCase() ===
                            currentUser.toLowerCase();
                        const isReserved = item.gifter_id && !isMyReservation;

                        return (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-gray-900 flex items-center text-base">
                                <Gift className="w-4 h-4 mr-2 text-christmas-red" />
                                {item.item_name}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onCommentClick(item);
                                }}
                                className="p-2 text-gray-500 hover:text-christmas-gold transition-colors rounded-lg hover:bg-gray-50 relative"
                                title="View comments"
                              >
                                <MessageCircle size={16} />
                                {commentCounts[item.id] > 0 && (
                                  <span className="absolute -top-1 -right-1 bg-christmas-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                    {commentCounts[item.id]}
                                  </span>
                                )}
                              </button>
                            </div>

                            {item.image_url && (
                              <div className="mb-3">
                                <img
                                  src={item.image_url}
                                  alt={item.item_name}
                                  className="w-full h-full object-cover rounded-lg shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              {item.price_range && (
                                <p className="text-sm text-gray-700 flex items-center bg-christmas-gold/10 px-3 py-2 rounded-lg">
                                  <DollarSign className="w-4 h-4 mr-2 text-christmas-gold" />
                                  <strong>Price:</strong>
                                  <span className="ml-1">
                                    {item.price_range}
                                  </span>
                                </p>
                              )}

                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  View Item Online
                                </a>
                              )}

                              {/* Reservation Status */}
                              {isMyReservation ? (
                                <div className="bg-green-100 border border-green-300 p-3 rounded-lg text-center">
                                  <p className="text-sm font-bold text-green-800 mb-2">
                                    🎅 You reserved this gift!
                                  </p>
                                  <p className="text-xs text-green-600 mb-2">
                                    Click to unreserve if you change your mind
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnreserveItem(item);
                                    }}
                                    className="christmas-button-secondary w-full text-sm py-2"
                                  >
                                    🎁 Unreserve
                                  </button>
                                </div>
                              ) : isReserved ? (
                                <div className="bg-gray-100 p-3 rounded-lg text-center">
                                  <p className="text-sm font-medium text-gray-600">
                                    🎅 Reserved by someone else
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReserveDialog({
                                        isOpen: true,
                                        item,
                                      });
                                    }}
                                    className="christmas-button-secondary w-full text-sm py-2"
                                  >
                                    🎁 I'll Get This!
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Layout - Horizontal Scrolling */}
      <div className="sm:hidden space-y-4 pr-2 christmas-scroll">
        {assignedUsers.map((user) => {
          const userItems = assignedItems[user.id] || [];

          return (
            <div key={user.id} className="space-y-3">
              {/* User Header */}
              <div className="flex items-center justify-between bg-white backdrop-blur-sm py-3 px-4 rounded-lg border border-christmas-gold/20 sticky top-0 z-10">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-christmas-red" />
                  <span className="text-sm font-bold text-gray-800">
                    {user.name}
                  </span>
                  <span className="ml-2 text-xs text-christmas-gold font-medium">
                    (ID: {user.id})
                  </span>
                </div>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {userItems.length}
                </span>
              </div>

              {/* Christmas message for this user */}
              <div className="p-3 bg-christmas-green/10 rounded-lg border border-christmas-green/30">
                <p className="text-xs text-christmas-green font-medium text-center">
                  🎄 "Prepare {user.name} a present and label it with ID:{" "}
                  {user.id}" 🎁
                </p>
              </div>

              {/* Items Horizontal Scroll */}
              {userItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No items in {user.name}'s wishlist yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 w-max">
                    {userItems.map((item) => {
                      const isMyReservation =
                        item.gifter_id &&
                        item.gifter?.name?.toLowerCase() ===
                          currentUser.toLowerCase();
                      const isReserved = item.gifter_id && !isMyReservation;

                      return (
                        <div
                          key={item.id}
                          className="christmas-gift-card p-4 w-64 max-w-64 flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => onItemDetailClick(item)}
                        >
                          <div className="flex justify-between items-start mb-3 min-w-0">
                            <h4 className="font-bold text-gray-800 flex items-center text-sm leading-tight min-w-0 flex-1 mr-2">
                              <Gift className="w-4 h-4 mr-1 text-christmas-red flex-shrink-0" />
                              <span className="truncate">{item.item_name}</span>
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCommentClick(item);
                              }}
                              className="p-1.5 text-gray-500 hover:text-christmas-gold transition-colors rounded-lg hover:bg-gray-50 relative flex-shrink-0"
                              title="View comments"
                            >
                              <MessageCircle size={14} />
                              {commentCounts[item.id] > 0 && (
                                <span className="absolute -top-1 -right-1 bg-christmas-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
                                  {commentCounts[item.id]}
                                </span>
                              )}
                            </button>
                          </div>

                          {item.image_url && (
                            <div className="mb-3">
                              <img
                                src={item.image_url}
                                alt={item.item_name}
                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            {item.price_range && (
                              <p className="text-xs text-gray-700 flex items-center bg-christmas-gold/10 px-2 py-1.5 rounded-lg">
                                <DollarSign className="w-3 h-3 mr-1 text-christmas-gold" />
                                <span className="font-medium">Price:</span>
                                <span className="ml-1 truncate">
                                  {item.price_range}
                                </span>
                              </p>
                            )}

                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span className="truncate">View Online</span>
                              </a>
                            )}

                            {/* Reservation Status */}
                            {isMyReservation ? (
                              <div className="bg-green-100 border border-green-300 p-2 rounded-lg text-center">
                                <p className="text-xs font-bold text-green-800 mb-1">
                                  🎅 You reserved this!
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnreserveItem(item);
                                  }}
                                  className="christmas-button-secondary w-full text-xs py-1"
                                >
                                  🎁 Unreserve
                                </button>
                              </div>
                            ) : isReserved ? (
                              <div className="bg-gray-100 p-2 rounded-lg text-center">
                                <p className="text-xs font-medium text-gray-600">
                                  🎅 Reserved by someone else
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReserveDialog({
                                      isOpen: true,
                                      item,
                                    });
                                  }}
                                  className="christmas-button-secondary w-full text-xs py-1"
                                >
                                  🎁 I'll Get This!
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ReserveDialog
        isOpen={reserveDialog.isOpen}
        onClose={() => setReserveDialog({ isOpen: false, item: null })}
        onConfirm={() =>
          reserveDialog.item && handleReserveItem(reserveDialog.item)
        }
        item={reserveDialog.item}
        currentUser={currentUser}
      />
    </div>
  );
}
