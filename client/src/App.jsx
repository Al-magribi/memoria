import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Index from "./Index";
import { lazy } from "react";
import { isAuthenticated } from "./utils/auth";
import { useLoadUserQuery } from "./service/user/ApiUser";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./service/user/SliceUser";
import { Suspense } from "react";
import LoadingScreen from "./components/loading/LoadingScreen";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import id from "javascript-time-ago/locale/id";

TimeAgo.addLocale(en);
TimeAgo.addDefaultLocale(id);

const Signin = lazy(() => import("./pages/auth/Signin"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Activation = lazy(() => import("./pages/auth/Activation"));
const Chat = lazy(() => import("./pages/chat/Chat"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Friends = lazy(() => import("./pages/friends/Friends"));
const Setting = lazy(() => import("./pages/setting/Setting"));

const App = () => {
  const isSignin = isAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { data, isLoading } = useLoadUserQuery(undefined, { skip: !isSignin });

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (data && !user) {
      dispatch(setUser(data));
    }

    const publicRoutes = ["/signin", "/signup", "/activation"];
    const isPublicRoute = publicRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (!isSignin && !isPublicRoute) {
      navigate("/signin");
    } else if (
      isSignin &&
      (location.pathname === "/signin" || location.pathname === "/signup")
    ) {
      navigate("/");
    }
  }, [isSignin, data, user, navigate, location.pathname, dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/activation/:code' element={<Activation />} />
        <Route path='/' element={<Index />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/:username' element={<Profile />} />
        <Route path='/friends' element={<Friends />} />
        <Route path='/settings' element={<Setting />} />
      </Routes>
    </Suspense>
  );
};

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
