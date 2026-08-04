// services/apis/ticket.api.ts

import { api } from '../index';

export const ticketApi = api
  .enhanceEndpoints({ addTagTypes: ['Ticket'] })
  .injectEndpoints({
  endpoints: builder => ({
    /**
     * ===============================
     * Create Ticket
     * ===============================
     */
    createTicket: builder.mutation({
      query: body => ({
        url: '/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Update Ticket
     * ===============================
     */
    updateTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tickets/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Cancel Ticket
     * ===============================
     */
    cancelTicket: builder.mutation({
      query: id => ({
        url: `/tickets/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Board Passenger
     * ===============================
     */
    boardPassenger: builder.mutation({
      query: id => ({
        url: `/tickets/${id}/board`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Transfer Seat
     * ===============================
     */
    transferSeat: builder.mutation({
      query: ({ id, seatNo }) => ({
        url: `/tickets/${id}/transfer`,
        method: 'PATCH',
        body: {
          seatNo,
        },
      }),
      invalidatesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Ticket Details
     * ===============================
     */
    getTicket: builder.query({
      query: id => `/tickets/${id}`,
      providesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Ticket By Seat
     * ===============================
     */
    getTicketBySeat: builder.query({
      query: ({ tripId, seatNo }) =>
        `/tickets/trip/${tripId}/seat/${seatNo}`,
      providesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Today's Tickets
     * ===============================
     */
    getTodayTickets: builder.query({
      query: pickupId =>
        `/tickets/today?pickup=${pickupId}`,
      providesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Trip Manifest
     * ===============================
     */
    getTripManifest: builder.query({
      query: tripId =>
        `/tickets/manifest/${tripId}`,
      providesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Search Passenger
     * ===============================
     */
    searchPassenger: builder.query({
      query: search =>
        `/tickets/passenger/search?search=${encodeURIComponent(
          search,
        )}`,
      providesTags: [{ type: 'Ticket' }],
    }),

    /**
     * ===============================
     * Reprint Ticket
     * ===============================
     */
    reprintTicket: builder.mutation({
      query: id => ({
        url: `/tickets/${id}/reprint`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useCancelTicketMutation,
  useBoardPassengerMutation,
  useTransferSeatMutation,
  useGetTicketQuery,
  useGetTicketBySeatQuery,
  useGetTodayTicketsQuery,
  useGetTripManifestQuery,
  useSearchPassengerQuery,
  useReprintTicketMutation,
} = ticketApi;