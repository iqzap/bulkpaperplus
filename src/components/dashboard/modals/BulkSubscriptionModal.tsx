import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { User, SubscriptionPlan } from '@/types/dashboard';

interface BulkSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  onConfirm: (planId: string, selectedUsers: string[]) => void;
}

export const BulkSubscriptionModal = ({
  isOpen,
  onClose,
  users,
  subscriptionPlans,
  onConfirm
}: BulkSubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirm = () => {
    if (selectedPlan && selectedUsers.length > 0) {
      onConfirm(selectedPlan, selectedUsers);
      onClose();
      setSelectedPlan('');
      setSelectedUsers([]);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedPlan('');
    setSelectedUsers([]);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Manual Subscription</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Package:</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subscription plan..." />
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

          <div className="flex-1 overflow-hidden flex flex-col">
            <label className="text-sm font-medium mb-2 block">Search Users:</label>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 border rounded-md overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">({user.email})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="dashboard"
              onClick={handleConfirm}
              disabled={!selectedPlan || selectedUsers.length === 0}
            >
              Confirm Addition ({selectedUsers.length} users)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};