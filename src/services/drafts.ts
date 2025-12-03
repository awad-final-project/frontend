import apiClient from './apiClient';

export interface Draft {
  _id: string;
  userId: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftDto {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

export interface UpdateDraftDto extends Partial<CreateDraftDto> {}

export async function getDrafts(): Promise<Draft[]> {
  const response = await apiClient.get('email/drafts');
  return response.data;
}

export async function getDraft(draftId: string): Promise<Draft> {
  const response = await apiClient.get(`email/drafts/${draftId}`);
  return response.data;
}

export async function createDraft(draftDto: CreateDraftDto): Promise<Draft> {
  const response = await apiClient.post('email/drafts', draftDto);
  return response.data;
}

export async function updateDraft(draftId: string, updateDto: UpdateDraftDto): Promise<Draft> {
  const response = await apiClient.put(`email/drafts/${draftId}`, updateDto);
  return response.data;
}

export async function deleteDraft(draftId: string): Promise<void> {
  await apiClient.delete(`email/drafts/${draftId}`);
}
