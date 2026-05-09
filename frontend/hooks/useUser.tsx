import { useAuth } from "@/hooks/AuthContext";
import { authService } from "@/services/auth";
import type { Gender, User } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface UpdateUserPayload {
  displayName: string;
  gender: Gender;
  photoUrl?: string | null;
}

export function useUser() {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const userQuery = useQuery<User>({
    queryKey: ["user"],
    queryFn: authService.getMe,
    initialData: authUser ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 10, // 10 phút
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      authService.updateProfile({
        display_name: payload.displayName,
        gender: payload.gender,
        photo_url: payload.photoUrl ?? null,
      }),
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(["user"], updatedUser);
    },
  });

  return {
    user: userQuery.data ?? authUser,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    isUpdating: updateUserMutation.isPending,
    error: userQuery.error ?? updateUserMutation.error,
    refetchUser: userQuery.refetch,
    updateUser: updateUserMutation.mutateAsync,
  };
}
