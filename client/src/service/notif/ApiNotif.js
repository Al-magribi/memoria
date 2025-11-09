import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiNotif = createApi({
  reducerPath: "ApiNotif",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/notif" }),
  tagTypes: ["Notif"],
  endpoints: (builder) => ({
    getNotif: builder.query({
      query: () => "/get-notif",
      providesTags: ["Notif"],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/read-notif/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notif"],
    }),
    deleteNotif: builder.mutation({
      query: (id) => ({
        url: `/delete-notif/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notif"],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/read-all-notif",
        method: "PATCH",
      }),
      invalidatesTags: ["Notif"],
    }),
  }),
});

export const {
  useGetNotifQuery,
  useMarkAsReadMutation,
  useDeleteNotifMutation,
  useMarkAllAsReadMutation,
} = ApiNotif;
