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
  useCreatepaymentMutation
} = injectEndpoints;
