import api from './apiClient';

export interface Mailbox {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  isRead: boolean;
  isStarred: boolean;
  sentAt: string;
  folder: string;
}

export interface EmailDetail extends Email {
  body: string;
  readAt: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendEmailDto {
  to: string;
  subject: string;
  body: string;
}

export const emailService = {
  async getMailboxes(): Promise<Mailbox[]> {
    const response = await api.get('emails/mailboxes');
    return response.data;
  },

  async getEmailsByFolder(
    folder: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<EmailListResponse> {
    const response = await api.get(`emails/folder/${folder}`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getEmailById(id: string): Promise<EmailDetail> {
    const response = await api.get(`emails/${id}`);
    return response.data;
  },

  async sendEmail(data: SendEmailDto): Promise<{ message: string }> {
    const response = await api.post('emails/send', data);
    return response.data;
  },

  async toggleStar(id: string): Promise<{ message: string; isStarred: boolean }> {
    const response = await api.patch(`emails/${id}/star`);
    return response.data;
  },

  async markAsRead(id: string, isRead: boolean): Promise<{ message: string; isRead: boolean }> {
    const response = await api.patch(`emails/${id}/read`, { isRead });
    return response.data;
  },

  async deleteEmail(id: string): Promise<{ message: string }> {
    const response = await api.delete(`emails/${id}`);
    return response.data;
  },

  async seedMockEmails(): Promise<{ message: string }> {
    const response = await api.post('emails/seed');
    return response.data;
  },
};
