import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollaborationActivity } from '../../hooks/useCollaborationActivity';
import { CollaborationActivity } from '../../types/collaboration';
import { Clock, MessageSquare, FileText, Check, Users, Settings, Search, Filter, Calendar, X, RefreshCw, Download } from 'lucide-react';

interface ActivityFilter {
  types: string[];
  dateRange: 'all' | 'last24hours' | 'last7days' | 'last30days' | 'last90days' | 'custom';
  customDateRange?: { from: Date; to: Date };
  searchTerm: string;
  users: string[];
  showOnlyMyActivities: boolean;
}

interface CollaborationActivityProps {
  teamId: string;
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  maxActivities?: number;
  onActivityClick?: (activity: CollaborationActivity) => void;
}

export const CollaborationActivity: React.FC<CollaborationActivityProps> = ({
  teamId,
  title = 'Collaboration Activity Feed',
  showFilters = true,
  showExport = true,
  maxActivities = 20,
  onActivityClick
}) => {
  const {
    activities,
    loading,
    error,
    filterActivitiesByType,
    filterActivitiesByDateRange,
    searchActivities,
    getActivityStats,
    refreshActivityData
  } = useCollaborationActivity(teamId);

  const [filteredActivities, setFilteredActivities] = useState<CollaborationActivity[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>({
    types: ['all'],
    dateRange: 'last7days',
    searchTerm: '',
    users: [],
    showOnlyMyActivities: false
  });

  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  // Get activity statistics and available users
  useEffect(() => {
    if (activities.length > 0) {
      const stats = getActivityStats();
      const uniqueUsers = Array.from(new Set(activities.map(a => a.userId)));
      setAvailableUsers(uniqueUsers);
    }
  }, [activities, getActivityStats]);

  // Apply filters to activities
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    try {
      let filtered = [...activities];

      // Filter by type
      if (!activityFilter.types.includes('all') && activityFilter.types.length > 0) {
        const typeFiltered = activityFilter.types.flatMap(type =>
          filterActivitiesByType(type as any)
        );
        filtered = typeFiltered;
      }

      // Filter by date range
      if (activityFilter.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date(now);

        if (activityFilter.dateRange === 'custom' && activityFilter.customDateRange) {
          startDate = activityFilter.customDateRange.from;
          const endDate = activityFilter.customDateRange.to;
          filtered = filterActivitiesByDateRange(startDate, endDate);
        } else {
          switch (activityFilter.dateRange) {
            case 'last24hours':
              startDate.setHours(now.getHours() - 24);
              break;
            case 'last7days':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'last30days':
              startDate.setDate(now.getDate() - 30);
              break;
            case 'last90days':
              startDate.setDate(now.getDate() - 90);
              break;
          }
          filtered = filterActivitiesByDateRange(startDate, now);
        }
      }

      // Filter by users
      if (activityFilter.users.length > 0) {
        filtered = filtered.filter(activity =>
          activityFilter.users.includes(activity.userId)
        );
      }

      // Search filter
      if (activityFilter.searchTerm) {
        filtered = searchActivities(activityFilter.searchTerm);
      }

      // Limit results
      filtered = filtered.slice(0, maxActivities);

      setFilteredActivities(filtered);
    } catch (err) {
      console.error('Failed to filter activities:', err);
    }
  }, [
    activities,
    activityFilter,
    filterActivitiesByType,
    filterActivitiesByDateRange,
    searchActivities,
    maxActivities
  ]);

  const handleFilterChange = (field: keyof ActivityFilter, value: any) => {
    setActivityFilter(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeFilterChange = (type: string) => {
    setActivityFilter(prev => {
      if (type === 'all') {
        return { ...prev, types: ['all'] };
      }

      if (prev.types.includes('all')) {
        return { ...prev, types: [type] };
      }

      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      }

      return { ...prev, types: [...prev.types, type] };
    });
  };

  const handleUserFilterChange = (userId: string) => {
    setActivityFilter(prev => {
      if (prev.users.includes(userId)) {
        return { ...prev, users: prev.users.filter(u => u !== userId) };
      }
      return { ...prev, users: [...prev.users, userId] };
    });
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setActivityFilter(prev => ({
      ...prev,
      dateRange: 'custom',
      customDateRange: range
    }));
  };

  const resetFilters = () => {
    setActivityFilter({
      types: ['all'],
      dateRange: 'last7days',
      searchTerm: '',
      users: [],
      showOnlyMyActivities: false
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'task': return <Check className="h-4 w-4" />;
      case 'member_added': return <Users className="h-4 w-4" />;
      case 'member_removed': return <Users className="h-4 w-4" />;
      case 'settings_updated': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800';
      case 'file': return 'bg-purple-100 text-purple-800';
      case 'task': return 'bg-green-100 text-green-800';
      case 'member_added': return 'bg-indigo-100 text-indigo-800';
      case 'member_removed': return 'bg-red-100 text-red-800';
      case 'settings_updated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading activity feed...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            <p>Failed to load activity feed</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={refreshActivityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {filteredActivities.length} activities shown • {activities.length} total
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {showExport && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={refreshActivityData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {showFilters && (
              <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activityFilter.types.length > 1 ||
                     activityFilter.users.length > 0 ||
                     activityFilter.searchTerm ||
                     activityFilter.dateRange !== 'last7days' ? (
                      <Badge className="ml-2" variant="secondary">
                        {activityFilter.types.length > 1 ? activityFilter.types.length - 1 : 0 +
                         activityFilter.users.length +
                         (activityFilter.searchTerm ? 1 : 0) +
                         (activityFilter.dateRange !== 'last7days' ? 1 : 0)}
                      </Badge>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filters</h4>
                      <p className="text-sm text-muted-foreground">Customize your activity feed</p>
                    </div>

                    <div className="grid gap-2">
                      {/* Activity Type Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Activity Types</label>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-all"
                              checked={activityFilter.types.includes('all')}
                              onCheckedChange={() => handleTypeFilterChange('all')}
                            />
                            <label htmlFor="filter-all" className="text-sm">All Types</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-message"
                              checked={activityFilter.types.includes('message')}
                              onCheckedChange={() => handleTypeFilterChange('message')}
                            />
                            <label htmlFor="filter-message" className="text-sm flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                              Messages
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-file"
                              checked={activityFilter.types.includes('file')}
                              onCheckedChange={() => handleTypeFilterChange('file')}
                            />
                            <label htmlFor="filter-file" className="text-sm flex items-center">
                              <FileText className="h-3 w-3 mr-1 text-purple-500" />
                              Files
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-task"
                              checked={activityFilter.types.includes('task')}
                              onCheckedChange={() => handleTypeFilterChange('task')}
                            />
                            <label htmlFor="filter-task" className="text-sm flex items-center">
                              <Check className="h-3 w-3 mr-1 text-green-500" />
                              Tasks
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-member"
                              checked={activityFilter.types.includes('member_added') || activityFilter.types.includes('member_removed')}
                              onCheckedChange={() => {
                                if (activityFilter.types.includes('member_added') || activityFilter.types.includes('member_removed')) {
                                  handleTypeFilterChange('member_added');
                                  handleTypeFilterChange('member_removed');
                                } else {
                                  handleTypeFilterChange('member_added');
                                  handleTypeFilterChange('member_removed');
                                }
                              }}
                            />
                            <label htmlFor="filter-member" className="text-sm flex items-center">
                              <Users className="h-3 w-3 mr-1 text-indigo-500" />
                              Members
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-settings"
                              checked={activityFilter.types.includes('settings_updated')}
                              onCheckedChange={() => handleTypeFilterChange('settings_updated')}
                            />
                            <label htmlFor="filter-settings" className="text-sm flex items-center">
                              <Settings className="h-3 w-3 mr-1 text-yellow-500" />
                              Settings
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <Select
                          value={activityFilter.dateRange}
                          onValueChange={(value) => handleFilterChange('dateRange', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="last24hours">Last 24 Hours</SelectItem>
                            <SelectItem value="last7days">Last 7 Days</SelectItem>
                            <SelectItem value="last30days">Last 30 Days</SelectItem>
                            <SelectItem value="last90days">Last 90 Days</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>

                        {activityFilter.dateRange === 'custom' && (
                          <DatePickerWithRange
                            onDateRangeChange={handleDateRangeChange}
                            initialRange={activityFilter.customDateRange}
                          />
                        )}
                      </div>

                      {/* User Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Users</label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {availableUsers.map(userId => (
                            <div key={userId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`filter-user-${userId}`}
                                checked={activityFilter.users.includes(userId)}
                                onCheckedChange={() => handleUserFilterChange(userId)}
                              />
                              <label htmlFor={`filter-user-${userId}`} className="text-sm">
                                {userId}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Search Filter */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search activities..."
                            className="pl-8"
                            value={activityFilter.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-2 border-t">
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          <X className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button size="sm" onClick={() => setIsFilterPopoverOpen(false)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No activities found matching your criteria</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border cursor-pointer"
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      {activity.user?.avatar && <AvatarImage src={activity.user.avatar} />}
                      <AvatarFallback>{activity.user?.name?.substring(0, 2) || 'TM'}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getActivityColor(activity.type)}>
                        {getActivityIcon(activity.type)}
                        <span className="ml-1 text-xs">{getActivityTypeLabel(activity.type)}</span>
                      </Badge>
                      <span className="text-sm font-medium">{activity.user?.name || 'Team Member'}</span>
                      <span className="text-sm text-muted-foreground">{activity.action}</span>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {activity.timestamp.toLocaleString()}
                    </p>
                    {activity.entityId && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          Entity: {activity.entityId}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};