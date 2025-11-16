import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPost = createApi({
  reducerPath: "ApiPost",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/post",
    credentials: "include",
  }),
  tagTypes: ["Posts", "User"],
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (body) => ({
        url: "/create-post",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Posts"],
    }),
    getMyPosts: builder.query({
      query: () => "/my-posts",
      providesTags: ["Posts", "User"],
    }),
    updatePost: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Posts"],
    }),
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posts"],
    }),
    getPostsByUserId: builder.query({
      query: (userId) => `/user-posts/${userId}`,
      providesTags: ["Posts"],
    }),
    getFeed: builder.query({
      query: () => "/feed",
      providesTags: ["Posts"],
    }),
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Posts"],
    }),
    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/${postId}/comments`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Posts"],
    }),
    updateComment: builder.mutation({
      query: ({ postId, commentId, text }) => ({
        url: `/${postId}/comments/${commentId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: ["Posts"],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posts"],
    }),
    addReply: builder.mutation({
      query: ({ postId, commentId, text }) => ({
        url: `/${postId}/comments/${commentId}/replies`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Posts"],
    }),
    updateReply: builder.mutation({
      query: ({ postId, commentId, replyId, text }) => ({
        url: `/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "PUT",
        body: { text },
      }),
      invalidatesTags: ["Posts"],
    }),
    deleteReply: builder.mutation({
      query: ({ postId, commentId, replyId }) => ({
        url: `/${postId}/comments/${commentId}/replies/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posts"],
    }),
    searchEverything: builder.query({
      query: ({ search }) => ({
        url: "/anything",
        params: { search },
      }),
      providesTags: ["Posts"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetMyPostsQuery,
  useUpdatePostMutation,
  useGetPostsByUserIdQuery,
  useGetFeedQuery,
  useDeletePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useAddReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useSearchEverythingQuery,
} = ApiPost;
