"use client";

import { useState } from "react";
import {
  Gift,
  ExternalLink,
  DollarSign,
  User,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Item } from "../types";

interface FamilyGiftsProps {
  groupedItems: Record<string, Item[]>;
  currentUser: string;
  commentCounts: Record<number, number>;
  onCommentClick: (item: Item) => void;
  onItemDetailClick: (item: Item) => void;
}

export default function FamilyGifts({
  groupedItems,
  currentUser,
  commentCounts,
  onCommentClick,
  onItemDetailClick,
}: FamilyGiftsProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Function to check if device is mobile
  const isMobile = () => {
    return window.innerWidth < 640; // sm breakpoint in Tailwind
  };

  const toggleUserExpanded = (userName: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userName)) {
      newExpanded.delete(userName);
    } else {
      newExpanded.add(userName);
    }
    setExpandedUsers(newExpanded);
  };

  // Initialize expanded users when component mounts
  useState(() => {
    const otherUsers = Object.keys(groupedItems).filter(
      (name) => name.toLowerCase() !== currentUser.toLowerCase()
    );
    if (otherUsers.length > 0 && expandedUsers.size === 0) {
      setExpandedUsers(new Set([otherUsers[0]]));
    }
  });

  const otherUsersItems = Object.entries(groupedItems).filter(
    ([name]) => name.toLowerCase() !== currentUser.toLowerCase()
  );

  return (
    <div className="christmas-section order-2 lg:order-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-green flex items-center">
          🎁 <span className="ml-2">Family Gifts</span>
        </h2>
        <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
          {otherUsersItems.reduce((acc, [, items]) => acc + items.length, 0)}{" "}
          items
        </span>
      </div>

      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden sm:block space-y-4 sm:space-y-6 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-280px)] pr-2 christmas-scroll">
        {otherUsersItems.map(([authorName, userItems]) => {
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
                    const isReserved = item.gifter_id && !isMyReservation;

                    return (
                      <div key={item.id} className="christmas-gift-card p-5">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-gray-900 flex items-center text-base">
                            <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                            {item.item_name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCommentClick(item);
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
                              <span className="ml-1">{item.price_range}</span>
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
        {otherUsersItems.map(([authorName, userItems]) => (
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
                          onItemDetailClick(item);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-3 min-w-0">
                        <h4 className="font-bold text-gray-900 flex items-center text-sm leading-tight min-w-0 flex-1 mr-2">
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
                            <span className="truncate">View Online</span>
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
      {otherUsersItems.length === 0 && (
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
  );
}
