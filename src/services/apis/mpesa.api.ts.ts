import { api } from '../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        Mpesapay: builder.mutation({
            query: (body) => ({
                url: '/payments',
                method: 'POST',
                body,
            }),
        }),

       
    }),
});


export const {
  useMpesapayMutation
} = injectEndpoints;
