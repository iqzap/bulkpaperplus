import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const filteredUsers = users.filter(user => {
    const alreadySelected = selectedUsers.some(su => su.user.id === user.id);
    if (alreadySelected) return false;

    // Support multi-term search with semicolon separation
    const searchTerms = searchTerm.split(';').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
    
    if (searchTerms.length === 0) return false;
    
    return searchTerms.some(searchValue => {
      switch (searchBy) {
        case 'email':
          return user.email.toLowerCase().includes(searchValue);
        case 'name':
          return user.companyName.toLowerCase().includes(searchValue);
        case 'id':
          return user.id.toLowerCase().includes(searchValue);
        case 'phone':
          return user.phone.includes(searchValue);
        default:
          return true;
      }
    });
  });

  const addUser = (user: User) => {
    setSelectedUsers(prev => [...prev, { user, planId: '' }]);
    // Don't clear search term when adding user
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

  const handleConfirm = async () => {
    const validSubscriptions = selectedUsers.filter(su => su.planId);
    if (validSubscriptions.length > 0) {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      
      // Wait for progress to complete
      setTimeout(() => {
        onConfirm(validSubscriptions.map(su => ({ userId: su.user.id, planId: su.planId })));
        setIsLoading(false);
        setProgress(0);
        onClose();
        setSelectedUsers([]);
        setSearchTerm('');
      }, 1200);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUsers([]);
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-[90vw] h-[80vh] max-h-[800px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl">Add Individual Subscriptions</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 overflow-hidden p-6 bg-white">
          {/* Left Card: Search and Available Users */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-w-0">
            <h3 className="font-medium mb-4 text-lg">Find Users</h3>
            
            {/* Search Controls */}
            <div className="flex gap-3 mb-4">
              <Select value={searchBy} onValueChange={setSearchBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="name">Company</SelectItem>
                  <SelectItem value="id">User ID</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users... (use ; to separate multiple terms)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 border rounded-md overflow-hidden bg-white">
              <div className="bg-gray-100 p-3 border-b">
                <div className="text-sm font-medium text-gray-700">Available Users</div>
              </div>
              
              <div className="overflow-y-auto h-full">
                {searchTerm ? (
                  filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="font-medium">{user.companyName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.id} • {user.phone}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => addUser(user)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      No users found matching your search
                    </div>
                  )
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    Start typing to search for users
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Card: Selected Users */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Ready for Assignment</h3>
              <span className="text-sm text-muted-foreground">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            
            {selectedUsers.length > 0 ? (
              <div className="flex-1 border rounded-md overflow-hidden bg-white">
                <div className="bg-gray-100 p-3 border-b">
                  <div className="grid grid-cols-12 gap-3 font-medium text-sm text-gray-700">
                    <div className="col-span-4">User</div>
                    <div className="col-span-6">Subscription Package</div>
                    <div className="col-span-2">Action</div>
                  </div>
                </div>
                
                <div className="overflow-y-auto h-full">
                  {selectedUsers.map((selectedUser) => (
                    <div key={selectedUser.user.id} className="p-3 border-b last:border-b-0">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <div className="font-medium text-sm">{selectedUser.user.companyName}</div>
                          <div className="text-xs text-muted-foreground">{selectedUser.user.email}</div>
                        </div>
                        <div className="col-span-6">
                          <Select
                            value={selectedUser.planId}
                            onValueChange={(value) => updateUserPlan(selectedUser.user.id, value)}
                          >
                            <SelectTrigger className="h-8">
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
                        <div className="col-span-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeUser(selectedUser.user.id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
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
                <div className="text-center">
                  <div className="text-muted-foreground mb-2">No users selected</div>
                  <div className="text-sm text-muted-foreground">Search and add users from the left panel</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="px-6 py-4 border-t bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing subscriptions...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
          <Button variant="outline" onClick={onClose} className="bg-white border-gray-200" disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="dashboard"
            onClick={handleConfirm}
            disabled={selectedUsers.length === 0 || selectedUsers.some(su => !su.planId) || isLoading}
          >
            {isLoading ? 'Processing...' : `Subscribe (${selectedUsers.filter(su => su.planId).length} Users)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};