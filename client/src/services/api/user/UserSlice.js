import { createSlice } from "@reduxjs/toolkit";
import { UserApi } from "./UserApi";
import { setAuthenticated, clearAuthentication } from "../../../utils/auth";

const UserSlice = createSlice({
  name: "auth",
  initialState: {
    user: {},
    isLoading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
      // Save isSignin to localStorage
      setAuthenticated();
    },
    setLogout: (state) => {
      state.user = {};
      // Remove isSignin from localStorage
      clearAuthentication();
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
        UserApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.isLoading = false;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(UserApi.endpoints.register.matchRejected, (state) => {
        state.isLoading = false;
        // Remove isSignin from localStorage on registration failure
        clearAuthentication();
      })
      .addMatcher(
        UserApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.isLoading = false;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(UserApi.endpoints.login.matchRejected, (state) => {
        state.isLoading = false;
        // Remove isSignin from localStorage on login failure
        clearAuthentication();
      })
      .addMatcher(
        UserApi.endpoints.loadUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(UserApi.endpoints.loadUser.matchRejected, (state) => {
        state.user = {};
        // Remove isSignin from localStorage on loadUser failure
        clearAuthentication();
      })
      .addMatcher(UserApi.endpoints.logout.matchFulfilled, (state) => {
        console.log("Logout matcher triggered - clearing state");
        state.user = {};
        state.isLoading = false;
        // Remove isSignin from localStorage
        clearAuthentication();
      })
      .addMatcher(UserApi.endpoints.logout.matchRejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setUser, setLogout, setLoading } = UserSlice.actions;
export default UserSlice.reducer;
