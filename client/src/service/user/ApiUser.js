import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiUser = createApi({
  reducerPath: "ApiUser",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/user`,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/signup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    activate: builder.mutation({
      query: (body) => ({
        url: "/activate",
        method: "POST",
        params: body,
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
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.query({
      query: () => ({
        url: "/load",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getProfile: builder.query({
      query: (fullName) => ({
        url: `/profile/${fullName}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getMyPhotos: builder.query({
      query: () => ({
        url: `/my-photos`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateGeneral: builder.mutation({
      query: (body) => ({
        url: "/settings/general",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updatePrivacy: builder.mutation({
      query: (body) => ({
        url: `/settings/privacy`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateDetails: builder.mutation({
      query: (body) => ({
        url: `/settings/details`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    uploadProfileImages: builder.mutation({
      query: (files) => {
        const formData = new FormData();
        if (files.avatar) {
          formData.append("avatar", files.avatar);
        }
        if (files.cover) {
          formData.append("cover", files.cover);
        }

        return {
          url: `/upload-profile-images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useSignupMutation,
  useActivateMutation,
  useLoginMutation,
  useLogoutMutation,
  useLoadUserQuery,
  useGetProfileQuery,
  useGetMyPhotosQuery,
  useUpdateGeneralMutation,
  useUpdatePrivacyMutation,
  useUpdateDetailsMutation,
  useUploadProfileImagesMutation,
} = ApiUser;
