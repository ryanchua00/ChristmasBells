"use client";

import {
  Plus,
  Edit,
  Trash2,
  Gift,
  ExternalLink,
  DollarSign,
  MessageCircle,
} from "lucide-react";
import { Item } from "../types";

interface MyWishlistProps {
  currentUserItems: Item[];
  currentUser: string;
  commentCounts: Record<number, number>;
  onAddGift: () => void;
  onEditGift: (item: Item) => void;
  onDeleteGift: (item: Item) => void;
  onCommentClick: (item: Item) => void;
  onItemDetailClick: (item: Item) => void;
}

export default function MyWishlist({
  currentUserItems,
  currentUser,
  commentCounts,
  onAddGift,
  onEditGift,
  onDeleteGift,
  onCommentClick,
  onItemDetailClick,
}: MyWishlistProps) {
  // Function to check if device is mobile
  const isMobile = () => {
    return window.innerWidth < 640; // sm breakpoint in Tailwind
  };

  return (
    <div className="christmas-section order-1 lg:order-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-christmas-red flex items-center">
            🎄 <span className="ml-2">My Wishlist</span>
          </h2>
          <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
            ({currentUserItems.length} items)
          </span>
        </div>
        <button
          onClick={onAddGift}
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
            {currentUserItems.length}/10 gifts
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-christmas-red to-christmas-green transition-all duration-500 ease-out rounded-full relative"
            style={{
              width: `${Math.min(
                (currentUserItems.length / 10) * 100,
                100
              )}%`,
            }}
          >
            {currentUserItems.length >= 4 && (
              <div className="absolute inset-0 bg-gradient-to-r from-christmas-gold/30 to-christmas-gold/10 animate-pulse"></div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-600 text-center">
          {currentUserItems.length === 0 && (
            <span>🎁 Start building your Christmas wishlist!</span>
          )}
          {currentUserItems.length > 0 && currentUserItems.length < 4 && (
            <span>
              ✨ Add {4 - currentUserItems.length} more gift
              {4 - currentUserItems.length !== 1 ? "s" : ""} to reach the
              minimum!
            </span>
          )}
          {currentUserItems.length >= 4 && currentUserItems.length < 10 && (
            <span className="text-christmas-green font-medium">
              🎉 Minimum reached! Add up to{" "}
              {10 - currentUserItems.length} more for the perfect wishlist!
            </span>
          )}
          {currentUserItems.length >= 10 && (
            <span className="text-christmas-green font-medium">
              🎉 Perfect! Your wishlist is complete!
            </span>
          )}
        </div>
      </div>

      {/* Desktop Layout for My Wishlist */}
      <div className="hidden sm:block space-y-4 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-320px)] pr-2 py-2 christmas-scroll">
        {currentUserItems.length === 0 ? (
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
                onClick={onAddGift}
                className="christmas-button w-fit"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Gift
              </button>
            </div>
          </div>
        ) : (
          currentUserItems.map((item) => (
            <div key={item.id} className="christmas-gift-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-christmas-red" />
                  {item.item_name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCommentClick(item)}
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
                    onClick={() => onEditGift(item)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteGift(item)}
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
                      It's a surprise! You'll find out who on Christmas Day.
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
        {currentUserItems.length === 0 ? (
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
                onClick={onAddGift}
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
              {currentUserItems.map((item) => (
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
                    <h3 className="font-bold text-gray-800 flex items-center text-sm leading-tight min-w-0 flex-1 mr-2">
                      <Gift className="w-4 h-4 mr-1 text-christmas-red flex-shrink-0" />
                      <span className="truncate">{item.item_name}</span>
                    </h3>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => onCommentClick(item)}
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
                        onClick={() => onEditGift(item)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 flex-shrink-0"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteGift(item)}
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
  );
}
