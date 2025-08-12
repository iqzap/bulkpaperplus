import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, UserSubscription, SubscriptionPlan } from '@/types/dashboard';
import { format } from 'date-fns';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userSubscriptions: UserSubscription[];
  subscriptionPlans: SubscriptionPlan[];
  onUpdateSubscription: (userId: string, planId: string) => void;
  onDeleteSubscription: (userId: string) => void;
}

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
  userSubscriptions,
  subscriptionPlans,
  onUpdateSubscription,
  onDeleteSubscription
}: EditUserModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  
  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active');

  useEffect(() => {
    setSelectedPlan('');
  }, [userSubscriptions]);

  const handleSave = () => {
    if (user && selectedPlan) {
      onUpdateSubscription(user.id, selectedPlan);
      onClose();
    }
  };

  const handleDelete = () => {
    if (user) {
      onDeleteSubscription(user.id);
      onClose();
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-[#97CC56] text-white';
      case 'expired': return 'bg-[#E35273] text-white';
      case 'pending': return 'bg-[#718C9E] text-white';
      default: return 'bg-[#718C9E] text-white';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[90vw] max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit User Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 flex-1 overflow-y-auto px-1">
          <div>
            <div className="font-medium">{user.companyName}</div>
            <div className="text-sm text-muted-foreground">({user.email})</div>
          </div>

          {activeSubscriptions.length > 0 ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Active Subscriptions ({activeSubscriptions.length}):</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {activeSubscriptions.map((subscription, index) => (
                    <div key={subscription.id} className="bg-white rounded-lg p-3 space-y-1 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subscription.planName}</span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(subscription.startDate), 'MMM dd, yyyy')} - {subscription.endDate ? format(new Date(subscription.endDate), 'MMM dd, yyyy') : 'Lifetime'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Another Subscription (Stacked):</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Package..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.duration})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="dashboard"
                  onClick={handleSave}
                  disabled={!selectedPlan}
                  className="flex-1"
                >
                  Add Subscription
                </Button>
                <Button variant="outline" onClick={onClose} className="bg-white border-gray-200">
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <p className="text-muted-foreground">This user has no active subscription.</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Add Subscription:</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Package..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.duration})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="dashboard"
                  onClick={handleSave}
                  disabled={!selectedPlan}
                  className="flex-1"
                >
                  Add Subscription
                </Button>
                <Button variant="outline" onClick={onClose} className="bg-white border-gray-200">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
        
        {activeSubscriptions.length > 0 && (
          <div className="flex-shrink-0 pt-4 border-t">
            <div className="text-center">
              <button 
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium underline transition-colors"
              >
                Delete All Subscriptions
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

  );
};