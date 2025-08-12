import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserSubscription } from '@/types/dashboard';
import { format, addDays, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserTableProps {
  users: User[];
  subscriptions: UserSubscription[];
  onEditUser: (userId: string) => void;
}

export const UserTable = ({ users, subscriptions, onEditUser }: UserTableProps) => {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  // Reset to first page when users change or items per page changes
  useMemo(() => {
    setCurrentPage(1);
  }, [users.length, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const getSubscriptionsForUser = (userId: string) => {
    return subscriptions.filter(sub => sub.userId === userId);
  };

  const getActiveSubscriptionsForUser = (userId: string) => {
    return subscriptions.filter(sub => sub.userId === userId && sub.status === 'active');
  };

  const getExpiredSubscriptionsForUser = (userId: string) => {
    return subscriptions.filter(sub => sub.userId === userId && sub.status === 'expired');
  };

  const calculateStackedEndDate = (userSubscriptions: UserSubscription[]) => {
    if (userSubscriptions.length === 0) return null;
    
    // Sort by start date
    const sortedSubs = [...userSubscriptions].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    // Find the latest end date (stacked)
    const latestEndDate = sortedSubs.reduce((latest, sub) => {
      const endDate = sub.endDate ? new Date(sub.endDate) : null;
      if (!endDate) return latest; // Handle lifetime subscriptions
      return !latest || endDate > latest ? endDate : latest;
    }, null as Date | null);
    
    return latestEndDate;
  };

  const getPrimarySubscription = (userSubscriptions: UserSubscription[]) => {
    if (userSubscriptions.length === 0) return null;
    
    // Sort by start date and return the first one
    return [...userSubscriptions].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];
  };

  const formatSubscriptionDisplay = (userSubscriptions: UserSubscription[]) => {
    if (userSubscriptions.length === 0) return null;
    
    const primary = getPrimarySubscription(userSubscriptions);
    if (!primary) return null;
    
    const additionalCount = userSubscriptions.length - 1;
    return {
      displayName: additionalCount > 0 ? `${primary.planName} (+${additionalCount})` : primary.planName,
      subscriptions: userSubscriptions
    };
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-[#97CC56] text-white';
      case 'expired': return 'bg-[#E35273] text-white';
      case 'pending': return 'bg-[#718C9E] text-white';
      default: return 'bg-[#718C9E] text-white';
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
              <th className="text-left p-4 font-medium text-muted-foreground">Company / Email</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Phone Number</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Subscription</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => {
              const activeSubscriptions = getActiveSubscriptionsForUser(user.id);
              const expiredSubscriptions = getExpiredSubscriptionsForUser(user.id);
              const allSubscriptions = getSubscriptionsForUser(user.id);
              
              const subscriptionDisplay = formatSubscriptionDisplay(activeSubscriptions);
              const stackedEndDate = calculateStackedEndDate(activeSubscriptions);
              
              return (
                <tr 
                  key={user.id} 
                  className="border-b border-border hover:bg-dashboard-table-hover transition-colors"
                >
                  <td className="p-4 font-mono text-sm">{user.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{user.companyName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{user.phone}</td>
                  <td className="p-4 relative">
                    {subscriptionDisplay ? (
                      <div className="space-y-1">
                        <div 
                          className="font-medium cursor-help"
                          onMouseEnter={() => setHoveredUser(user.id)}
                          onMouseLeave={() => setHoveredUser(null)}
                        >
                          {subscriptionDisplay.displayName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor('active')}>
                            Active
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Ends: {stackedEndDate ? format(stackedEndDate, 'yyyy-MM-dd') : 'Lifetime'}
                          </span>
                        </div>
                        
                        {/* Hover tooltip */}
                        {hoveredUser === user.id && activeSubscriptions.length > 1 && (
                          <div className="absolute z-10 bg-popover border border-border rounded-md shadow-lg p-3 mt-2 min-w-64">
                            <div className="text-sm font-medium mb-2">Active Subscriptions:</div>
                            <div className="space-y-1">
                              {activeSubscriptions.map((sub, index) => (
                                <div key={sub.id} className="text-xs">
                                  <span className="font-medium">{sub.planName}</span>
                                  <br />
                                  <span className="text-muted-foreground">
                                    {format(new Date(sub.startDate), 'MMM dd, yyyy')} - {sub.endDate ? format(new Date(sub.endDate), 'MMM dd, yyyy') : 'Lifetime'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : expiredSubscriptions.length > 0 ? (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {expiredSubscriptions[0].planName}
                          {expiredSubscriptions.length > 1 && ` (+${expiredSubscriptions.length - 1})`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor('expired')}>
                            Expired
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Expired: {format(new Date(expiredSubscriptions[0].endDate), 'yyyy-MM-dd')}
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
                      className="bg-white border-gray-200"
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
      
      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-sm text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};