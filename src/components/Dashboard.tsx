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
} from "lucide-react";
import toast from "react-hot-toast";
import { Item, CreateItemData, UpdateItemData } from "../types";
import { getRandomMessage } from "../lib/utils";
import ItemDialog from "./ItemDialog";
import ReserveDialog from "./ReserveDialog";

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

  useEffect(() => {
    fetchItems();
    // Register user in database
    registerUser();
  }, []);

  // Initialize expanded users when items are loaded
  useEffect(() => {
    if (items.length > 0) {
      const otherUsers = Object.keys(groupedItems).filter(
        (name) => name !== currentUser
      );
      if (otherUsers.length > 0 && expandedUsers.size === 0) {
        setExpandedUsers(new Set([otherUsers[0]]));
      }
    }
  }, [items, currentUser]);

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
        body: JSON.stringify({ name: currentUser }),
      });
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      toast.error(getRandomMessage("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (data: CreateItemData) => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, author_name: currentUser }),
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
    if (
      !confirm(
        "🎄 Are you sure you want to remove this gift from your wishlist?"
      )
    ) {
      return;
    }

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
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center font-semibold text-sm sm:text-base min-h-[44px]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
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
                  .filter(([name]) => name !== currentUser)
                  .reduce((acc, [, items]) => acc + items.length, 0)}{" "}
                items
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-280px)] pr-2 christmas-scroll">
              {Object.entries(groupedItems)
                .filter(([authorName]) => authorName !== currentUser)
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
                              item.gifter?.name === currentUser;
                            const isReserved =
                              item.gifter_id && !isMyReservation;

                            return (
                              <div
                                key={item.id}
                                className={`p-5 transition-all duration-300 ${
                                  isMyReservation
                                    ? "christmas-gift-card-my-reservation"
                                    : isReserved
                                    ? "christmas-gift-card-reserved"
                                    : "christmas-gift-card cursor-pointer"
                                }`}
                                onClick={() => {
                                  if (isMyReservation) {
                                    handleUnreserveItem(item);
                                  } else if (!item.gifter_id) {
                                    setReserveDialog({ isOpen: true, item });
                                  }
                                }}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-bold text-gray-900 flex items-center text-base">
                                    <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                                    {item.item_name}
                                  </h4>
                                  {isMyReservation && (
                                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-medium">
                                      My Gift
                                    </span>
                                  )}
                                  {isReserved && (
                                    <span className="text-xs bg-gray-500 text-white px-3 py-1 rounded-full">
                                      Reserved
                                    </span>
                                  )}
                                </div>

                                {item.image_url && (
                                  <div className="mb-4">
                                    <img
                                      src={item.image_url}
                                      alt={item.item_name}
                                      className="w-full h-36 object-cover rounded-lg shadow-sm"
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

                                  {isMyReservation ? (
                                    <div className="bg-green-100 border border-green-300 p-3 rounded-lg text-center">
                                      <p className="text-sm font-bold text-green-800 mb-2">
                                        🎅 You reserved this gift!
                                      </p>
                                      <p className="text-xs text-green-600">
                                        Click to unreserve if you change your
                                        mind
                                      </p>
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
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              {Object.entries(groupedItems).filter(
                ([name]) => name !== currentUser
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
          </div>
          {/* My Wishlist Section */}
          <div className="christmas-section order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-red flex items-center">
                  🎄 <span className="ml-2">My Wishlist</span>
                </h2>
                <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
                  ({(groupedItems[currentUser] || []).length} items)
                </span>
              </div>
              <button
                onClick={() =>
                  setItemDialog({ isOpen: true, title: "Add New Gift" })
                }
                className="christmas-button flex items-center text-sm sm:text-base min-h-[44px] px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Gift
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-320px)] pr-2 py-2 christmas-scroll">
              {(groupedItems[currentUser] || []).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Your wishlist is empty!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some gifts to get started with the Christmas magic.
                  </p>
                  <button
                    onClick={() =>
                      setItemDialog({
                        isOpen: true,
                        title: "Add Your First Gift",
                      })
                    }
                    className="christmas-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Gift
                  </button>
                </div>
              ) : (
                (groupedItems[currentUser] || []).map((item) => (
                  <div key={item.id} className="christmas-gift-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                        {item.item_name}
                      </h3>
                      <div className="flex gap-2">
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
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
                              Reserved by{" "}
                              {item.gifter?.name === currentUser
                                ? "You"
                                : item.gifter?.name}
                              !
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
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
