import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailService, SendEmailDto, ReplyEmailDto } from '@/services/email';
import { useToast } from '@/hooks/use-toast';

export function useMailboxes() {
  return useQuery({
    queryKey: ['mailboxes'],
    queryFn: () => emailService.getMailboxes(),
  });
}

export function useEmailsByFolder(folder: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['emails', folder, page, limit],
    queryFn: () => emailService.getEmailsByFolder(folder, page, limit),
    enabled: !!folder,
  });
}

export function useEmailDetail(id: string) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailService.getEmailById(id),
    enabled: !!id,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SendEmailDto) => emailService.sendEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({
        title: 'Success',
        description: 'Email sent successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send email',
        variant: 'destructive',
      });
    },
  });
}

export function useReplyEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplyEmailDto }) => {
      return emailService.replyEmail(id, data);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email', variables.id] });
      toast({
        title: 'Success',
        description: 'Reply sent successfully!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send reply',
        variant: 'destructive',
      });
    },
  });
}

export function useToggleStar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => emailService.toggleStar(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email'] });
      toast({
        title: data.isStarred ? 'Starred' : 'Unstarred',
        description: data.isStarred
          ? 'Email added to starred'
          : 'Email removed from starred',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update email',
        variant: 'destructive',
      });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      emailService.markAsRead(id, isRead),
    onMutate: async ({ id, isRead }) => {
      await queryClient.cancelQueries({ queryKey: ['email', id] });
      await queryClient.cancelQueries({ queryKey: ['emails'] });

      const previousEmail = queryClient.getQueryData(['email', id]);

      queryClient.setQueryData(['email', id], (old: any) => {
        if (!old) return old;
        return { ...old, isRead };
      });

      queryClient.setQueriesData({ queryKey: ['emails'] }, (old: any) => {
        if (!old?.emails) return old;
        return {
          ...old,
          emails: old.emails.map((email: any) =>
            email.id === id ? { ...email, isRead } : email
          ),
        };
      });

      return { previousEmail };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousEmail) {
        queryClient.setQueryData(['email', id], context.previousEmail);
      }
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
    },
  });
}

export function useDeleteEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => emailService.deleteEmail(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete email',
        variant: 'destructive',
      });
    },
  });
}

export function useSeedMockEmails() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => emailService.seedMockEmails(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mailboxes'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to seed emails',
        variant: 'destructive',
      });
    },
  });
}
