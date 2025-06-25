import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const UserApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/auth`,
    credentials: "include",
  }),
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
    loadUser: builder.query({
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
    uploadProfilePicture: builder.mutation({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("profilePicture", file);

        return {
          url: `/profile/upload-picture?userId=${userId}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
    uploadCoverPhoto: builder.mutation({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append("coverPhoto", file);

        return {
          url: `/profile/upload-cover?userId=${userId}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLoadUserQuery,
  useUpdateProfileMutation,
  useUpdatePrivacyMutation,
  useUpdateNotificationsMutation,
  useUploadProfilePictureMutation,
  useUploadCoverPhotoMutation,
} = UserApi;
