import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const FriendshipApi = createApi({
  reducerPath: "friendshipApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/friendship`,
    credentials: "include",
  }),
  tagTypes: ["Friendship", "FriendRequest"],
  endpoints: (builder) => ({
    // Send friend request
    sendFriendRequest: builder.mutation({
      query: (recipientId) => ({
        url: "/request",
        method: "POST",
        body: { recipientId },
      }),
      invalidatesTags: ["Friendship", "FriendRequest"],
    }),

    // Accept friend request
    acceptFriendRequest: builder.mutation({
      query: (friendshipId) => ({
        url: `/accept/${friendshipId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Friendship", "FriendRequest"],
    }),

    // Reject friend request
    rejectFriendRequest: builder.mutation({
      query: (friendshipId) => ({
        url: `/reject/${friendshipId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Friendship", "FriendRequest"],
    }),

    // Get friend requests
    getFriendRequests: builder.query({
      query: () => ({
        url: "/requests",
        method: "GET",
      }),
      providesTags: ["FriendRequest"],
    }),

    // Get friends list
    getFriends: builder.query({
      query: () => ({
        url: "/friends",
        method: "GET",
      }),
      providesTags: ["Friendship"],
    }),

    // Get friendship status
    getFriendshipStatus: builder.query({
      query: (userId) => ({
        url: `/status/${userId}`,
        method: "GET",
      }),
      providesTags: ["Friendship"],
    }),

    // Get mutual friends
    getMutualFriends: builder.query({
      query: (userId) => ({
        url: `/mutual/${userId}`,
        method: "GET",
      }),
      providesTags: ["Friendship"],
    }),

    // Get friendship suggestions
    getFriendshipSuggestions: builder.query({
      query: () => ({
        url: "/suggestions",
        method: "GET",
      }),
      providesTags: ["Friendship"],
    }),
  }),
});

export const {
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useGetFriendRequestsQuery,
  useGetFriendsQuery,
  useGetFriendshipStatusQuery,
  useGetMutualFriendsQuery,
  useGetFriendshipSuggestionsQuery,
} = FriendshipApi;
