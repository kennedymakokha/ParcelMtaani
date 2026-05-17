import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        Mpesapay: builder.mutation({
            query: (body) => ({
                url: '/m-pesa',
                method: 'POST',
                body,
            }),
        }),
        fetchpaymentStats: builder.query({
            query: ({ filterType }) => `/payments/daily/reconciliations?filter=${filterType}`,
        }),
        fetchpayments: builder.query({
            query: ({ filterType }) => `/payments?filter=${filterType}`,
        }),
        createpayment: builder.mutation({
            query: (body) => ({
                url: '/payments',
                method: 'POST',
                body,
            }),
        }),


    }),
});


export const {
    useMpesapayMutation,
    useCreatepaymentMutation,
    useFetchpaymentStatsQuery,
    useFetchpaymentsQuery
} = injectEndpoints;
