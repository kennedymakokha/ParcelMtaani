import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        registerPickup: builder.mutation({
            query: (body) => ({
                url: '/business/create/pickup',
                method: 'POST',
                body,
            }),
        }),

        getPickups: builder.query({
            query: () => '/business/get/pickups',
        }),
        deletePickup: builder.mutation({
            query: (id) => ({
                url: `/business/delete/pickup/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});


export const {
    useRegisterPickupMutation,
    useGetPickupsQuery,
    useDeletePickupMutation,
} = injectEndpoints;
