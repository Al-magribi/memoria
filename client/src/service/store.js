import { configureStore } from "@reduxjs/toolkit";
import SliceUser from "./user/SliceUser";
import { ApiUser } from "./user/ApiUser";

const store = configureStore({
  reducer: { user: SliceUser, [ApiUser.reducerPath]: ApiUser.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ApiUser.middleware),
});

export default store;
