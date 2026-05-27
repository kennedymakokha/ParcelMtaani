// src/services/apis/pickup.api.ts
import { api } from '../index';

// 💡 Data model mapping perfectly to your Mongoose Schema fields
export interface Pickup {
  _id: string;
  pickup_name: string;
  phone_number?: string;
  working_hrs: string; // e.g. "8-17"
  contact_number?: string;
  contactName?: string;
  paid: boolean;
  short_code?: string;
  state: 'active' | 'inactive';
  consumerKey?: string;
  consumerSecret?: string;
  passKey?: string;
  shortCode?: string;
  strictMpesa?: boolean;
  primary_color?: string;
  secondary_color?: string;
  logo?: string;
  master_ke?: string;
  createdBy?: string;
  business?: string;
  deletedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchPickupsResponse {
  data: Pickup[];
  total: number;
  page: number;
  limit: number;
}

export const injectEndpoints = api.injectEndpoints({
  endpoints: builder => ({
    createPickup: builder.mutation<Pickup, Partial<Pickup>>({
      query: (body) => ({
        url: '/business/create/pickup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pickup' as any], // Forces list queries to refresh when a new one is built
    }),

    fetchPickups: builder.query<FetchPickupsResponse, { page: number; limit: number; search: string }>({
      query: ({ page, limit, search }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) {
          params.append('search', search);
        }
        return `/business/create/pickup?${params.toString()}`;
      },
      providesTags: ['Pickup' as any],
    }),

    updatePickup: builder.mutation<Pickup, Partial<Pickup> & { _id: string }>({
      query: (data) => ({
        url: `/business/pickup/${data._id}`,
        method: 'PUT',
        body: data,
      }),
    //   invalidatesTags: (result, error, { _id }) => [{ type: 'Pickup' as any, id: _id }],
    }),

    TrashPickup: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/business/pickup/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pickup' as any],
    }),
  }),
});

export const {
  useCreatePickupMutation,
  useTrashPickupMutation,
  useUpdatePickupMutation,
  useFetchPickupsQuery
} = injectEndpoints;