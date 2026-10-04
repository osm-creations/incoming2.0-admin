export type User = {
  id: string;
  public_user_id?: string;
  publicUserId?: string;
  email: string;
  role: 'ADMIN' | 'MAGICIAN';
  status: 'ACTIVE' | 'DISABLED';
  force_password_change?: number;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
};

export type DashboardData = {
  counts: { total: number; active: number; disabled: number };
  recent: User[];
};
