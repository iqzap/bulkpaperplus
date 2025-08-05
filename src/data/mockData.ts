import { User, SubscriptionPlan, UserSubscription } from '../types/dashboard';

export const mockUsers: User[] = [
  { id: 'U-1138', name: 'Anya Sharma', email: 'anya.s@email.com', phone: '0812-3456-7890' },
  { id: 'U-8752', name: 'Fajar Nugraha', email: 'fajar.n@email.com', phone: '0877-5555-4321' },
  { id: 'U-2847', name: 'Budi Hartono', email: 'budi.h@email.com', phone: '0821-9876-5432' },
  { id: 'U-9163', name: 'Chandra Wijaya', email: 'chandra.w@email.com', phone: '0813-1111-2222' },
  { id: 'U-5739', name: 'Dita Lestari', email: 'dita.l@email.com', phone: '0856-3333-4444' },
  { id: 'U-4821', name: 'Clark Kent', email: 'clark.k@dailyplanet.com', phone: '0877-9999-8888' },
  { id: 'U-6492', name: 'Maya Putri', email: 'maya.p@email.com', phone: '0818-7777-6666' },
  { id: 'U-7531', name: 'Rudi Santoso', email: 'rudi.s@email.com', phone: '0823-5555-3333' },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  { id: 'plan-trial', name: 'Paper+ Trial', duration: '30 days', price: 0, description: 'Free trial period' },
  { id: 'plan-onboarding', name: 'Paper+ Onboarding Promo', duration: '3 months', price: 50000, description: 'Special onboarding offer' },
  { id: 'plan-1year', name: 'Paper+ One Year', duration: '1 year', price: 250000, description: 'Annual subscription' },
  { id: 'plan-5year', name: 'Paper+ Five Years', duration: '5 years', price: 1000000, description: 'Long-term subscription' },
  { id: 'plan-lifetime', name: 'Paper+ Lifetime', duration: 'Lifetime', price: 2500000, description: 'One-time lifetime access' },
];

export const mockUserSubscriptions: UserSubscription[] = [
  {
    userId: 'U-1138',
    planId: 'plan-1year',
    planName: 'Paper+ One Year',
    status: 'active',
    startDate: '2025-08-05',
    endDate: '2026-08-05'
  },
  {
    userId: 'U-8752',
    planId: 'plan-5year',
    planName: 'Paper+ Five Years',
    status: 'active',
    startDate: '2025-08-05',
    endDate: '2030-08-05'
  },
  {
    userId: 'U-2847',
    planId: 'plan-trial',
    planName: 'Paper+ Trial',
    status: 'expired',
    startDate: '2025-06-01',
    endDate: '2025-07-01'
  },
  {
    userId: 'U-9163',
    planId: 'plan-onboarding',
    planName: 'Paper+ Onboarding Promo',
    status: 'active',
    startDate: '2025-07-01',
    endDate: '2025-10-01'
  },
];