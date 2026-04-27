import type { AxiosResponse } from 'axios'

type Envelope<T> = { data: T; meta?: PaginationMeta }

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ListResult<T> = {
  data: T[]
  meta: PaginationMeta
}

export function unwrap<T>(response: AxiosResponse<Envelope<T> | T>): T {
  const body = response.data as Envelope<T> | T
  if (body && typeof body === 'object' && 'data' in (body as object)) {
    return (body as Envelope<T>).data
  }
  return body as T
}

export function unwrapList<T>(response: AxiosResponse<Envelope<T[]>>): ListResult<T> {
  const body = response.data
  const list = (body?.data ?? (body as unknown as T[])) as T[]
  const meta: PaginationMeta = body?.meta ?? {
    page: 1,
    limit: list.length,
    total: list.length,
    totalPages: 1,
  }
  return { data: list, meta }
}
