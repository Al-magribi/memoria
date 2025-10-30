import { createSlice } from "@reduxjs/toolkit";
import { ApiUser } from "./ApiUser";
import { setAuthenticated, clearAuthentication } from "../../utils/auth";

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
      .addMatcher(ApiUser.endpoints.signin.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        ApiUser.endpoints.signin.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.isLoading = false;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(ApiUser.endpoints.signin.matchRejected, (state) => {
        state.isLoading = false;
        // Remove isSignin from localStorage on registration failure
        clearAuthentication();
      })
      .addMatcher(
        ApiUser.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.isLoading = false;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(ApiUser.endpoints.login.matchRejected, (state) => {
        state.isLoading = false;
        // Remove isSignin from localStorage on login failure
        clearAuthentication();
      })
      .addMatcher(
        ApiUser.endpoints.loadUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          // Save isSignin to localStorage
          setAuthenticated();
        }
      )
      .addMatcher(ApiUser.endpoints.loadUser.matchRejected, (state) => {
        state.user = {};
        // Remove isSignin from localStorage on loadUser failure
        clearAuthentication();
      })
      .addMatcher(ApiUser.endpoints.logout.matchFulfilled, (state) => {
        console.log("Logout matcher triggered - clearing state");
        state.user = {};
        state.isLoading = false;
        // Remove isSignin from localStorage
        clearAuthentication();
      })
      .addMatcher(ApiUser.endpoints.logout.matchRejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setUser, setLogout, setLoading } = UserSlice.actions;
export default UserSlice.reducer;
