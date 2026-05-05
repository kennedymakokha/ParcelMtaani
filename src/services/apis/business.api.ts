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
        getBusinessById: builder.query({
            query: (id) => `/business/${id}/pickups`,
        }),
        AddBusiness: builder.mutation({
            query: (body) => ({
                url: '/business',
                method: 'POST',
                body,
            }),
        }),
        getBusinesses: builder.query({
            query: () => '/business',
        }),
        UpdateBusiness: builder.mutation({
            query: (data: any) => ({
                url: `/business/${data.id}`,
                method: 'PUT',
                data,
            }),
        }),

        DeleteBusiness: builder.mutation({
            query: (id) => ({
                url: `/business/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});


export const {
    useRegisterPickupMutation,
    useUpdateBusinessMutation,
    useAddBusinessMutation,
    useGetPickupsQuery,
    useGetBusinessByIdQuery,
    useGetBusinessesQuery,
    useDeleteBusinessMutation,

} = injectEndpoints;
