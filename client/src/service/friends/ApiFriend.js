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
      query: ({ page = 1 }) => `/get-users?page=${page}`,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        const existingIds = new Set(currentCache.users.map((u) => u._id));
        const newUsers = newItems.users.filter((u) => !existingIds.has(u._id));
        currentCache.users.push(...newUsers);
        currentCache.hasMore = newItems.hasMore;
        currentCache.sentRequests = newItems.sentRequests;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: "Users", id: _id })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
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
  useGetMyFriendsQuery,
  useGetFriendRequestsQuery,
  useAddFriendMutation,
  useAcceptFriendMutation,
  useRejectFriendMutation,
  useCancelRequestMutation,
  useRemoveFriendMutation,
} = ApiFriend;
