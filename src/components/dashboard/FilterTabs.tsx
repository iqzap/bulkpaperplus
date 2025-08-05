import { Button } from '@/components/ui/button';
import { UserFilter } from '@/types/dashboard';

interface FilterTabsProps {
  activeFilter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
  counts: {
    active: number;
    expired: number;
    none: number;
    all: number;
  };
}

export const FilterTabs = ({ activeFilter, onFilterChange, counts }: FilterTabsProps) => {
  const tabs = [
    { key: 'active' as UserFilter, label: 'Active', count: counts.active },
    { key: 'expired' as UserFilter, label: 'Expired', count: counts.expired },
    { key: 'none' as UserFilter, label: 'No Subscription', count: counts.none },
    { key: 'all' as UserFilter, label: 'All Users', count: counts.all },
  ];

  return (
    <div className="bg-dashboard-header border-b border-border">
      <div className="px-6">
        <div className="flex items-center">
          <span className="text-sm font-medium text-muted-foreground mr-4">View Users:</span>
          <div className="flex">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                variant="tab"
                size="tab"
                data-state={activeFilter === tab.key ? 'active' : 'inactive'}
                onClick={() => onFilterChange(tab.key)}
                className="relative"
              >
                {tab.label}
                <span className="ml-2 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};