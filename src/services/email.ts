import api from './apiClient';

export interface Mailbox {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface Attachment {
  id: string;
  attachmentId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
}

export interface AttachmentDto {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
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
  attachments?: Attachment[];
}

export interface EmailDetail extends Email {
  body: string;
  readAt: string;
  attachments?: Attachment[];
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
  attachments?: AttachmentDto[];
}

export interface UploadAttachmentResponse {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  s3Key: string;
}

export interface ReplyEmailDto {
  body: string;
  replyAll?: boolean;
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

  async replyEmail(id: string, data: ReplyEmailDto): Promise<{ message: string }> {
    const response = await api.post(`emails/${id}/reply`, data);
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

  // Attachment functions
  async uploadAttachment(file: File): Promise<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('emails/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadMultipleAttachments(files: File[]): Promise<UploadAttachmentResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post('emails/attachments/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAttachmentDownloadUrl(attachmentId: string): Promise<{ url: string; expiresIn: number }> {
    const response = await api.get(`emails/attachments/${attachmentId}/url`);
    return response.data;
  },

  async downloadAttachment(attachmentId: string, filename: string): Promise<void> {
    const response = await api.get(`emails/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async deleteAttachment(attachmentId: string): Promise<{ message: string }> {
    const response = await api.delete(`emails/attachments/${attachmentId}`);
    return response.data;
  },

  async getEmailAttachments(emailId: string): Promise<Attachment[]> {
    const response = await api.get(`emails/${emailId}/attachments`);
    return response.data;
  },
};
