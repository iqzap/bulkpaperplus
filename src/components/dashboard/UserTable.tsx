import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, UserSubscription } from '@/types/dashboard';
import { format } from 'date-fns';

interface UserTableProps {
  users: User[];
  subscriptions: UserSubscription[];
  onEditUser: (userId: string) => void;
}

export const UserTable = ({ users, subscriptions, onEditUser }: UserTableProps) => {
  const getSubscriptionForUser = (userId: string) => {
    return subscriptions.find(sub => sub.userId === userId);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-status-active text-white';
      case 'expired': return 'bg-status-expired text-white';
      case 'pending': return 'bg-status-pending text-white';
      default: return 'bg-status-none text-white';
    }
  };

  return (
    <div className="bg-card">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Users ({users.length})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dashboard-table-header">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">User ID</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Name / Email</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Phone Number</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Subscription</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const subscription = getSubscriptionForUser(user.id);
              return (
                <tr 
                  key={user.id} 
                  className="border-b border-border hover:bg-dashboard-table-hover transition-colors"
                >
                  <td className="p-4 font-mono text-sm">{user.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{user.phone}</td>
                  <td className="p-4">
                    {subscription ? (
                      <div className="space-y-1">
                        <div className="font-medium">{subscription.planName}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Ends: {format(new Date(subscription.endDate), 'yyyy-MM-dd')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Badge className={getStatusColor()}>No Subscription</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEditUser(user.id)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};