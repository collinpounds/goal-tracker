import { Team } from './team.types';
import { Category } from './category.types';

export enum GoalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  status: GoalStatus;
  target_date: string | null; // ISO datetime string
  created_at: string; // ISO datetime string
  is_public: boolean;
  user_id: string;
  teams?: Team[];
  categories?: Category[];
}

export interface GoalCreate {
  title: string;
  description?: string | null;
  status?: GoalStatus;
  target_date?: string | null;
  is_public?: boolean;
  team_ids?: number[];
  category_ids?: number[];
}

export interface GoalUpdate {
  title?: string;
  description?: string | null;
  status?: GoalStatus;
  target_date?: string | null;
  is_public?: boolean;
  team_ids?: number[];
  category_ids?: number[];
}

export interface GoalFilters {
  status: GoalStatus[];
  team_ids: number[];
  category_ids: number[];
  search: string;
  date_range: {
    start: string | null;
    end: string | null;
  };
  sort_by: 'created_at' | 'target_date' | 'title';
  sort_order: 'asc' | 'desc';
}
