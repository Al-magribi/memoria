import { configureStore } from "@reduxjs/toolkit";
import SliceUser from "./user/SliceUser";
import { ApiUser } from "./user/ApiUser";
import { ApiPost } from "./post/ApiPost";
import { ApiReel } from "./reel/ApiReel";

const store = configureStore({
  reducer: {
    user: SliceUser,
    [ApiUser.reducerPath]: ApiUser.reducer,
    [ApiPost.reducerPath]: ApiPost.reducer,
    [ApiReel.reducerPath]: ApiReel.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiUser.middleware,
      ApiPost.middleware,
      ApiReel.middleware,
    ]),
});

export default store;
