import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const PostApi = createApi({
  reducerPath: "PostApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `/api/post`,
    credentials: "include",
  }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    addPost: builder.mutation({
      query: (body) => ({
        url: "/add-post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
    getFeedPosts: builder.query({
      query: () => ({
        url: "/get-feed-posts",
        method: "GET",
      }),
      providesTags: ["Post"],
    }),
    getMyPosts: builder.query({
      query: () => ({
        url: "/get-my-posts",
        method: "GET",
      }),
      providesTags: ["Post"],
    }),
    getPost: builder.query({
      query: (postId) => ({
        url: `/get-post/${postId}`,
        method: "GET",
      }),
      providesTags: ["Post"],
    }),
    updatePost: builder.mutation({
      query: ({ postId, body }) => ({
        url: `/update-post/${postId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/delete-post/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    addComment: builder.mutation({
      query: ({ postId, body }) => ({
        url: `/add-comment/${postId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
    addReply: builder.mutation({
      query: ({ postId, commentId, body }) => ({
        url: `/add-reply/${postId}/comments/${commentId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Post"],
    }),
    likeComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/like-comment/${postId}/comments/${commentId}`,
        method: "POST",
      }),
      invalidatesTags: ["Post"],
    }),
    likeReply: builder.mutation({
      query: ({ postId, commentId, replyId }) => ({
        url: `/like-reply/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "POST",
      }),
      invalidatesTags: ["Post"],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/delete-comment/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
    deleteReply: builder.mutation({
      query: ({ postId, commentId, replyId }) => ({
        url: `/delete-reply/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const {
  useAddPostMutation,
  useGetFeedPostsQuery,
  useGetMyPostsQuery,
  useGetPostQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
} = PostApi;
