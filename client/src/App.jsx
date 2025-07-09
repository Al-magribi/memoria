import { lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import { DarkModeProvider } from "./context/DarkModeContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { useLoadUserQuery } from "./services/api/user/UserApi";
import { setUser } from "./services/api/user/UserSlice";

const Register = lazy(() => import("./pages/register/register"));
const Home = lazy(() => import("./pages/home/Home"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const UserProfile = lazy(() => import("./pages/user/UserProfile"));
const Friends = lazy(() => import("./pages/friend/Friends"));
const Message = lazy(() => import("./pages/message/Message"));
const Setting = lazy(() => import("./pages/setting/Setting"));

function App() {
  const dispatch = useDispatch();
  const { data, isLoading, error } = useLoadUserQuery();

  useEffect(() => {
    let timeoutId;

    if (!isLoading) {
      if (data) {
        dispatch(setUser(data));
      } else if (error) {
        console.log(error);
        // Don't set any user data if there's an error
      }
    } else {
      timeoutId = setTimeout(() => {
        console.log("User loading timeout");
      }, 10000);
    }
    return () => clearTimeout(timeoutId);
  }, [data, isLoading, error, dispatch]);

  return (
    <DarkModeProvider>
      <SocketProvider>
        <BrowserRouter>
          <ToastContainer />
          <Routes>
            <Route path='/' element={<Home />} />

            <Route path='/signin' element={<Login />} />

            <Route path='/signup' element={<Register />} />

            <Route path='/profile' element={<Profile />} />

            <Route path='/user/:userId' element={<UserProfile />} />

            <Route path='/friends' element={<Friends />} />

            <Route path='/message' element={<Message />} />

            <Route path='/setting' element={<Setting />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </DarkModeProvider>
  );
}

export default App;
