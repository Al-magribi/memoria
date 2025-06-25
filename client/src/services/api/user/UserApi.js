import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/api/auth`, credentials: "include" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.mutation({
      query: () => ({
        url: "/load-user",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/profile/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updatePrivacy: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/profile/${userId}/privacy`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateNotifications: builder.mutation({
      query: ({ userId, body }) => ({
        url: `/profile/${userId}/notifications`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLoadUserMutation,
  useUpdateProfileMutation,
  useUpdatePrivacyMutation,
  useUpdateNotificationsMutation,
} = UserApi;
