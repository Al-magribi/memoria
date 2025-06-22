import { createSlice } from "@reduxjs/toolkit";
import { UserApi } from "./UserApi";

const UserSlice = createSlice({
  name: "auth",
  initialState: {
    user: {},
    isSignin: false,
    isLoading: false,
  },
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload;
      state.isSignin = true;
      state.isLoading = false;
    },
    setLogout: (state) => {
      state.user = {};
      state.isSignin = false;
    },
    setLoading: (state) => {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(UserApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        UserApi.endpoints.signin.matchFulfilled,
        (state, { payload }) => {
          (state.user = payload),
            (state.isSignin = true),
            (state.isLoading = false);
        }
      )
      .addMatcher(UserApi.endpoints.signin.matchRejected, (state) => {
        (state.isLoading = false), (state.isSignin = false);
      })
      .addMatcher(
        UserApi.endpoints.loadUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.isSignin = true;
        }
      );
  },
});

export const { setLogin, setLogout, setLoading } = UserSlice.actions;
export default UserSlice.reducer;
