import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { User, SubscriptionPlan } from '@/types/dashboard';

interface IndividualSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  subscriptionPlans: SubscriptionPlan[];
  onConfirm: (subscriptions: Array<{ userId: string; planId: string }>) => void;
}

interface SelectedUser {
  user: User;
  planId: string;
}

export const IndividualSubscriptionModal = ({
  isOpen,
  onClose,
  users,
  subscriptionPlans,
  onConfirm
}: IndividualSubscriptionModalProps) => {
  const [searchBy, setSearchBy] = useState('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);

  const filteredUsers = users.filter(user => {
    const alreadySelected = selectedUsers.some(su => su.user.id === user.id);
    if (alreadySelected) return false;

    const searchValue = searchTerm.toLowerCase();
    switch (searchBy) {
      case 'email':
        return user.email.toLowerCase().includes(searchValue);
      case 'name':
        return user.name.toLowerCase().includes(searchValue);
      case 'id':
        return user.id.toLowerCase().includes(searchValue);
      case 'phone':
        return user.phone.includes(searchValue);
      default:
        return true;
    }
  });

  const addUser = (user: User) => {
    setSelectedUsers(prev => [...prev, { user, planId: '' }]);
    setSearchTerm('');
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(su => su.user.id !== userId));
  };

  const updateUserPlan = (userId: string, planId: string) => {
    setSelectedUsers(prev =>
      prev.map(su =>
        su.user.id === userId ? { ...su, planId } : su
      )
    );
  };

  const handleConfirm = () => {
    const validSubscriptions = selectedUsers.filter(su => su.planId);
    if (validSubscriptions.length > 0) {
      onConfirm(validSubscriptions.map(su => ({ userId: su.user.id, planId: su.planId })));
      onClose();
      setSelectedUsers([]);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUsers([]);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Individual Subscriptions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* Step 1: Find and Add Users */}
          <div>
            <h3 className="font-medium mb-4">1. Find and Add Users (Search by ID, Email, or Phone)</h3>
            
            <div className="flex gap-3 mb-3">
              <Select value={searchBy} onValueChange={setSearchBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="id">User ID</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searchTerm && (
              <div className="border rounded-md max-h-32 overflow-y-auto">
                <div className="text-sm font-medium p-2 bg-muted">Search Result:</div>
                {filteredUsers.length > 0 ? (
                  filteredUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50">
                      <span>{user.name} ({user.email})</span>
                      <Button size="sm" variant="outline" onClick={() => addUser(user)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add User
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-muted-foreground">No users found</div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Assign Subscription Packages */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="font-medium mb-4">2. Assign Subscription Packages to Added Users</h3>
            
            {selectedUsers.length > 0 ? (
              <div className="flex-1 border rounded-md overflow-hidden">
                <div className="bg-dashboard-table-header p-3 border-b">
                  <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                    <div className="col-span-3">User</div>
                    <div className="col-span-4">Email</div>
                    <div className="col-span-4">Subscription Package</div>
                    <div className="col-span-1">Action</div>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-64">
                  {selectedUsers.map((selectedUser) => (
                    <div key={selectedUser.user.id} className="p-3 border-b last:border-b-0">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 font-medium">{selectedUser.user.name}</div>
                        <div className="col-span-4 text-sm text-muted-foreground">{selectedUser.user.email}</div>
                        <div className="col-span-4">
                          <Select
                            value={selectedUser.planId}
                            onValueChange={(value) => updateUserPlan(selectedUser.user.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan..." />
                            </SelectTrigger>
                            <SelectContent>
                              {subscriptionPlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeUser(selectedUser.user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 border rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">No users added yet. Search and add users above.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="dashboard"
              onClick={handleConfirm}
              disabled={selectedUsers.length === 0 || selectedUsers.some(su => !su.planId)}
            >
              Subscribe ({selectedUsers.filter(su => su.planId).length} Users)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};