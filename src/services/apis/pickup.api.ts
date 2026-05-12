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

        fetchPickups: builder.query({
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
        updatePickup: builder.mutation({
            query: (data) => {
                
                return (
                    ({
                        url: `/business/pickup/${data.id}`,
                        method: 'PUT',
                        body: data,
                    })
                )
            },
        }),
        TrashPickup: builder.mutation({
            query: (id) => ({
                url: `/business/pickup/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});


export const {
    useCreatePickupMutation,
    useTrashPickupMutation,
    useUpdatePickupMutation,
    useFetchPickupsQuery
} = injectEndpoints;
