import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ChatApi = createApi({
  reducerPath: "ChatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/chat",
    credentials: "include",
  }),
  tagTypes: ["Chats", "Messages"],
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),
    getChatsFromUser: builder.query({
      query: (id) => `/chats/${id}`,
      providesTags: ["Chats"],
    }),
    getChatMessages: builder.query({
      query: (chatId) => `/chats/${chatId}`,
      providesTags: (result, error, chatId) => [
        { type: "Messages", id: chatId },
      ],
    }),
    createChat: builder.mutation({
      query: (chat) => ({
        url: "/chats",
        method: "POST",
        body: chat,
      }),
      invalidatesTags: ["Chats"],
    }),
    markChatAsRead: builder.mutation({
      query: (chatId) => ({
        url: `/chats/${chatId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: "Messages", id: chatId },
        "Chats",
      ],
    }),
    uploadChatFile: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatsFromUserQuery,
  useGetChatMessagesQuery,
  useCreateChatMutation,
  useMarkChatAsReadMutation,
  useUploadChatFileMutation,
} = ChatApi;
