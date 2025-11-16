import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { PagedData, PagingSchema } from "@/lib/types/pagination";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateSearchParams = (
  data: Record<string, string | string[] | number | boolean | undefined>
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (val !== "") {
            params.append(key, val.toString());
          }
        });
      } else {
        params.append(key, value.toString());
      }
    }
  }

  return params.toString();
};

export const fromOffsetToPage = <T, K extends string>(value: PagedData<T, K>) => {
  if (!value.offset || !value.limit) return { page: 1, pageSize: 10 };
  return {
    page: Math.ceil(value.offset / value.limit) + 1,
    pageSize: value.limit,
  };
};

export const fromPageToOffset = (value: PagingSchema) => {
  return {
    offset: (value.page - 1) * value.pageSize,
    limit: value.pageSize,
  };
};
