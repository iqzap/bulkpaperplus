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
  currentSubscription: UserSubscription | null;
  subscriptionPlans: SubscriptionPlan[];
  onUpdateSubscription: (userId: string, planId: string) => void;
  onDeleteSubscription: (userId: string) => void;
}

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
  currentSubscription,
  subscriptionPlans,
  onUpdateSubscription,
  onDeleteSubscription
}: EditUserModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    if (currentSubscription) {
      setSelectedPlan(currentSubscription.planId);
    } else {
      setSelectedPlan('');
    }
  }, [currentSubscription]);

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
      case 'active': return 'bg-status-active text-white';
      case 'expired': return 'bg-status-expired text-white';
      case 'pending': return 'bg-status-pending text-white';
      default: return 'bg-status-none text-white';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">({user.email})</div>
          </div>

          {currentSubscription ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Current Subscription:</label>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div><strong>Plan:</strong> {currentSubscription.planName}</div>
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <Badge className={getStatusColor(currentSubscription.status)}>
                      {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                    </Badge>
                  </div>
                  <div><strong>Ends:</strong> {format(new Date(currentSubscription.endDate), 'yyyy-MM-dd')}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Change Subscription to:</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue />
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
                  variant="danger" 
                  onClick={handleDelete}
                  className="flex-1"
                >
                  Delete Subscription
                </Button>
                <Button 
                  variant="dashboard"
                  onClick={handleSave}
                  disabled={!selectedPlan || selectedPlan === currentSubscription.planId}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={onClose}>
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
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};