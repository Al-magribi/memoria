import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiFriend = createApi({
  reducerPath: "ApiFriend",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/friend",
    credentials: "include",
  }),
  tagTypes: ["Friends", "Users", "FriendRequests"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ page = 1, search }) => ({
        url: "/get-users",
        params: { page, search },
      }),
      providesTags: ["Users"],
    }),
    getOnlineFriends: builder.query({
      query: () => "/get-online-friends",
      providesTags: ["Friends"],
    }),
    getMyFriends: builder.query({
      query: () => "/get-my-friends",
      providesTags: ["Friends"],
    }),
    getFriendRequests: builder.query({
      query: () => "/get-friend-requests",
      providesTags: ["FriendRequests"],
    }),
    addFriend: builder.mutation({
      query: (friendId) => ({
        url: `/add-friend/${friendId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),
    acceptFriend: builder.mutation({
      query: (friendId) => ({
        url: `/accept-friend/${friendId}`,
        method: "POST",
      }),
      invalidatesTags: ["Friends", "FriendRequests", "Users"],
    }),
    rejectFriend: builder.mutation({
      query: (friendId) => ({
        url: `/reject-friend/${friendId}`,
        method: "POST",
      }),
      invalidatesTags: ["FriendRequests", "Users"],
    }),
    cancelRequest: builder.mutation({
      query: (friendId) => ({
        url: `/cancel-request/${friendId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),
    removeFriend: builder.mutation({
      query: (friendId) => ({
        url: `/remove-friend/${friendId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Friends", "Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetOnlineFriendsQuery,
  useGetMyFriendsQuery,
  useGetFriendRequestsQuery,
  useAddFriendMutation,
  useAcceptFriendMutation,
  useRejectFriendMutation,
  useCancelRequestMutation,
  useRemoveFriendMutation,
} = ApiFriend;
