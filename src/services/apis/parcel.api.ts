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
            query: ({limit, sentFrom,page,status,search}) => `/parcel?limit=${limit}&sentFrom=${sentFrom}&page=${page}&status=${status}&search=${search}`,
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
   
    useRegisterParcelMutation,
  
} = injectEndpoints;
