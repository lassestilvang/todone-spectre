import { useState, useEffect, useCallback } from "react";
import { User } from "../types/user";
import { userApi } from "../api/userApi";
import { ApiResponse } from "../types/api";

/**
 * Custom hook for managing user state and operations
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all users
   */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<User[]> = await userApi.getUsers();

      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get user by ID
   */
  const getUserById = useCallback(
    async (userId: string): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        // First check if user is already in local state
        const existingUser = users.find((user) => user.id === userId);
        if (existingUser) {
          return existingUser;
        }

        // If not, fetch from API
        const response: ApiResponse<User> = await userApi.getUser(userId);

        if (response.success && response.data) {
          setUsers((prev) => [...prev, response.data]);
          return response.data;
        } else {
          throw new Error(response.message || "User not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [users]
  );

  /**
   * Update user
   */
  const updateUser = useCallback(
    async (userId: string, updates: Partial<User>): Promise<User> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<User> = await userApi.updateUser(
          userId,
          updates
        );

        if (response.success && response.data) {
          setUsers((prev) =>
            prev.map((user) => (user.id === userId ? response.data : user))
          );
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update user");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get users by team ID
   */
  const getUsersByTeam = useCallback(
    (teamId: string): User[] => {
      // In a real implementation, this would filter users who are members of the team
      // For now, we'll return all users as a placeholder
      return users;
    },
    [users]
  );

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateUser,
    getUsersByTeam,
  };
};
