import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EmailDetail } from './email';

interface EmailListItem {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  sentAt: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: any[];
}

interface EmailCacheDB extends DBSchema {
  emails: {
    key: string;
    value: EmailListItem & { folder: string; cachedAt: number };
    indexes: { 'by-folder': string; 'by-date': number };
  };
  emailDetails: {
    key: string;
    value: EmailDetail & { cachedAt: number };
  };
  attachments: {
    key: string;
    value: {
      attachmentId: string;
      emailId: string;
      filename: string;
      data: Blob;
      cachedAt: number;
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
}

class EmailCacheService {
  private db: IDBPDatabase<EmailCacheDB> | null = null;
  private readonly DB_NAME = 'email-cache';
  private readonly DB_VERSION = 1;
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<EmailCacheDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Emails store
          if (!db.objectStoreNames.contains('emails')) {
            const emailStore = db.createObjectStore('emails', { keyPath: 'id' });
            emailStore.createIndex('by-folder', 'folder');
            emailStore.createIndex('by-date', 'cachedAt');
          }

          // Email details store
          if (!db.objectStoreNames.contains('emailDetails')) {
            db.createObjectStore('emailDetails', { keyPath: 'id' });
          }

          // Attachments store
          if (!db.objectStoreNames.contains('attachments')) {
            db.createObjectStore('attachments', { keyPath: 'attachmentId' });
          }

          // Metadata store
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  // Email list caching
  async cacheEmails(folder: string, emails: EmailListItem[]): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const tx = this.db.transaction('emails', 'readwrite');
    const store = tx.objectStore('emails');

    const cachedAt = Date.now();
    await Promise.all(
      emails.map((email) =>
        store.put({
          ...email,
          folder,
          cachedAt,
        })
      )
    );

    await tx.done;
  }

  async getCachedEmails(folder: string): Promise<EmailListItem[] | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const tx = this.db.transaction('emails', 'readonly');
    const store = tx.objectStore('emails');
    const index = store.index('by-folder');

    const emails = await index.getAll(folder);
    await tx.done;

    if (emails.length === 0) return null;

    // Check if cache is still valid
    const now = Date.now();
    const validEmails = emails.filter((email) => now - email.cachedAt < this.CACHE_DURATION);

    if (validEmails.length === 0) return null;

    // Remove cached metadata before returning
    return validEmails.map(({ folder, cachedAt, ...email }) => email);
  }

  // Email detail caching
  async cacheEmailDetail(email: EmailDetail): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    await this.db.put('emailDetails', {
      ...email,
      cachedAt: Date.now(),
    });
  }

  async getCachedEmailDetail(emailId: string): Promise<EmailDetail | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const cached = await this.db.get('emailDetails', emailId);
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.cachedAt > this.CACHE_DURATION) {
      return null;
    }

    const { cachedAt, ...email } = cached;
    return email;
  }

  // Attachment caching
  async cacheAttachment(
    attachmentId: string,
    emailId: string,
    filename: string,
    data: Blob
  ): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    await this.db.put('attachments', {
      attachmentId,
      emailId,
      filename,
      data,
      cachedAt: Date.now(),
    });
  }

  async getCachedAttachment(attachmentId: string): Promise<Blob | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const cached = await this.db.get('attachments', attachmentId);
    if (!cached) return null;

    // Check if cache is still valid (7 days for attachments)
    if (Date.now() - cached.cachedAt > this.CACHE_DURATION * 7) {
      return null;
    }

    return cached.data;
  }

  // Metadata management
  async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    await this.db.put('metadata', {
      key,
      value,
      updatedAt: Date.now(),
    });
  }

  async getMetadata(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    const metadata = await this.db.get('metadata', key);
    return metadata?.value || null;
  }

  // Cache management
  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    const now = Date.now();

    // Clear expired emails
    const emailTx = this.db.transaction('emails', 'readwrite');
    const emailStore = emailTx.objectStore('emails');
    const emailIndex = emailStore.index('by-date');
    const expiredEmails = await emailIndex.getAll(
      IDBKeyRange.upperBound(now - this.CACHE_DURATION)
    );
    await Promise.all(expiredEmails.map((email) => emailStore.delete(email.id)));
    await emailTx.done;

    // Clear expired email details
    const detailTx = this.db.transaction('emailDetails', 'readwrite');
    const detailStore = detailTx.objectStore('emailDetails');
    const allDetails = await detailStore.getAll();
    await Promise.all(
      allDetails
        .filter((detail) => now - detail.cachedAt > this.CACHE_DURATION)
        .map((detail) => detailStore.delete(detail.id))
    );
    await detailTx.done;

    // Clear expired attachments (7 days)
    const attachTx = this.db.transaction('attachments', 'readwrite');
    const attachStore = attachTx.objectStore('attachments');
    const allAttachments = await attachStore.getAll();
    await Promise.all(
      allAttachments
        .filter((attachment) => now - attachment.cachedAt > this.CACHE_DURATION * 7)
        .map((attachment) => attachStore.delete(attachment.attachmentId))
    );
    await attachTx.done;
  }

  async clearAllCache(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    await Promise.all([
      this.db.clear('emails'),
      this.db.clear('emailDetails'),
      this.db.clear('attachments'),
      this.db.clear('metadata'),
    ]);
  }

  async getCacheStats(): Promise<{
    emails: number;
    emailDetails: number;
    attachments: number;
    totalSize: number;
  }> {
    if (!this.db) await this.init();
    if (!this.db)
      return { emails: 0, emailDetails: 0, attachments: 0, totalSize: 0 };

    const [emailCount, detailCount, attachmentCount] = await Promise.all([
      this.db.count('emails'),
      this.db.count('emailDetails'),
      this.db.count('attachments'),
    ]);

    // Estimate size (rough calculation)
    const attachments = await this.db.getAll('attachments');
    const totalSize = attachments.reduce((sum, att) => sum + att.data.size, 0);

    return {
      emails: emailCount,
      emailDetails: detailCount,
      attachments: attachmentCount,
      totalSize,
    };
  }
}

export const emailCache = new EmailCacheService();
