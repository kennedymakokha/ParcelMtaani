// src/services/apis/pickup.api.ts
import { api } from '../index';

// 💡 Data model mapping perfectly to your Mongoose Schema fields
export interface Route {
  _id?: string;
  route_name: string;
  short_code?: string;
  state?: 'active' | 'inactive';
  createdBy?: string;
  business?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchRoutesResponse {
  data: Route[];
  total: number;
  page: number;
  limit: number;
}

export const injectEndpoints = api.injectEndpoints({
  endpoints: builder => ({
    createRoute: builder.mutation<Route, Partial<Route>>({
      query: (body) => ({
        url: '/routes',
        method: 'POST',
        body,
      }),
      // Forces list queries to refresh when a new one is built
    }),

    fetchRoutes: builder.query<FetchRoutesResponse, { page: number; limit: number; search: string }>({
      query: ({ page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) {
          params.append('search', search);
        }
        return `/routes?${params.toString()}`;
      },

    }),

    updateRoute: builder.mutation<Route, Partial<Route> & { _id: string }>({
      query: ({ data }: any) => ({
        url: `/routes/${data._id}`,
        method: 'PUT',
        body: data,
      }),
      //   invalidatesTags: (result, error, { _id }) => [{ type: 'Route' as any, id: _id }],
    }),

    TrashRoute: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/routes/${id}`,
        method: 'DELETE',
      }),

    }),
  }),
});

export const {
  useCreateRouteMutation,
  useTrashRouteMutation,
  useUpdateRouteMutation,
  useFetchRoutesQuery
} = injectEndpoints;