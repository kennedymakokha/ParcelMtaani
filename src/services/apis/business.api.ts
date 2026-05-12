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
         openPickup: builder.mutation({
            query: (body) => ({
                url: '/business/pickup/opening',
                method: 'POST',
                body,
            }),
        }),

        fetchPickups: builder.query({
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
               body: data,
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
    useFetchPickupsQuery,
    useGetBusinessByIdQuery,
    useGetBusinessesQuery,
    useDeleteBusinessMutation,
    useOpenPickupMutation

} = injectEndpoints;
