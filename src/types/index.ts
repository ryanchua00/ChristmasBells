export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface Item {
  id: number;
  item_name: string;
  link?: string;
  price_range?: string;
  image_url?: string;
  author_id: number;
  gifter_id?: number;
  created_at: string;
  updated_at: string;
  author?: User;
  gifter?: User;
}

export interface CreateItemData {
  item_name: string;
  link?: string;
  price_range?: string;
  image_url?: string;
}

export interface UpdateItemData extends CreateItemData {
  id: number;
}

export interface Comment {
  id: number;
  item_id: number;
  author_name: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentData {
  comment_text: string;
}
