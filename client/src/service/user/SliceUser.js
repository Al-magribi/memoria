import { createSlice } from "@reduxjs/toolkit";
import { ApiUser } from "./ApiUser";
import { setSignIn, setSignOut } from "../../utils/auth";

const UserSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      setSignOut();
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(ApiUser.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
      setSignOut();
    });
  },
});

export const { setUser, clearUser } = UserSlice.actions;
export default UserSlice.reducer;
