export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  related_id: number | null;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type: string;
  related_id?: number | null;
}
