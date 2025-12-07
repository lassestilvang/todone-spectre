// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import {
  CollaborationState,
  CollaborationTeam,
  CollaborationMember,
  CollaborationActivity,
  CollaborationSettings,
} from "../types/store";
import {
  CollaborationTeam as CollaborationTeamType,
  CollaborationMember as CollaborationMemberType,
  CollaborationActivity as CollaborationActivityType,
  CollaborationSettings as CollaborationSettingsType,
} from "../types/collaboration";

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});

export const useCollaborationStore = create<CollaborationState>()(
  devtools(
    persist(
      (set, get) => ({
        teams: [],
        members: [],
        activities: [],
        settings: [],
        filteredTeams: [],
        currentFilter: {},
        sortBy: "name",
        sortDirection: "asc",
        collaborationError: null,
        selectedTeamIds: [],
        selectedMemberIds: [],
        selectedActivityIds: [],

        // CRUD Operations for Teams
        addTeam: (teamData: Omit<CollaborationTeamType, "id">) => {
          const newTeam: CollaborationTeam = {
            ...teamData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            memberCount: teamData.members?.length || 0,
            activityCount: 0,
          };
          set((state) => ({
            teams: [...state.teams, newTeam],
          }));
          get().applyFilters();
        },

        updateTeam: (
          teamId: string,
          updates: Partial<CollaborationTeamType>
        ) => {
          set((state) => ({
            teams: state.teams.map((team) =>
              team.id === teamId
                ? {
                    ...team,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : team
            ),
          }));
          get().applyFilters();
        },

        deleteTeam: (teamId: string) => {
          set((state) => ({
            teams: state.teams.filter((team) => team.id !== teamId),
          }));
          get().applyFilters();
        },

        // CRUD Operations for Members
        addMember: (memberData: Omit<CollaborationMemberType, "id">) => {
          const newMember: CollaborationMember = {
            ...memberData,
            id: Math.random().toString(36).substr(2, 9),
            joinedAt: new Date(),
            status: memberData.status || "active",
            role: memberData.role || "member",
          };
          set((state) => ({
            members: [...state.members, newMember],
          }));

          // Update team member count
          const team = state.teams.find((t) => t.id === memberData.teamId);
          if (team) {
            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === memberData.teamId
                  ? { ...t, memberCount: (t.memberCount || 0) + 1 }
                  : t
              ),
            }));
          }
        },

        updateMember: (
          memberId: string,
          updates: Partial<CollaborationMemberType>
        ) => {
          set((state) => ({
            members: state.members.map((member) =>
              member.id === memberId
                ? {
                    ...member,
                    ...updates,
                  }
                : member
            ),
          }));
        },

        deleteMember: (memberId: string) => {
          const member = get().members.find((m) => m.id === memberId);
          if (member) {
            // Update team member count
            const team = get().teams.find((t) => t.id === member.teamId);
            if (team) {
              set((state) => ({
                teams: state.teams.map((t) =>
                  t.id === member.teamId
                    ? {
                        ...t,
                        memberCount: Math.max((t.memberCount || 0) - 1, 0),
                      }
                    : t
                ),
              }));
            }
          }

          set((state) => ({
            members: state.members.filter((member) => member.id !== memberId),
          }));
        },

        // CRUD Operations for Activities
        addActivity: (activityData: Omit<CollaborationActivityType, "id">) => {
          const newActivity: CollaborationActivity = {
            ...activityData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
          };
          set((state) => ({
            activities: [...state.activities, newActivity],
          }));

          // Update team activity count
          const team = state.teams.find((t) => t.id === activityData.teamId);
          if (team) {
            set((state) => ({
              teams: state.teams.map((t) =>
                t.id === activityData.teamId
                  ? { ...t, activityCount: (t.activityCount || 0) + 1 }
                  : t
              ),
            }));
          }
        },

        updateActivity: (
          activityId: string,
          updates: Partial<CollaborationActivityType>
        ) => {
          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === activityId
                ? {
                    ...activity,
                    ...updates,
                  }
                : activity
            ),
          }));
        },

        deleteActivity: (activityId: string) => {
          set((state) => ({
            activities: state.activities.filter(
              (activity) => activity.id !== activityId
            ),
          }));
        },

        // Settings operations
        updateSettings: (
          teamId: string,
          settings: Partial<CollaborationSettingsType>
        ) => {
          set((state) => ({
            settings: state.settings.map((s) =>
              s.teamId === teamId
                ? {
                    ...s,
                    ...settings,
                    updatedAt: new Date(),
                  }
                : s
            ),
          }));
        },

        // Filtering and Sorting
        setFilter: (filter: CollaborationState["currentFilter"]) => {
          set({ currentFilter: filter });
          get().applyFilters();
        },

        setSort: (
          sortBy: CollaborationState["sortBy"],
          sortDirection: CollaborationState["sortDirection"]
        ) => {
          set({ sortBy, sortDirection });
          get().applyFilters();
        },

        applyFilters: () => {
          const { teams, currentFilter, sortBy, sortDirection } = get();
          let filtered = [...teams];

          // Apply team ID filter
          if (currentFilter.teamId) {
            filtered = filtered.filter(
              (team) => team.id === currentFilter.teamId
            );
          }

          // Apply search query filter
          if (currentFilter.searchQuery) {
            const query = currentFilter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (team) =>
                team.name.toLowerCase().includes(query) ||
                team.description?.toLowerCase().includes(query)
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            const aValue: any = a[sortBy];
            const bValue: any = b[sortBy];

            // Handle date sorting
            if (aValue instanceof Date && bValue instanceof Date) {
              return sortDirection === "asc"
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
            }

            // Handle string sorting
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }

            // Handle number sorting
            if (typeof aValue === "number" && typeof bValue === "number") {
              return sortDirection === "asc"
                ? aValue - bValue
                : bValue - aValue;
            }

            return 0;
          });

          set({ filteredTeams: filtered });
        },

        // Selection operations
        setSelectedTeamIds: (teamIds: string[]) => {
          set({ selectedTeamIds: teamIds });
        },

        setSelectedMemberIds: (memberIds: string[]) => {
          set({ selectedMemberIds: memberIds });
        },

        setSelectedActivityIds: (activityIds: string[]) => {
          set({ selectedActivityIds: activityIds });
        },

        // Statistics and utilities
        getTeamStatistics: (teamId: string) => {
          const team = get().teams.find((t) => t.id === teamId);
          if (!team) return { memberCount: 0, activityCount: 0, adminCount: 0 };

          return {
            memberCount: team.memberCount || 0,
            activityCount: team.activityCount || 0,
            adminCount:
              team.members?.filter((m) => m.role === "admin").length || 0,
          };
        },

        getActivityStatistics: () => {
          const activities = get().activities;
          const byType: Record<string, number> = {};
          const byUser: Record<string, number> = {};

          activities.forEach((activity) => {
            byType[activity.type] = (byType[activity.type] || 0) + 1;
            byUser[activity.userId] = (byUser[activity.userId] || 0) + 1;
          });

          return {
            total: activities.length,
            byType,
            byUser,
          };
        },

        // Initialization with sample data
        initializeWithSampleData: () => {
          const sampleTeams: CollaborationTeam[] = [
            {
              id: "team-1",
              name: "Development Team",
              description: "Core development team for Todone application",
              privacySetting: "team-only",
              ownerId: "user-1",
              createdAt: new Date(),
              updatedAt: new Date(),
              memberCount: 3,
              activityCount: 5,
              members: [
                {
                  id: "member-1",
                  teamId: "team-1",
                  userId: "user-1",
                  role: "admin",
                  status: "active",
                  joinedAt: new Date(),
                  lastActive: new Date(),
                },
                {
                  id: "member-2",
                  teamId: "team-1",
                  userId: "user-2",
                  role: "member",
                  status: "active",
                  joinedAt: new Date(),
                  lastActive: new Date(),
                },
              ],
            },
            {
              id: "team-2",
              name: "Design Team",
              description: "UI/UX design team",
              privacySetting: "private",
              ownerId: "user-3",
              createdAt: new Date(),
              updatedAt: new Date(),
              memberCount: 2,
              activityCount: 3,
            },
          ];

          const sampleActivities: CollaborationActivity[] = [
            {
              id: "activity-1",
              teamId: "team-1",
              userId: "user-1",
              action: "created a new project",
              type: "task",
              timestamp: new Date(),
              details: "Created Todone v2.0 project",
              entityId: "project-1",
              entityType: "project",
            },
            {
              id: "activity-2",
              teamId: "team-1",
              userId: "user-2",
              action: "completed task review",
              type: "task",
              timestamp: new Date(Date.now() - 86400000), // Yesterday
              details: "Reviewed authentication module",
              entityId: "task-1",
              entityType: "task",
            },
          ];

          const sampleSettings: CollaborationSettings[] = [
            {
              teamId: "team-1",
              notificationSettings: {
                emailNotifications: true,
                pushNotifications: true,
                mentionNotifications: true,
                dailyDigest: false,
              },
              permissionSettings: {
                allowGuestInvites: false,
                allowPublicSharing: false,
                requireAdminApproval: true,
                allowMemberInvites: false,
              },
              privacySettings: {
                visibleToPublic: false,
                searchable: false,
                allowExternalAccess: false,
              },
              integrationSettings: {
                calendarIntegration: true,
                taskIntegration: true,
                fileIntegration: false,
              },
              updatedAt: new Date(),
            },
          ];

          set({
            teams: sampleTeams,
            members: sampleTeams.flatMap((team) => team.members || []),
            activities: sampleActivities,
            settings: sampleSettings,
          });

          get().applyFilters();
        },

        // Error handling
        setCollaborationError: (error: string | null) => {
          set({ collaborationError: error });
        },
      }),
      {
        name: "todone-collaboration-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
