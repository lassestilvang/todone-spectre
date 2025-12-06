import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollaboration } from "../../hooks/useCollaboration.js";
import { useCollaborationActivity } from "../../hooks/useCollaborationActivity.js";
import {
  CollaborationTeam,
  CollaborationMember,
  CollaborationActivity,
} from "../../types/collaboration.js";
import {
  Users,
  Activity,
  Settings,
  Plus,
  Search,
  Filter,
  Clock,
  MessageSquare,
  FileText,
  Check,
  Crown,
  ShieldCheck,
  BarChart2,
  PieChart,
  LineChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  adminCount: number;
  memberCount: number;
  guestCount: number;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  projectCount: number;
  taskCount: number;
  completionRate: number;
}

interface ActivityFilter {
  type: string;
  dateRange: string;
  searchTerm: string;
}

interface CollaborationDashboardProps {
  teamId: string;
  showSettings?: boolean;
  showMemberManagement?: boolean;
  onSettingsClick?: () => void;
  onAddMemberClick?: () => void;
}

export const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({
  teamId,
  showSettings = true,
  showMemberManagement = true,
  onSettingsClick,
  onAddMemberClick,
}) => {
  const { teams, members, settings, getTeamStats } = useCollaboration();
  const {
    activities,
    getActivityStats,
    filterActivitiesByType,
    filterActivitiesByDateRange,
    searchActivities,
  } = useCollaborationActivity(teamId);

  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics>({
    totalMembers: 0,
    activeMembers: 0,
    adminCount: 0,
    memberCount: 0,
    guestCount: 0,
    totalActivities: 0,
    activitiesByType: {},
    projectCount: 0,
    taskCount: 0,
    completionRate: 0,
  });

  const [activityFilter, setActivityFilter] = useState<ActivityFilter>({
    type: "all",
    dateRange: "last7days",
    searchTerm: "",
  });

  const [filteredActivities, setFilteredActivities] = useState<
    CollaborationActivity[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current team
  const currentTeam = teams.find((team) => team.id === teamId);
  const teamMembers = members.filter((member) => member.teamId === teamId);
  const teamSettings = settings.find((setting) => setting.teamId === teamId);

  // Calculate team metrics
  useEffect(() => {
    if (!currentTeam) return;

    const calculateMetrics = () => {
      try {
        // Member statistics
        const activeMembers = teamMembers.filter(
          (m) => m.status === "active"
        ).length;
        const adminCount = teamMembers.filter((m) => m.role === "admin").length;
        const memberCount = teamMembers.filter(
          (m) => m.role === "member"
        ).length;
        const guestCount = teamMembers.filter((m) => m.role === "guest").length;

        // Activity statistics
        const activityStats = getActivityStats();
        const activitiesByType = activityStats.byType;

        // Calculate completion rate (mock data for now)
        const completionRate = Math.min(
          100,
          Math.max(0, (activityStats.total / (activityStats.total + 1)) * 100)
        );

        setTeamMetrics({
          totalMembers: teamMembers.length,
          activeMembers: activeMembers,
          adminCount: adminCount,
          memberCount: memberCount,
          guestCount: guestCount,
          totalActivities: activityStats.total,
          activitiesByType: activitiesByType,
          projectCount: currentTeam.projectIds?.length || 0,
          taskCount: 0, // Would be calculated from actual task data
          completionRate: parseFloat(completionRate.toFixed(1)),
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to calculate team metrics");
        setLoading(false);
      }
    };

    calculateMetrics();
  }, [currentTeam, teamMembers, activities, getActivityStats]);

  // Filter activities based on filter criteria
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    try {
      let filtered = [...activities];

      // Filter by type
      if (activityFilter.type !== "all") {
        filtered = filterActivitiesByType(activityFilter.type as any);
      }

      // Filter by date range
      if (activityFilter.dateRange !== "all") {
        const now = new Date();
        let startDate = new Date(now);

        switch (activityFilter.dateRange) {
          case "last24hours":
            startDate.setHours(now.getHours() - 24);
            break;
          case "last7days":
            startDate.setDate(now.getDate() - 7);
            break;
          case "last30days":
            startDate.setDate(now.getDate() - 30);
            break;
          case "last90days":
            startDate.setDate(now.getDate() - 90);
            break;
        }

        filtered = filterActivitiesByDateRange(startDate, now);
      }

      // Search filter
      if (activityFilter.searchTerm) {
        filtered = searchActivities(activityFilter.searchTerm);
      }

      setFilteredActivities(filtered);
    } catch (err) {
      setError("Failed to filter activities");
    }
  }, [
    activities,
    activityFilter,
    filterActivitiesByType,
    filterActivitiesByDateRange,
    searchActivities,
  ]);

  const handleFilterChange = (field: keyof ActivityFilter, value: string) => {
    setActivityFilter((prev) => ({ ...prev, [field]: value }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "file":
        return <FileText className="h-4 w-4" />;
      case "task":
        return <Check className="h-4 w-4" />;
      case "member_added":
        return <Users className="h-4 w-4" />;
      case "member_removed":
        return <Users className="h-4 w-4" />;
      case "settings_updated":
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-800";
      case "file":
        return "bg-purple-100 text-purple-800";
      case "task":
        return "bg-green-100 text-green-800";
      case "member_added":
        return "bg-indigo-100 text-indigo-800";
      case "member_removed":
        return "bg-red-100 text-red-800";
      case "settings_updated":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "member":
        return <Users className="h-3 w-3 text-blue-500" />;
      case "guest":
        return <ShieldCheck className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading collaboration dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{currentTeam.name} Dashboard</span>
              </CardTitle>
              <CardDescription>
                {currentTeam.description || "Team collaboration workspace"}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {showSettings && (
                <Button variant="outline" size="sm" onClick={onSettingsClick}>
                  <Settings className="h-4 w-4 mr-2" />
                  Team Settings
                </Button>
              )}
              {showMemberManagement && (
                <Button variant="outline" size="sm" onClick={onAddMemberClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Team Members Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMetrics.totalMembers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active: {teamMetrics.activeMembers}
                </p>
                <div className="flex space-x-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {getRoleIcon("admin")} {teamMetrics.adminCount} Admins
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getRoleIcon("member")} {teamMetrics.memberCount} Members
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getRoleIcon("guest")} {teamMetrics.guestCount} Guests
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMetrics.projectCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projects in progress
                </p>
                <Progress
                  value={teamMetrics.completionRate}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Completion: {teamMetrics.completionRate}%
                </p>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {teamMetrics.totalActivities}
                </div>
                <p className="text-xs text-muted-foreground">Recent updates</p>
                <div className="flex space-x-1 mt-2">
                  {Object.entries(teamMetrics.activitiesByType).map(
                    ([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {getActivityIcon(type)} {count}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Settings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Settings
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Privacy:</span>
                    <Badge variant="outline" className="text-xs">
                      {currentTeam.privacySetting}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Created:</span>
                    <span className="text-xs text-muted-foreground">
                      {currentTeam.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={onSettingsClick}
                  >
                    Manage Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Activity Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Statistics</CardTitle>
                <CardDescription>
                  Team collaboration activity breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total Activities
                    </span>
                    <span className="text-lg font-bold">
                      {teamMetrics.totalActivities}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Activity Types</h4>
                    <div className="space-y-1">
                      {Object.entries(teamMetrics.activitiesByType).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              {getActivityIcon(type)}
                              <span className="text-sm capitalize">
                                {type.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {count}
                              </span>
                              <Progress
                                value={
                                  (count / teamMetrics.totalActivities) * 100
                                }
                                className="w-20 h-2"
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Member Statistics</CardTitle>
                <CardDescription>Team member breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Members</span>
                    <span className="text-lg font-bold">
                      {teamMetrics.totalMembers}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Member Roles</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon("admin")}
                          <span className="text-sm">Admins</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {teamMetrics.adminCount}
                          </span>
                          <Progress
                            value={
                              (teamMetrics.adminCount /
                                teamMetrics.totalMembers) *
                              100
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon("member")}
                          <span className="text-sm">Members</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {teamMetrics.memberCount}
                          </span>
                          <Progress
                            value={
                              (teamMetrics.memberCount /
                                teamMetrics.totalMembers) *
                              100
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon("guest")}
                          <span className="text-sm">Guests</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {teamMetrics.guestCount}
                          </span>
                          <Progress
                            value={
                              (teamMetrics.guestCount /
                                teamMetrics.totalMembers) *
                              100
                            }
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Active Members</span>
                    <Badge variant="secondary" className="text-sm">
                      {teamMetrics.activeMembers} / {teamMetrics.totalMembers}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Collaboration Activity Feed</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Select
                      value={activityFilter.type}
                      onValueChange={(value) =>
                        handleFilterChange("type", value)
                      }
                    >
                      <SelectTrigger className="w-[120px] text-sm">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="message">Messages</SelectItem>
                        <SelectItem value="file">Files</SelectItem>
                        <SelectItem value="task">Tasks</SelectItem>
                        <SelectItem value="member_added">
                          Member Added
                        </SelectItem>
                        <SelectItem value="member_removed">
                          Member Removed
                        </SelectItem>
                        <SelectItem value="settings_updated">
                          Settings Updated
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={activityFilter.dateRange}
                      onValueChange={(value) =>
                        handleFilterChange("dateRange", value)
                      }
                    >
                      <SelectTrigger className="w-[140px] text-sm">
                        <SelectValue placeholder="Date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last24hours">
                          Last 24 Hours
                        </SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="last90days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      className="pl-8 w-48 text-sm"
                      value={activityFilter.searchTerm}
                      onChange={(e) =>
                        handleFilterChange("searchTerm", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No activities found matching your criteria
                  </p>
                ) : (
                  filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                    >
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          {activity.user?.avatar && (
                            <AvatarImage src={activity.user.avatar} />
                          )}
                          <AvatarFallback>
                            {activity.user?.name?.substring(0, 2) || "TM"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={getActivityColor(activity.type)}
                          >
                            {getActivityIcon(activity.type)}
                            <span className="ml-1 text-xs capitalize">
                              {activity.type.replace("_", " ")}
                            </span>
                          </Badge>
                          <span className="text-sm font-medium">
                            {activity.user?.name || "Team Member"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {activity.action}
                          </span>
                        </div>
                        {activity.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.details}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Team Members</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-sm">
                    {teamMetrics.totalMembers} members
                  </Badge>
                  {showMemberManagement && (
                    <Button size="sm" onClick={onAddMemberClick}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No team members found
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-4"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            {member.user?.avatar && (
                              <AvatarImage src={member.user.avatar} />
                            )}
                            <AvatarFallback>
                              {member.user?.name?.substring(0, 2) ||
                                member.userId.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium truncate">
                                {member.user?.name || "Team Member"}
                              </h4>
                              <Badge
                                variant={
                                  member.role === "admin"
                                    ? "default"
                                    : member.role === "member"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {getRoleIcon(member.role)}
                                <span className="ml-1">{member.role}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {member.user?.email || "No email"}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                variant={
                                  member.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {member.status}
                              </Badge>
                              {member.lastActive && (
                                <p className="text-xs text-muted-foreground">
                                  Last active:{" "}
                                  {member.lastActive.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <Activity className="h-3 w-3 mr-1" />
                            {
                              activities.filter(
                                (a) => a.userId === member.userId
                              ).length
                            }{" "}
                            activities
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMetrics.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <Progress value={teamMetrics.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activity Trend
            </CardTitle>
            <LineChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMetrics.totalActivities}
            </div>
            <p className="text-xs text-muted-foreground">Total Activities</p>
            <div className="flex items-center space-x-1 mt-2">
              {teamMetrics.totalActivities > 10 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs">
                {teamMetrics.totalActivities > 10
                  ? "Active team"
                  : "Getting started"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Engagement
            </CardTitle>
            <PieChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMetrics.activeMembers}
            </div>
            <p className="text-xs text-muted-foreground">Active Members</p>
            <Progress
              value={
                (teamMetrics.activeMembers / teamMetrics.totalMembers) * 100
              }
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Productivity
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.projectCount}</div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
            <div className="flex items-center space-x-1 mt-2">
              <Calendar className="h-3 w-3 text-orange-500" />
              <span className="text-xs">Ongoing work</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
