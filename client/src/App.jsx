import { lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import { DarkModeProvider } from "./context/DarkModeContext";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { useLoadUserMutation } from "./services/api/user/UserApi";
import { setUser } from "./services/api/user/UserSlice";

const Register = lazy(() => import("./pages/register/register"));
const Home = lazy(() => import("./pages/home/Home"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Friends = lazy(() => import("./pages/friend/Friends"));
const Message = lazy(() => import("./pages/message/Message"));
const Setting = lazy(() => import("./pages/setting/Setting"));

function App() {
  const dispatch = useDispatch();
  const [loadUser] = useLoadUserMutation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const timePromise = new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("User not found")), 10000);
        });

        const result = await Promise.race([loadUser().unwrap(), timePromise]);

        dispatch(setUser(result));
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [loadUser, dispatch]);

  return (
    <DarkModeProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/signin" element={<Login />} />

          <Route path="/signup" element={<Register />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/friends" element={<Friends />} />

          <Route path="/message" element={<Message />} />

          <Route path="/setting" element={<Setting />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
