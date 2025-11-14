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
import ReserveDialog from "./ReserveDialog";
import CommentDialog from "./CommentDialog";
import AssignedWishlists from "./AssignedWishlists";
import MyWishlist from "./MyWishlist";

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
  const [reserveDialog, setReserveDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
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
      if (items.length === 0) return;

      // Get all item IDs
      const itemIds = items.map(item => item.id);

      // Fetch comment counts for all items in a single batch request
      const response = await fetch('/api/comments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCommentCounts(data.commentCounts || {});
      } else {
        console.error('Error fetching batch comments:', data.error);
        // Fallback to empty counts
        const emptyCounts: Record<number, number> = {};
        items.forEach(item => {
          emptyCounts[item.id] = 0;
        });
        setCommentCounts(emptyCounts);
      }
    } catch (error) {
      console.error("Error fetching comment counts:", error);
      // Fallback to empty counts
      const emptyCounts: Record<number, number> = {};
      items.forEach(item => {
        emptyCounts[item.id] = 0;
      });
      setCommentCounts(emptyCounts);
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

  // RESERVATION FUNCTIONALITY - RE-ENABLED

  const handleReserveItem = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gifter_name: currentUser }),
      });

      const result = await response.json();

      if (response.ok && result.item) {
        // Success - update the item in the list
        setItems(items.map((i) => (i.id === item.id ? result.item : i)));
        toast.success("🎅 You're now the secret Santa for this gift!");
        setReserveDialog({ isOpen: false, item: null });
      } else if (result.alreadyReserved) {
        // Item was already reserved - update the item if provided and show specific message
        if (result.item) {
          setItems(items.map((i) => (i.id === item.id ? result.item : i)));
        }
        toast.error(
          result.error || "🎅 Oops! Someone else just reserved this gift!"
        );
        setReserveDialog({ isOpen: false, item: null });
        // Refresh the items to get the latest state
        fetchItems();
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
        setItems(items.map((i) => (i.id === item.id ? result.item : i)));
        toast.success("🎁 Gift unreserved! It's available for others now.");
      } else {
        toast.error(result.error || getRandomMessage("error"));
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    }
  };

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
        <div className="mb-6 p-4 bg-christmas-red rounded-lg border border-christmas-gold/50 shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-christmas-gold/30 rounded-full flex items-center justify-center mr-4">
              <span className="text-xl">🎅</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                🎁 Secret Santa Phase
              </h3>
              <p className="text-white text-sm leading-relaxed">
                Ho ho ho! The <strong>Secret Santa assignments</strong> are now active!
                You can see your assigned people's wishlists and reserve gifts for them.
                Remember to label each gift with the recipient's ID number! 🎅✨
              </p>
              <div className="mt-3 flex items-center text-xs text-white">
                <span className="w-2 h-2 bg-christmas-gold rounded-full mr-2 animate-pulse"></span>
                Phase 2 of 2: Secret Santa Shopping
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
          {/* Assigned Wishlists Section */}
          <AssignedWishlists
            currentUser={currentUser}
            commentCounts={commentCounts}
            onCommentClick={(item) => setCommentDialog({ isOpen: true, item })}
            onItemDetailClick={(item) =>
              setItemDetailDialog({ isOpen: true, item })
            }
          />

          {/* My Wishlist Section */}
          <MyWishlist
            currentUserItems={getCurrentUserItems()}
            currentUser={currentUser}
            commentCounts={commentCounts}
            onAddGift={() =>
              setItemDialog({ isOpen: true, title: "Add New Gift" })
            }
            onEditGift={(item) =>
              setItemDialog({ isOpen: true, item, title: "Edit Gift" })
            }
            onDeleteGift={(item) => setDeleteDialog({ isOpen: true, item })}
            onCommentClick={(item) => setCommentDialog({ isOpen: true, item })}
            onItemDetailClick={(item) =>
              setItemDetailDialog({ isOpen: true, item })
            }
          />
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

      <ReserveDialog
        isOpen={reserveDialog.isOpen}
        onClose={() => setReserveDialog({ isOpen: false, item: null })}
        onConfirm={() =>
          reserveDialog.item && handleReserveItem(reserveDialog.item)
        }
        item={reserveDialog.item}
        currentUser={currentUser}
      />

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
                  onClick={() =>
                    setItemDetailDialog({ isOpen: false, item: null })
                  }
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
                        <span className="font-medium text-gray-900">
                          Price Range
                        </span>
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
                        <span className="font-medium text-gray-900">
                          Product Link
                        </span>
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

                  {itemDetailDialog.item.gifter_id && 
                   itemDetailDialog.item.author?.name?.toLowerCase() !== currentUser.toLowerCase() && (
                    <div className="bg-gradient-to-r from-christmas-green/20 to-green-200/30 p-4 rounded-lg border-l-4 border-christmas-green">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🎅</span>
                        <div>
                          <p className="font-bold text-christmas-green">
                            This gift has been reserved!
                          </p>
                          <p className="text-sm text-christmas-green/80 mt-1">
                            This gift is no longer available for reservation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    <div className="flex items-center mb-2">
                      <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Comments
                      </span>
                      {commentCounts[itemDetailDialog.item.id] > 0 && (
                        <span className="ml-2 bg-christmas-red text-white text-xs rounded-full px-2 py-1">
                          {commentCounts[itemDetailDialog.item.id]}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setCommentDialog({
                          isOpen: true,
                          item: itemDetailDialog.item,
                        });
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
                  onClick={() =>
                    setItemDetailDialog({ isOpen: false, item: null })
                  }
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {itemDetailDialog.item.author?.name?.toLowerCase() ===
                  currentUser.toLowerCase() && (
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
