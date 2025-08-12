import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchTerms = searchTerm.split(';').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
    
    return searchTerms.some(term =>
      user.companyName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirm = async () => {
    if (selectedPlan && selectedUsers.length > 0) {
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
        onConfirm(selectedPlan, selectedUsers);
        setIsLoading(false);
        setProgress(0);
        onClose();
        setSelectedPlan('');
        setSelectedUsers([]);
        setSearchTerm('');
      }, 1200);
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
      <DialogContent className="max-w-2xl h-[600px] overflow-hidden flex flex-col p-6">
        <DialogHeader className="pb-4">
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
                placeholder="Search by name or email (separate multiple terms with ';')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 border rounded-md overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer"
                    onClick={() => handleUserToggle(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.companyName}</div>
                      <div className="text-sm text-muted-foreground">({user.email})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="px-6 py-4 border-t">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing subscription...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} className="bg-white border-gray-200" disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="dashboard"
              onClick={handleConfirm}
              disabled={!selectedPlan || selectedUsers.length === 0 || isLoading}
            >
              {isLoading ? 'Processing...' : `Confirm Addition (${selectedUsers.length} users)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};