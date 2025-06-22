import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./api/user/UserSlice";
import { UserApi } from "./api/user/UserApi";

const store = configureStore({
  reducer: {
    user: UserSlice,
    [UserApi.reducerPath]: UserApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(UserApi.middleware),
});

export default store;
