import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDrafts, getDraft, createDraft, updateDraft, deleteDraft, CreateDraftDto, UpdateDraftDto } from '@/services/drafts';

export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: getDrafts,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useDraft(draftId: string | null) {
  return useQuery({
    queryKey: ['drafts', draftId],
    queryFn: () => getDraft(draftId!),
    enabled: !!draftId,
  });
}

export function useCreateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftDto: CreateDraftDto) => createDraft(draftDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, updateDto }: { draftId: string; updateDto: UpdateDraftDto }) =>
      updateDraft(draftId, updateDto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      queryClient.invalidateQueries({ queryKey: ['drafts', variables.draftId] });
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => deleteDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });
}
