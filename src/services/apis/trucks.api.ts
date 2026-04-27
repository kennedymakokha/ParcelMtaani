import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        createTruck: builder.mutation({
            query: (body) => ({
                url: '/trucks',
                method: 'POST',
                body,
            }),
        }),

        getTrucks: builder.query({
            query: ({ page, limit, search }: { page: number; limit: number; search: string }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                if (search) {
                    params.append('search', search);
                }
                return `/trucks?${params.toString()}`;
            },
        }),
        editTruck: builder.mutation({
            query: ({ id, body }: { id: string; body: any }) => ({
                url: `/trucks/${id}`,
                method: 'PUT',
                body,
            }),
        }),
        deleteTruck: builder.mutation({
            query: (id) => ({
                url: `/trucks/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});


export const {
    useCreateTruckMutation,
    useGetTrucksQuery,
    useDeleteTruckMutation,
    useEditTruckMutation
} = injectEndpoints;
