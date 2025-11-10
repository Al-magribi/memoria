import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiChat = createApi({
  reducerPath: "ApiChat",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/chat",
    credentials: "include",
  }),
  tagTypes: ["Conversations", "Chats"],
  endpoints: (builder) => ({
    getMyFriends: builder.query({
      query: ({ search }) => ({
        url: "/get-my-friends",
        params: { search },
      }),
      providesTags: ["Conversations"],
    }),
    getConversations: builder.query({
      query: () => "/get-conversations",
      providesTags: ["Conversations"],
    }),
    getChats: builder.query({
      query: (conversationId) => `/get-chats/${conversationId}`,
      // INI BAGIAN PENTING:
      invalidatesTags: (result, error, arg) => ["Chat", "Conversation"],
    }),
    createChat: builder.mutation({
      query: (body) => ({
        url: "/create-chat",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations", "Chats"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMyFriendsQuery,
  useGetChatsQuery,
  useCreateChatMutation,
} = ApiChat;
