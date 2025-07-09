import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const NotificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/notifications`,
    credentials: "include",
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    // Get notifications
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),

    // Mark notification as read
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // Get unread count
    getUnreadCount: builder.query({
      query: () => ({
        url: "/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery,
} = NotificationApi;
