export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
}
