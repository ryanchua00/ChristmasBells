"use client";

import { useState, useEffect, useRef } from "react";
import { X, Gift, Link, DollarSign, Image, Upload, Trash2 } from "lucide-react";
import { CreateItemData, UpdateItemData, Item } from "../types";

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItemData | UpdateItemData) => void;
  item?: Item;
  title: string;
}

export default function ItemDialog({
  isOpen,
  onClose,
  onSubmit,
  item,
  title,
}: ItemDialogProps) {
  const [formData, setFormData] = useState({
    item_name: "",
    link: "",
    price_range: "",
    image_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      // let itemURL = "";
      // if (
      //   process.env.NEXT_PUBLIC_SUPABASE_URL &&
      //   !item.image_url?.includes(process.env.NEXT_PUBLIC_SUPABASE_URL)
      // ) {
      //   itemURL =
      // }
      setFormData({
        item_name: item.item_name,
        link: item.link || "",
        price_range: item.price_range || "",
        image_url: item.image_url || "",
      });
      setPreviewUrl(item.image_url || "");
    } else {
      setFormData({
        item_name: "",
        link: "",
        price_range: "",
        image_url: "",
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setUploading(false);
  }, [item, isOpen]);

  // Validate and process file
  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return false;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return false;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear image URL when file is selected
    setFormData({ ...formData, image_url: "" });
    return true;
  };

  // Handle file selection from input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      processFile(imageFile);
    } else if (files.length > 0) {
      alert("Please drop an image file");
    }
  };

  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, image_url: url });
    setPreviewUrl(url);

    // Clear selected file when URL is entered
    if (url && selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove image
  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData({ ...formData, image_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);

      let imageUrl = formData.image_url;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const submitData = {
        ...formData,
        link: formData.link || undefined,
        price_range: formData.price_range || undefined,
        image_url: imageUrl || undefined,
      };

      if (item) {
        onSubmit({ ...submitData, id: item.id } as UpdateItemData);
      } else {
        onSubmit(submitData as CreateItemData);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="christmas-card p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-christmas-red flex items-center">
            <Gift className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gift className="inline w-4 h-4 mr-1" />
              Gift Name *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              className="christmas-input"
              placeholder="What would you like for Christmas?"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="inline w-4 h-4 mr-1" />
              Link (Optional)
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="christmas-input"
              placeholder="https://example.com/gift"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Price Range (Optional)
            </label>
            <input
              type="text"
              value={formData.price_range}
              onChange={(e) =>
                setFormData({ ...formData, price_range: e.target.value })
              }
              className="christmas-input"
              placeholder="$10-50, Under $100, etc."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="inline w-4 h-4 mr-1" />
              Image (Optional)
            </label>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-4 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={() => setPreviewUrl("")}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-3">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-christmas-gold bg-christmas-gold/10 scale-105"
                      : "border-gray-300 hover:border-christmas-gold hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload
                    className={`w-8 h-8 mb-2 transition-colors ${
                      isDragOver ? "text-christmas-gold" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isDragOver ? "text-christmas-gold" : "text-gray-600"
                    }`}
                  >
                    {selectedFile ? (
                      <span className="text-center">
                        <div className="font-semibold">{selectedFile.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Click to change or drag new image
                        </div>
                      </span>
                    ) : (
                      <span className="text-center">
                        <div>
                          {isDragOver
                            ? "Drop image here"
                            : "Click to upload or drag & drop"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </div>
                      </span>
                    )}
                  </span>
                </label>
              </div>

              <div className="text-center text-sm text-gray-500">or</div>

              {/* URL Input */}
              <input
                type="url"
                value={
                  formData.image_url.includes(
                    process.env.NEXT_PUBLIC_SUPABASE_URL || ""
                  )
                    ? ""
                    : formData.image_url
                }
                onChange={handleImageUrlChange}
                className="christmas-input"
                placeholder="https://example.com/image.jpg"
                maxLength={500}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Drag & drop, click to upload (max 5MB), or enter an image URL
              below
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[48px] text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="christmas-button flex-1 min-h-[48px] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </span>
              ) : item ? (
                "🎁 Update Gift"
              ) : (
                "🎄 Add to Wishlist"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
