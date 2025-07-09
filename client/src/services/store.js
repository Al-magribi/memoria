import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./api/user/UserSlice";
import { UserApi } from "./api/user/UserApi";
import { PostApi } from "./api/post/PostApi";
import { FriendshipApi } from "./api/friendship/FriendshipApi";
import { NotificationApi } from "./api/notification/NotificationApi";
import { ChatApi } from "./api/chat/chatApi";
import { StoryApi } from "./api/story/StoryApi";

const store = configureStore({
  reducer: {
    user: UserSlice,
    [UserApi.reducerPath]: UserApi.reducer,
    [PostApi.reducerPath]: PostApi.reducer,
    [FriendshipApi.reducerPath]: FriendshipApi.reducer,
    [NotificationApi.reducerPath]: NotificationApi.reducer,
    [ChatApi.reducerPath]: ChatApi.reducer,
    [StoryApi.reducerPath]: StoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      UserApi.middleware,
      PostApi.middleware,
      FriendshipApi.middleware,
      NotificationApi.middleware,
      ChatApi.middleware,
      StoryApi.middleware
    ),
});

export default store;
