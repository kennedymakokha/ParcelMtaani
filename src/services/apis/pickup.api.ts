import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        createPickup: builder.mutation({
            query: (body) => ({
                url: '/business/create/pickup',
                method: 'POST',
                body,
            }),
        }),

        getPickups: builder.query({
            query: ({ page, limit, search }: { page: number; limit: number; search: string }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                if (search) {
                    params.append('search', search);
                }
                return `/business/create/pickup?${params.toString()}`;
            },
        }),
        editPickup: builder.mutation({
            query: ({ data }) => ({
                url: `/business/create/pickup/${data._id}`,
                method: 'PUT',
                data,
            }),
        }),
        deletePickup: builder.mutation({
            query: (id) => ({
                url: `/business/create/pickup/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});


export const {
    useCreatePickupMutation,
    useDeletePickupMutation,
    useEditPickupMutation,
    useGetPickupsQuery
} = injectEndpoints;
