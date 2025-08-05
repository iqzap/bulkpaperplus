export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price?: number;
  description?: string;
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  planName: string;
}

export type UserFilter = 'active' | 'expired' | 'none' | 'all';

export interface DashboardState {
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  filter: UserFilter;
  searchTerm: string;
}