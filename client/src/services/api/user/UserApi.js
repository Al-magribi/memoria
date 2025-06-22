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
    signin: builder.mutation({
      query: (body) => ({
        url: "/signin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.query({
      query: () => ({
        url: "/loadUser",
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useRegisterMutation } = UserApi;
