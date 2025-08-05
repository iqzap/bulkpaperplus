import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBulkSubscription: () => void;
  onAddIndividual: () => void;
}

export const DashboardHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onBulkSubscription, 
  onAddIndividual 
}: DashboardHeaderProps) => {
  return (
    <div className="bg-dashboard-header border-b border-border p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paperplus Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage user subscriptions and access</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search Dashboard..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="dashboard" 
            onClick={onBulkSubscription}
            className="whitespace-nowrap"
          >
            + Bulk Subscription
          </Button>
          <Button 
            variant="outline" 
            onClick={onAddIndividual}
            className="whitespace-nowrap"
          >
            + Add Individual Subs
          </Button>
        </div>
      </div>
    </div>
  );
};