import { setCredentials } from '../../features/auth/authSlice';
import { api } from './../index'

export const injectEndpoints = api.injectEndpoints({
    endpoints: builder => ({
        signup: builder.mutation({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
        }),
        activate: builder.mutation({
            query: (body) => ({
                url: '/auth/activate-user',
                method: 'POST',
                body,
            }),
        }),
        verify: builder.mutation({
            query: (body) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body,
            }),
        }),
        requestOTP: builder.mutation({
            query: (body) => ({
                url: '/auth/request-otp',
                method: 'POST',
                body,
            }),
        }),
        resetPassword: builder.mutation({
            query: (body) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body,
            }),
        }),
        login: builder.mutation({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
        }),
        getSession: builder.query({
            query: () => '/auth',
        }),
        getUsers: builder.query({
            query: ({ role, page, pickup }) => `/auth/users?role=${role}&page=${page}&pickup=${pickup}`,
        }),
        fetchUser: builder.query({
            query: () => 'auth/active-user',

            async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data } = await queryFulfilled;

                    const state = getState() as any;

                    dispatch(
                        setCredentials({
                            token: state.auth.token,
                            user: data.user,
                        }),
                    );
                } catch (err) {
                    console.log(err);
                }
            },
        }),
        updateuser: builder.mutation({
            query: (data) => ({
                url: `auth/${data._id}`,
                method: "put",
                body: data
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/auth/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useResetPasswordMutation,
    useVerifyMutation,
    useRequestOTPMutation,
    useGetUsersQuery,
    useUpdateuserMutation,
    useActivateMutation,
    useSignupMutation,
    useLoginMutation,
    useGetSessionQuery,
    useLogoutMutation,
    useDeleteUserMutation,
    useLazyFetchUserQuery
} = injectEndpoints;
