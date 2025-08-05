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

  // Helper function to add date to subscription
  const addSubscriptionDates = (planId: string): { startDate: string; endDate: string } => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    const startDate = new Date().toISOString().split('T')[0];
    
    let endDate = new Date();
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
        endDate.setFullYear(endDate.getFullYear() + 100); // Far future for lifetime
        break;
      default:
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    return { startDate, endDate: endDate.toISOString().split('T')[0] };
  };

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => {
        const subscription = userSubscriptions.find(sub => sub.userId === user.id);
        
        switch (filter) {
          case 'active':
            return subscription?.status === 'active';
          case 'expired':
            return subscription?.status === 'expired';
          case 'none':
            return !subscription;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [users, userSubscriptions, filter, searchTerm]);

  // Calculate counts for tabs
  const counts = useMemo(() => {
    const active = users.filter(user => 
      userSubscriptions.find(sub => sub.userId === user.id && sub.status === 'active')
    ).length;
    
    const expired = users.filter(user => 
      userSubscriptions.find(sub => sub.userId === user.id && sub.status === 'expired')
    ).length;
    
    const none = users.filter(user => 
      !userSubscriptions.find(sub => sub.userId === user.id)
    ).length;

    return { active, expired, none, all: users.length };
  }, [users, userSubscriptions]);

  // Modal handlers
  const handleBulkSubscription = (planId: string, selectedUserIds: string[]) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    const { startDate, endDate } = addSubscriptionDates(planId);

    selectedUserIds.forEach(userId => {
      // Remove existing subscription if any
      setUserSubscriptions(prev => prev.filter(sub => sub.userId !== userId));
      
      // Add new subscription
      const newSubscription: UserSubscription = {
        userId,
        planId,
        planName: plan.name,
        status: 'active',
        startDate,
        endDate
      };
      
      setUserSubscriptions(prev => [...prev, newSubscription]);
    });

    toast({
      title: "Bulk Subscription Added",
      description: `Successfully added ${plan.name} to ${selectedUserIds.length} users.`,
    });
  };

  const handleIndividualSubscriptions = (subscriptions: Array<{ userId: string; planId: string }>) => {
    subscriptions.forEach(({ userId, planId }) => {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) return;

      const { startDate, endDate } = addSubscriptionDates(planId);

      // Remove existing subscription if any
      setUserSubscriptions(prev => prev.filter(sub => sub.userId !== userId));
      
      // Add new subscription
      const newSubscription: UserSubscription = {
        userId,
        planId,
        planName: plan.name,
        status: 'active',
        startDate,
        endDate
      };
      
      setUserSubscriptions(prev => [...prev, newSubscription]);
    });

    toast({
      title: "Individual Subscriptions Added",
      description: `Successfully added subscriptions to ${subscriptions.length} users.`,
    });
  };

  const handleUpdateSubscription = (userId: string, planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    const { startDate, endDate } = addSubscriptionDates(planId);

    // Remove existing subscription
    setUserSubscriptions(prev => prev.filter(sub => sub.userId !== userId));
    
    // Add new subscription
    const newSubscription: UserSubscription = {
      userId,
      planId,
      planName: plan.name,
      status: 'active',
      startDate,
      endDate
    };
    
    setUserSubscriptions(prev => [...prev, newSubscription]);

    toast({
      title: "Subscription Updated",
      description: `Successfully updated subscription to ${plan.name}.`,
    });
  };

  const handleDeleteSubscription = (userId: string) => {
    setUserSubscriptions(prev => prev.filter(sub => sub.userId !== userId));
    
    toast({
      title: "Subscription Deleted",
      description: "Successfully removed user subscription.",
      variant: "destructive",
    });
  };

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId);
    setShowEditModal(true);
  };

  // Get data for edit modal
  const editingUser = editingUserId ? users.find(user => user.id === editingUserId) || null : null;
  const editingSubscription = editingUserId ? userSubscriptions.find(sub => sub.userId === editingUserId) || null : null;

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
        currentSubscription={editingSubscription}
        subscriptionPlans={subscriptionPlans}
        onUpdateSubscription={handleUpdateSubscription}
        onDeleteSubscription={handleDeleteSubscription}
      />
    </div>
  );
};