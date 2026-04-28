import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        registerParcel: builder.mutation({
            query: (body) => ({
                url: '/parcel',
                method: 'POST',
                body,
            }),
        }),

        fetchparcel: builder.query({
            query: ({ limit, sentFrom, page, sentTo, status, search }) => `/parcel?limit=${limit}&sentFrom=${sentFrom}&page=${page}&status=${status}&search=${search}&sentTo=${sentTo}`,
        }),
        fetchgroupedparcel: builder.query({
            query: ({ limit, pickupId, page, currentTruck, status, search }) => `/parcel/grouped?limit=${limit}&page=${page}&status=${status}&search=${search}&pickuId=${pickupId}&currentTruck=${currentTruck}`,
        }),
        fetchparcelJourney: builder.query({
            query: (id) => `/parcel/${id}/journey`,
        }),
        fetchTruckCount: builder.query({
            query: () => `/parcel/trucks/count`,
        }),
        fetchStatusCount: builder.query({
            query: () => `/parcel/status/count`,
        }),
        dispatchParcel: builder.mutation({
            query: (data) => ({
                url: '/parcel/dispatch/bulk',
                method: 'POST',
                body: data,
            }),
        }),
        markParcelAsrrived: builder.mutation({
            query: (data) => ({
                url: `/parcel/${data.code}/arrive`,
                method: 'PUT',
                body: data,
            }),
        }),

        updateParcel: builder.mutation({
            query: (data) => ({
                url: `/parcel/${data._id}`,
                method: "put",
                body: data
            })
        }),

    }),
});

export const {

    useFetchparcelQuery,
    useUpdateParcelMutation,
    useFetchgroupedparcelQuery,
    useRegisterParcelMutation,
    useDispatchParcelMutation,
    useFetchparcelJourneyQuery,
    useFetchTruckCountQuery,
    useFetchStatusCountQuery,
    useMarkParcelAsrrivedMutation
} = injectEndpoints;
