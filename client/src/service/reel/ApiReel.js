import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiReel = createApi({
  reducerPath: "ApiReel",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/reel",
    credentials: "include",
  }),
  tagTypes: ["Reels", "User"],
  endpoints: (builder) => ({
    createReel: builder.mutation({
      query: (body) => ({
        url: "/create-reel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reels"],
    }),
    getReels: builder.query({
      query: () => "/get-reels",
      providesTags: ["Reels"],
    }),
    updateReel: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Reels"],
    }),
    deleteReel: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reels"],
    }),
    likeReel: builder.mutation({
      query: (reelId) => ({
        url: `/${reelId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Reels"],
    }),
    addComment: builder.mutation({
      query: ({ reelId, text }) => ({
        url: `/${reelId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Reels"],
    }),
    updateComment: builder.mutation({
      query: ({ reelId, commentId, text }) => ({
        url: `/${reelId}/comments/${commentId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: ["Reels"],
    }),
    deleteComment: builder.mutation({
      query: ({ reelId, commentId }) => ({
        url: `/${reelId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reels"],
    }),
    addReply: builder.mutation({
      query: ({ reelId, commentId, text }) => ({
        url: `/${reelId}/comments/${commentId}/replies`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Reels"],
    }),
    updateReply: builder.mutation({
      query: ({ reelId, commentId, replyId, text }) => ({
        url: `/${reelId}/comments/${commentId}/replies/${replyId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: ["Reels"],
    }),
    deleteReply: builder.mutation({
      query: ({ reelId, commentId, replyId }) => ({
        url: `/${reelId}/comments/${commentId}/replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reels"],
    }),
    getReelById: builder.query({
      query: (reelId) => `/${reelId}`,
      providesTags: ["Reels"],
    }),
  }),
});

export const {
  useCreateReelMutation,
  useGetReelsQuery,
  useUpdateReelMutation,
  useDeleteReelMutation,
  useLikeReelMutation,
  useAddCommentMutation,
  useUpdateCommentMutation, // --- BARU ---
  useDeleteCommentMutation,
  useAddReplyMutation,
  useUpdateReplyMutation, // --- BARU ---
  useDeleteReplyMutation,
  useGetReelByIdQuery,
} = ApiReel;
