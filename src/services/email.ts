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
  nextPageToken?: string;
  hasMore: boolean;
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

export interface EmailFilters {
  search?: string;
  from?: string;
  unread?: boolean;
  starred?: boolean;
  startDate?: Date;
  endDate?: Date;
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
    filters?: EmailFilters,
  ): Promise<EmailListResponse> {
    const params: any = { page, limit };
    
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.from) params.from = filters.from;
      if (filters.unread !== undefined) params.unread = filters.unread;
      if (filters.starred !== undefined) params.starred = filters.starred;
      if (filters.startDate) params.startDate = filters.startDate.toISOString();
      if (filters.endDate) params.endDate = filters.endDate.toISOString();
    }
    
    const response = await api.get(`emails/folder/${folder}`, { params });
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

  async downloadAttachment(attachmentId: string, filename: string, emailId?: string): Promise<void> {
    // Determine endpoint based on whether it's a Gmail attachment or database/S3 attachment
    const endpoint = emailId 
      ? `emails/attachments/gmail/${emailId}/${attachmentId}/download`
      : `emails/attachments/${attachmentId}/download`;
      
    const response = await api.get(endpoint, {
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

  async bulkDelete(emailIds: string[]): Promise<{ message: string; deleted: number }> {
    const response = await api.post('emails/bulk/delete', { emailIds });
    return response.data;
  },

  async bulkToggleStar(emailIds: string[], star: boolean): Promise<{ message: string; modified: number }> {
    const response = await api.post('emails/bulk/star', { emailIds, star });
    return response.data;
  },

  async bulkMarkAsRead(emailIds: string[], isRead: boolean): Promise<{ message: string; modified: number }> {
    const response = await api.post('emails/bulk/read', { emailIds, isRead });
    return response.data;
  },
};
