import { configureStore } from "@reduxjs/toolkit";
import SliceUser from "./user/SliceUser";
import { ApiUser } from "./user/ApiUser";
import { ApiPost } from "./post/ApiPost";
import { ApiReel } from "./reel/ApiReel";
import { ApiFriend } from "./friends/ApiFriend";
import { ApiNotif } from "./notif/ApiNotif";
import { ApiChat } from "./chat/ApiChat";

const store = configureStore({
  reducer: {
    user: SliceUser,
    [ApiUser.reducerPath]: ApiUser.reducer,
    [ApiPost.reducerPath]: ApiPost.reducer,
    [ApiReel.reducerPath]: ApiReel.reducer,
    [ApiFriend.reducerPath]: ApiFriend.reducer,
    [ApiNotif.reducerPath]: ApiNotif.reducer,
    [ApiChat.reducerPath]: ApiChat.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiUser.middleware,
      ApiPost.middleware,
      ApiReel.middleware,
      ApiFriend.middleware,
      ApiNotif.middleware,
      ApiChat.middleware,
    ]),
});

export default store;
