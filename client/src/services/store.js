import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./api/user/UserSlice";
import { UserApi } from "./api/user/UserApi";
import { PostApi } from "./api/post/PostApi";

const store = configureStore({
  reducer: {
    user: UserSlice,
    [UserApi.reducerPath]: UserApi.reducer,
    [PostApi.reducerPath]: PostApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(UserApi.middleware, PostApi.middleware),
});

export default store;
