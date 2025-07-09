import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const StoryApi = createApi({
  reducerPath: "StoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/story" }),
  tagTypes: ["Story"],
  endpoints: (builder) => ({
    getStories: builder.query({
      query: () => "/get-stories",
      providesTags: ["Story"],
    }),
    getUserStories: builder.query({
      query: (userId) => `/get-stories/${userId}`,
      providesTags: ["Story"],
    }),
    getStoryDetail: builder.query({
      query: (storyId) => `/story/${storyId}`,
      providesTags: ["Story"],
    }),
    createStory: builder.mutation({
      query: (formData) => ({
        url: "/create-story",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Story"],
    }),
    deleteStory: builder.mutation({
      query: (id) => ({
        url: `/delete-story/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Story"],
    }),
  }),
});

export const {
  useGetStoriesQuery,
  useGetUserStoriesQuery,
  useGetStoryDetailQuery,
  useCreateStoryMutation,
  useDeleteStoryMutation,
} = StoryApi;
