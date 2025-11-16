import { z } from "zod";

export type FetchingData<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type PagedData<T, K extends string> = Partial<{
  offset: number;
  limit: number;
  total: number;
}> & {
  [key in K]: T[];
};

export const pagingSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10),
});

export type PagingSchema = z.infer<typeof pagingSchema>;
