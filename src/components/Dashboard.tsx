"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  LogOut,
  Edit,
  Trash2,
  Gift,
  ExternalLink,
  DollarSign,
  User,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { Item, CreateItemData, UpdateItemData } from "../types";
import { getRandomMessage } from "../lib/utils";
import ItemDialog from "./ItemDialog";
// import ReserveDialog from "./ReserveDialog"; // Commented out - reservation functionality disabled for now
import CommentDialog from "./CommentDialog";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialog, setItemDialog] = useState<{
    isOpen: boolean;
    item?: Item;
    title: string;
  }>({ isOpen: false, title: "" });
  // const [reserveDialog, setReserveDialog] = useState<{
  //   isOpen: boolean;
  //   item: Item | null;
  // }>({ isOpen: false, item: null }); // Commented out - reservation functionality disabled for now
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [commentDialog, setCommentDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [itemDetailDialog, setItemDetailDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>(
    {}
  );
  const [showDomainNote, setShowDomainNote] = useState(true);

  // Function to check if device is mobile
  const isMobile = () => {
    return window.innerWidth < 640; // sm breakpoint in Tailwind
  };

  useEffect(() => {
    fetchItems();
    // Register user in database
    registerUser();
  }, []);

  // Fetch comment counts when items change
  useEffect(() => {
    if (items.length > 0) {
      fetchCommentCounts();
    }
  }, [items]);

  // Initialize expanded users when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      const otherUsers = Object.keys(groupedItems).filter(
        (name) => name.toLowerCase() !== currentUser.toLowerCase()
      );
      if (otherUsers.length > 0 && expandedUsers.size === 0) {
        setExpandedUsers(new Set([otherUsers[0]]));
      }
    }
  }, [items, currentUser]);

  // Auto-hide domain note after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDomainNote(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const toggleUserExpanded = (userName: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userName)) {
      newExpanded.delete(userName);
    } else {
      newExpanded.add(userName);
    }
    setExpandedUsers(newExpanded);
  };

  const registerUser = async () => {
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentUser.toLowerCase() }),
      });
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentCounts = async () => {
    try {
      const counts: Record<number, number> = {};

      // Fetch comment counts for all items in parallel
      await Promise.all(
        items.map(async (item) => {
          try {
            const response = await fetch(`/api/items/${item.id}/comments`);
            const data = await response.json();
            counts[item.id] = data.comments?.length || 0;
          } catch (error) {
            console.error(
              `Error fetching comments for item ${item.id}:`,
              error
            );
            counts[item.id] = 0;
          }
        })
      );

      setCommentCounts(counts);
    } catch (error) {
      console.error("Error fetching comment counts:", error);
    }
  };

  const handleCreateItem = async (data: CreateItemData) => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          author_name: currentUser.toLowerCase(),
        }),
      });

      const result = await response.json();
      if (result.item) {
        setItems([result.item, ...items]);
        toast.success(getRandomMessage("success"));
        setItemDialog({ isOpen: false, title: "" });
      } else {
        toast.error(getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

  const handleUpdateItem = async (data: UpdateItemData) => {
    try {
      const response = await fetch(`/api/items/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.item) {
        setItems(
          items.map((item) => (item.id === data.id ? result.item : item))
        );
        toast.success(getRandomMessage("success"));
        setItemDialog({ isOpen: false, title: "" });
      } else {
        toast.error(getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
        toast.success(getRandomMessage("success"));
      } else {
        toast.error(getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

  // RESERVATION FUNCTIONALITY - COMMENTED OUT FOR NOW

  // const handleReserveItem = async (item: Item) => {
  //   try {
  //     const response = await fetch(`/api/items/${item.id}/reserve`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ gifter_name: currentUser }),
  //     });

  //     const result = await response.json();

  //     if (response.ok && result.item) {
  //       // Success - update the item in the list
  //       setItems(items.map((i) => (i.id === item.id ? result.item : i)));
  //       toast.success("🎅 You're now the secret Santa for this gift!");
  //       setReserveDialog({ isOpen: false, item: null });
  //     } else if (result.alreadyReserved) {
  //       // Item was already reserved - update the item if provided and show specific message
  //       if (result.item) {
  //         setItems(items.map((i) => (i.id === item.id ? result.item : i)));
  //       }
  //       toast.error(
  //         result.error || "🎅 Oops! Someone else just reserved this gift!"
  //       );
  //       setReserveDialog({ isOpen: false, item: null });
  //       // Refresh the items to get the latest state
  //       fetchItems();
  //     } else {
  //       toast.error(result.error || getRandomMessage("error"));
  //     }
  //   } catch (error) {
  //     toast.error(getRandomMessage("error"));
  //   }
  // };

  // const handleUnreserveItem = async (item: Item) => {
  //   if (!confirm("🎄 Are you sure you want to unreserve this gift?")) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/items/${item.id}/reserve`, {
  //       method: "DELETE",
  //     });

  //     const result = await response.json();

  //     if (response.ok && result.item) {
  //       setItems(items.map((i) => (i.id === item.id ? result.item : i)));
  //       toast.success("🎁 Gift unreserved! It's available for others now.");
  //     } else {
  //       toast.error(result.error || getRandomMessage("error"));
  //     }
  //   } catch (error) {
  //     toast.error(getRandomMessage("error"));
  //   }
  // };

  const groupedItems = items.reduce((acc, item) => {
    const authorName = item.author?.name || "Unknown";
    if (!acc[authorName]) {
      acc[authorName] = [];
    }
    acc[authorName].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  // Helper function to get current user's items (case-insensitive)
  const getCurrentUserItems = () => {
    const userKey = Object.keys(groupedItems).find(
      (key) => key.toLowerCase() === currentUser.toLowerCase()
    );
    return userKey ? groupedItems[userKey] : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎄</div>
          <p className="text-xl text-white">Loading Christmas magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="christmas-card p-4 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-christmas-red flex items-center">
                🎄 <span className="ml-2">Christmas Gift Exchange</span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Welcome back, <strong>{currentUser}</strong>! 🎅
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex flex-row items-center christmas-button-secondary text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Phase Information Card */}
        <div className="mb-6 p-4 bg-christmas-green rounded-lg border border-christmas-gold/50 shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-christmas-gold/30 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl">🎁</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                📝 Gift Adding Phase
              </h3>
              <p className="text-white text-sm leading-relaxed">
                We're currently in the <strong>gift collection phase</strong>!
                Everyone is adding their Christmas wishes to their wishlists.
                Once everyone has finished adding their gifts, we'll assign your
                Secret Santas and the fun begins! 🎅✨
              </p>
              <div className="mt-3 flex items-center text-xs text-white">
                <span className="w-2 h-2 bg-christmas-gold rounded-full mr-2 animate-pulse"></span>
                Phase 1 of 2: Building Wishlists
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
          {/* Family Gifts Section */}
          <div className="christmas-section order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-green flex items-center">
                🎁 <span className="ml-2">Family Gifts</span>
              </h2>
              <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
                {Object.entries(groupedItems)
                  .filter(
                    ([name]) => name.toLowerCase() !== currentUser.toLowerCase()
                  )
                  .reduce((acc, [, items]) => acc + items.length, 0)}{" "}
                items
              </span>
            </div>

            {/* Desktop Layout - Hidden on Mobile */}
            <div className="hidden sm:block space-y-4 sm:space-y-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-280px)] pr-2 christmas-scroll">
              {Object.entries(groupedItems)
                .filter(
                  ([authorName]) =>
                    authorName.toLowerCase() !== currentUser.toLowerCase()
                )
                .map(([authorName, userItems]) => {
                  const isExpanded = expandedUsers.has(authorName);
                  return (
                    <div key={authorName} className="space-y-4">
                      <button
                        onClick={() => toggleUserExpanded(authorName)}
                        className="w-full text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center justify-between sticky top-0 bg-white backdrop-blur-sm py-3 sm:py-4 rounded-lg px-3 sm:px-4 border border-christmas-gold/20 hover:border-christmas-gold/40 hover:bg-gray-50 transition-all duration-200 min-h-[48px]"
                      >
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2 text-christmas-green" />
                          {authorName}'s Wishlist ({userItems.length})
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-christmas-gold transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-christmas-gold transition-transform duration-200" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="grid gap-4 animate-in slide-in-from-top-2 duration-300">
                          {userItems.map((item) => {
                            const isMyReservation =
                              item.gifter_id &&
                              item.gifter?.name?.toLowerCase() ===
                                currentUser.toLowerCase();
                            const isReserved =
                              item.gifter_id && !isMyReservation;

                            return (
                              <div
                                key={item.id}
                                className="christmas-gift-card p-5"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-bold text-gray-900 flex items-center text-base">
                                    <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                                    {item.item_name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCommentDialog({
                                          isOpen: true,
                                          item,
                                        });
                                      }}
                                      className="p-2 text-gray-500 hover:text-christmas-gold transition-colors rounded-lg hover:bg-gray-50 relative"
                                      title="View comments"
                                    >
                                      <MessageCircle size={18} />
                                      {commentCounts[item.id] > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-christmas-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                          {commentCounts[item.id]}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {item.image_url && (
                                  <div className="mb-4">
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

                                <div className="space-y-3">
                                  {item.price_range && (
                                    <p className="text-sm text-gray-700 flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                                      <DollarSign className="w-4 h-4 mr-2 text-christmas-gold" />
                                      <strong>Price:</strong>{" "}
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

                                  {/* RESERVATION STATUS - COMMENTED OUT FOR NOW */}
                                  {/* {isMyReservation ? (
                                    <div className="bg-green-100 border border-green-300 p-3 rounded-lg text-center">
                                      <p className="text-sm font-bold text-green-800 mb-2">
                                        🎅 You reserved this gift!
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Click to unreserve if you change your
                                        mind
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUnreserveItem(item);
                                        }}
                                        className="christmas-button-secondary w-full text-sm py-3"
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
                                        className="christmas-button-secondary w-full text-sm py-3"
                                      >
                                        🎁 I'll Get This!
                                      </button>
                                    </div>
                                  )} */}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Mobile Layout - Horizontal Scrolling */}
            <div className="sm:hidden space-y-4 pr-2 christmas-scroll">
              {Object.entries(groupedItems)
                .filter(
                  ([authorName]) =>
                    authorName.toLowerCase() !== currentUser.toLowerCase()
                )
                .map(([authorName, userItems]) => (
                  <div key={authorName} className="space-y-3">
                    {/* User Header */}
                    <div className="flex items-center justify-between bg-white backdrop-blur-sm py-3 px-4 rounded-lg border border-christmas-gold/20 sticky top-0 z-10">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-christmas-green" />
                        <span className="text-sm font-bold text-gray-800">
                          {authorName}'s Wishlist
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {userItems.length}
                      </span>
                    </div>

                    {/* Horizontal Scrolling Gift Cards */}
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
                              onClick={() => {
                                if (isMobile()) {
                                  setItemDetailDialog({ isOpen: true, item });
                                }
                              }}
                            >
                              <div className="flex justify-between items-start mb-3 min-w-0">
                                <h4 className="font-bold text-gray-900 flex items-center text-sm leading-tight min-w-0 flex-1 mr-2">
                                  <Gift className="w-4 h-4 mr-1 text-christmas-red flex-shrink-0" />
                                  <span className="truncate">
                                    {item.item_name}
                                  </span>
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCommentDialog({
                                      isOpen: true,
                                      item,
                                    });
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
                                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              )}

                              <div className="space-y-2">
                                {item.price_range && (
                                  <p className="text-xs text-gray-700 flex items-center bg-gray-50 px-2 py-1.5 rounded-lg">
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
                                    <span className="truncate">
                                      View Online
                                    </span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty State - Shown on both mobile and desktop */}
            {Object.entries(groupedItems).filter(
              ([name]) => name.toLowerCase() !== currentUser.toLowerCase()
            ).length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎄</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No other wishlists yet!
                </h3>
                <p className="text-gray-500">
                  Invite your family to add their Christmas wishes.
                </p>
              </div>
            )}
          </div>
          {/* My Wishlist Section */}
          <div className="christmas-section order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-red flex items-center">
                  🎄 <span className="ml-2">My Wishlist</span>
                </h2>
                <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
                  ({getCurrentUserItems().length} items)
                </span>
              </div>
              <button
                onClick={() =>
                  setItemDialog({ isOpen: true, title: "Add New Gift" })
                }
                className="christmas-button text-sm sm:text-base min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Gift
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 p-4 bg-gradient-to-r from-christmas-red/10 to-christmas-green/10 rounded-lg border border-christmas-gold/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  🎯 Wishlist Progress
                </span>
                <span className="text-sm text-gray-600">
                  {getCurrentUserItems().length}/10 gifts
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-christmas-red to-christmas-green transition-all duration-500 ease-out rounded-full relative"
                  style={{
                    width: `${Math.min(
                      (getCurrentUserItems().length / 10) * 100,
                      100
                    )}%`,
                  }}
                >
                  {getCurrentUserItems().length >= 4 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-christmas-gold/30 to-christmas-gold/10 animate-pulse"></div>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 text-center">
                {getCurrentUserItems().length === 0 && (
                  <span>🎁 Start building your Christmas wishlist!</span>
                )}
                {getCurrentUserItems().length > 0 &&
                  getCurrentUserItems().length < 4 && (
                    <span>
                      ✨ Add {4 - getCurrentUserItems().length} more gift
                      {4 - getCurrentUserItems().length !== 1 ? "s" : ""} to
                      reach the minimum!
                    </span>
                  )}
                {getCurrentUserItems().length >= 4 &&
                  getCurrentUserItems().length < 10 && (
                    <span className="text-christmas-green font-medium">
                      🎉 Minimum reached! Add up to{" "}
                      {10 - getCurrentUserItems().length} more for the perfect
                      wishlist!
                    </span>
                  )}
                {getCurrentUserItems().length >= 10 && (
                  <span className="text-christmas-green font-medium">
                    🎉 Perfect! Your wishlist is complete!
                  </span>
                )}
              </div>
            </div>

            {/* Desktop Layout for My Wishlist */}
            <div className="hidden sm:block space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-320px)] pr-2 py-2 christmas-scroll">
              {getCurrentUserItems().length === 0 ? (
                <div className="flex flex-col justify-center text-center py-12 ">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Your wishlist is empty!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some gifts to get started with the Christmas magic.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        setItemDialog({
                          isOpen: true,
                          title: "Add Your First Gift",
                        })
                      }
                      className="christmas-button w-fit"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Gift
                    </button>
                  </div>
                </div>
              ) : (
                getCurrentUserItems().map((item) => (
                  <div key={item.id} className="christmas-gift-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                        {item.item_name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setCommentDialog({ isOpen: true, item })
                          }
                          className="p-2 text-gray-500 hover:text-christmas-gold transition-colors rounded-lg hover:bg-gray-50 relative"
                          title="View comments on your item"
                        >
                          <MessageCircle size={18} />
                          {commentCounts[item.id] > 0 && (
                            <span className="absolute -top-1 -right-1 bg-christmas-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {commentCounts[item.id]}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setItemDialog({
                              isOpen: true,
                              item,
                              title: "Edit Gift",
                            })
                          }
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({ isOpen: true, item })
                          }
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {item.image_url && (
                      <div className="mb-4">
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-full h-full object-cover rounded-xl shadow-md"
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
                          <strong>Price:</strong>{" "}
                          <span className="ml-1">{item.price_range}</span>
                        </p>
                      )}

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Item Online
                        </a>
                      )}

                      {item.gifter_id && (
                        <div className="bg-gradient-to-r from-christmas-green/20 to-green-200/30 p-3 rounded-lg border border-christmas-green/30">
                          <p className="text-sm font-bold text-christmas-green flex items-center">
                            🎅{" "}
                            <span className="ml-2">
                              Someone has reserved this gift for you! 🎁
                            </span>
                          </p>
                          <p className="text-xs text-christmas-green/80 mt-1">
                            It's a surprise! You'll find out who on Christmas
                            Day.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Layout for My Wishlist - Horizontal Scrolling */}
            <div className="sm:hidden">
              {getCurrentUserItems().length === 0 ? (
                <div className="flex flex-col justify-center text-center py-12">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Your wishlist is empty!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some gifts to get started with the Christmas magic.
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() =>
                        setItemDialog({
                          isOpen: true,
                          title: "Add Your First Gift",
                        })
                      }
                      className="christmas-button w-fit"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Gift
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 w-max">
                    {getCurrentUserItems().map((item) => (
                      <div
                        key={item.id}
                        className="christmas-gift-card p-4 w-64 max-w-64 flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => {
                          if (isMobile()) {
                            setItemDetailDialog({ isOpen: true, item });
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-3 min-w-0">
                          <h3 className="font-bold text-gray-800 flex items-center text-sm leading-tight min-w-0 flex-1 mr-2">
                            <Gift className="w-4 h-4 mr-1 text-christmas-red flex-shrink-0" />
                            <span className="truncate">{item.item_name}</span>
                          </h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                setCommentDialog({ isOpen: true, item })
                              }
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
                            <button
                              onClick={() =>
                                setItemDialog({
                                  isOpen: true,
                                  item,
                                  title: "Edit Gift",
                                })
                              }
                              className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 flex-shrink-0"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({ isOpen: true, item })
                              }
                              className="p-1.5 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {item.image_url && (
                          <div className="mb-3">
                            <img
                              src={item.image_url}
                              alt={item.item_name}
                              className="w-full h-32 object-cover rounded-lg shadow-sm"
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
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              <span className="truncate">View Online</span>
                            </a>
                          )}

                          {item.gifter_id && (
                            <div className="bg-gradient-to-r from-christmas-green/20 to-green-200/30 p-2 rounded-lg border border-christmas-green/30">
                              <p className="text-xs font-bold text-christmas-green flex items-center">
                                🎅{" "}
                                <span className="ml-1 truncate">
                                  Reserved for you! 🎁
                                </span>
                              </p>
                              <p className="text-[10px] text-christmas-green/80 mt-1">
                                It's a surprise!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ItemDialog
        isOpen={itemDialog.isOpen}
        onClose={() => setItemDialog({ isOpen: false, title: "" })}
        onSubmit={(data) => {
          if (itemDialog.item) {
            handleUpdateItem(data as UpdateItemData);
          } else {
            handleCreateItem(data as CreateItemData);
          }
        }}
        item={itemDialog.item}
        title={itemDialog.title}
      />

      {/* RESERVATION DIALOG - COMMENTED OUT FOR NOW */}
      {/* <ReserveDialog
        isOpen={reserveDialog.isOpen}
        onClose={() => setReserveDialog({ isOpen: false, item: null })}
        onConfirm={() =>
          reserveDialog.item && handleReserveItem(reserveDialog.item)
        }
        item={reserveDialog.item}
        currentUser={currentUser}
      /> */}

      <CommentDialog
        isOpen={commentDialog.isOpen}
        onClose={() => setCommentDialog({ isOpen: false, item: null })}
        item={commentDialog.item}
        currentUser={currentUser}
        onCommentAdded={() => {
          // Refresh comment counts when a comment is added
          if (commentDialog.item) {
            setCommentCounts((prev) => ({
              ...prev,
              [commentDialog.item!.id]: (prev[commentDialog.item!.id] || 0) + 1,
            }));
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && deleteDialog.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Gift</h3>
                  <p className="text-red-100 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this gift from your wishlist?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-christmas-red">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                    <span className="font-medium text-gray-900">
                      {deleteDialog.item.item_name}
                    </span>
                  </div>
                  {deleteDialog.item.price_range && (
                    <p className="text-sm text-gray-600 mt-1 ml-7">
                      {deleteDialog.item.price_range}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteDialog({ isOpen: false, item: null })}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteDialog.item) {
                      handleDeleteItem(deleteDialog.item.id);
                      setDeleteDialog({ isOpen: false, item: null });
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Gift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Dialog */}
      {itemDetailDialog.isOpen && itemDetailDialog.item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-christmas-red to-christmas-green p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Gift Details</h3>
                    <p className="text-white/80 text-sm">
                      {itemDetailDialog.item.author?.name}'s wishlist
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setItemDetailDialog({ isOpen: false, item: null })}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Gift className="w-6 h-6 mr-2 text-christmas-red" />
                  {itemDetailDialog.item.item_name}
                </h4>

                {itemDetailDialog.item.image_url && (
                  <div className="mb-4">
                    <img
                      src={itemDetailDialog.item.image_url}
                      alt={itemDetailDialog.item.item_name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {itemDetailDialog.item.price_range && (
                    <div className="bg-christmas-gold/10 p-4 rounded-lg border-l-4 border-christmas-gold">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-christmas-gold" />
                        <span className="font-medium text-gray-900">Price Range</span>
                      </div>
                      <p className="text-gray-700 mt-1 ml-7">
                        {itemDetailDialog.item.price_range}
                      </p>
                    </div>
                  )}

                  {itemDetailDialog.item.link && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center mb-2">
                        <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-medium text-gray-900">Product Link</span>
                      </div>
                      <a
                        href={itemDetailDialog.item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {itemDetailDialog.item.link}
                      </a>
                    </div>
                  )}

                  {itemDetailDialog.item.gifter_id && (
                    <div className="bg-gradient-to-r from-christmas-green/20 to-green-200/30 p-4 rounded-lg border-l-4 border-christmas-green">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎅</span>
                        <div>
                          <p className="font-bold text-christmas-green">
                            This gift has been reserved!
                          </p>
                          <p className="text-sm text-christmas-green/80 mt-1">
                            {itemDetailDialog.item.author?.name?.toLowerCase() === currentUser.toLowerCase() 
                              ? "Someone will surprise you with this gift on Christmas Day!"
                              : "This gift is no longer available for reservation."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center mb-2">
                      <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="font-medium text-gray-900">Comments</span>
                      {commentCounts[itemDetailDialog.item.id] > 0 && (
                        <span className="ml-2 bg-christmas-red text-white text-xs rounded-full px-2 py-1">
                          {commentCounts[itemDetailDialog.item.id]}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setCommentDialog({ isOpen: true, item: itemDetailDialog.item });
                        setItemDetailDialog({ isOpen: false, item: null });
                      }}
                      className="text-sm text-gray-600 hover:text-christmas-gold transition-colors"
                    >
                      Click to view and add comments
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setItemDetailDialog({ isOpen: false, item: null })}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {itemDetailDialog.item.author?.name?.toLowerCase() === currentUser.toLowerCase() && (
                  <button
                    onClick={() => {
                      setItemDialog({
                        isOpen: true,
                        item: itemDetailDialog.item || undefined,
                        title: "Edit Gift",
                      });
                      setItemDetailDialog({ isOpen: false, item: null });
                    }}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Gift
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain Cost Note */}
      {showDomainNote && (
        <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-christmas-gold/30 p-3 text-xs text-gray-600 max-w-xs transition-opacity duration-500">
          <div className="flex items-center justify-between">
            <p className="flex items-center">
              <span className="mr-1">💰</span>
              PS: Renewing the domain cost me $15 USD
            </p>
            <button
              onClick={() => setShowDomainNote(false)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
