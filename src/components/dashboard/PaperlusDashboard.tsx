import { useState, useMemo } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { FilterTabs } from './FilterTabs';
import { UserTable } from './UserTable';
import { BulkSubscriptionModal } from './modals/BulkSubscriptionModal';
import { IndividualSubscriptionModal } from './modals/IndividualSubscriptionModal';
import { EditUserModal } from './modals/EditUserModal';
import { User, UserSubscription, SubscriptionPlan, UserFilter } from '@/types/dashboard';
import { mockUsers, mockSubscriptionPlans, mockUserSubscriptions } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export const PaperlusDashboard = () => {
  const [users] = useState<User[]>(mockUsers);
  const [subscriptionPlans] = useState<SubscriptionPlan[]>(mockSubscriptionPlans);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>(mockUserSubscriptions);
  const [filter, setFilter] = useState<UserFilter>('active');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const { toast } = useToast();

  // Helper function to generate unique subscription ID
  const generateSubscriptionId = () => {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to calculate stacked subscription dates
  const calculateStackedDates = (userId: string, planId: string): { startDate: string; endDate: string | null } => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    const userActiveSubscriptions = userSubscriptions.filter(sub => 
      sub.userId === userId && sub.status === 'active'
    );
    
    // Find the latest end date among active subscriptions
    let startDate: Date;
    if (userActiveSubscriptions.length === 0) {
      startDate = new Date();
    } else {
      const latestEndDate = userActiveSubscriptions.reduce((latest, sub) => {
        const endDate = sub.endDate ? new Date(sub.endDate) : new Date(2099, 11, 31);
        return !latest || endDate > latest ? endDate : latest;
      }, null as Date | null);
      startDate = latestEndDate || new Date();
    }
    
    // Calculate end date based on plan duration
    let endDate: Date | null = new Date(startDate);
    switch (plan?.duration) {
      case '30 days':
        endDate.setDate(endDate.getDate() + 30);
        break;
      case '3 months':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '1 year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case '5 years':
        endDate.setFullYear(endDate.getFullYear() + 5);
        break;
      case 'Lifetime':
        endDate = null; // Lifetime subscription
        break;
      default:
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return { 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate ? endDate.toISOString().split('T')[0] : null 
    };
  };

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => {
        const userSubs = userSubscriptions.filter(sub => sub.userId === user.id);
        
        switch (filter) {
          case 'active':
            return userSubs.some(sub => sub.status === 'active');
          case 'expired':
            return userSubs.length > 0 && userSubs.every(sub => sub.status === 'expired');
          case 'none':
            return userSubs.length === 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [users, userSubscriptions, filter, searchTerm]);

  // Calculate counts for tabs
  const counts = useMemo(() => {
    const active = users.filter(user => {
      const userSubs = userSubscriptions.filter(sub => sub.userId === user.id);
      return userSubs.some(sub => sub.status === 'active');
    }).length;
    
    const expired = users.filter(user => {
      const userSubs = userSubscriptions.filter(sub => sub.userId === user.id);
      return userSubs.length > 0 && userSubs.every(sub => sub.status === 'expired');
    }).length;
    
    const none = users.filter(user => {
      const userSubs = userSubscriptions.filter(sub => sub.userId === user.id);
      return userSubs.length === 0;
    }).length;

    return { active, expired, none, all: users.length };
  }, [users, userSubscriptions]);

  // Modal handlers
  const handleBulkSubscription = (planId: string, selectedUserIds: string[]) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    const newSubscriptions: UserSubscription[] = [];

    selectedUserIds.forEach(userId => {
      const { startDate, endDate } = calculateStackedDates(userId, planId);
      
      // Add new stacked subscription
      const newSubscription: UserSubscription = {
        id: generateSubscriptionId(),
        userId,
        planId,
        planName: plan.name,
        status: 'active',
        startDate,
        endDate
      };
      
      newSubscriptions.push(newSubscription);
    });
    
    setUserSubscriptions(prev => [...prev, ...newSubscriptions]);

    toast({
      title: "Bulk Subscription Added",
      description: `Successfully added ${plan.name} to ${selectedUserIds.length} users (stacked).`,
    });
  };

  const handleIndividualSubscriptions = (subscriptions: Array<{ userId: string; planId: string }>) => {
    const newSubscriptions: UserSubscription[] = [];

    subscriptions.forEach(({ userId, planId }) => {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) return;

      const { startDate, endDate } = calculateStackedDates(userId, planId);
      
      // Add new stacked subscription
      const newSubscription: UserSubscription = {
        id: generateSubscriptionId(),
        userId,
        planId,
        planName: plan.name,
        status: 'active',
        startDate,
        endDate
      };
      
      newSubscriptions.push(newSubscription);
    });
    
    setUserSubscriptions(prev => [...prev, ...newSubscriptions]);

    toast({
      title: "Individual Subscriptions Added",
      description: `Successfully added subscriptions to ${subscriptions.length} users (stacked).`,
    });
  };

  const handleUpdateSubscription = (userId: string, planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    const { startDate, endDate } = calculateStackedDates(userId, planId);
    
    // Add new stacked subscription
    const newSubscription: UserSubscription = {
      id: generateSubscriptionId(),
      userId,
      planId,
      planName: plan.name,
      status: 'active',
      startDate,
      endDate
    };
    
    setUserSubscriptions(prev => [...prev, newSubscription]);

    toast({
      title: "Subscription Added",
      description: `Successfully added ${plan.name} subscription (stacked).`,
    });
  };

  const handleDeleteSubscription = (userId: string) => {
    setUserSubscriptions(prev => prev.filter(sub => sub.userId !== userId));
    
    toast({
      title: "All Subscriptions Deleted",
      description: "Successfully removed all user subscriptions.",
      variant: "destructive",
    });
  };

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setShowEditModal(true);
  };

  // Get data for edit modal
  const editingUser = editingUserId ? users.find(user => user.id === editingUserId) || null : null;
  const editingUserSubscriptions = editingUserId ? userSubscriptions.filter(sub => sub.userId === editingUserId) : [];

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <DashboardHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBulkSubscription={() => setShowBulkModal(true)}
        onAddIndividual={() => setShowIndividualModal(true)}
      />
      
      <FilterTabs
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />
      
      <div className="p-6">
        <UserTable
          users={filteredUsers}
          subscriptions={userSubscriptions}
          onEditUser={handleEditUser}
        />
      </div>

      {/* Modals */}
      <BulkSubscriptionModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        users={users}
        subscriptionPlans={subscriptionPlans}
        onConfirm={handleBulkSubscription}
      />

      <IndividualSubscriptionModal
        isOpen={showIndividualModal}
        onClose={() => setShowIndividualModal(false)}
        users={users}
        subscriptionPlans={subscriptionPlans}
        onConfirm={handleIndividualSubscriptions}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={editingUser}
        userSubscriptions={editingUserSubscriptions}
        subscriptionPlans={subscriptionPlans}
        onUpdateSubscription={handleUpdateSubscription}
        onDeleteSubscription={handleDeleteSubscription}
      />
    </div>
  );
};