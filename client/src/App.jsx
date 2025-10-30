import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./Index";
import { lazy } from "react";
import PrivateRoute from "./components/layout/PrivateRoute";

const Login = lazy(() => import("./pages/login/Login"));
const Chat = lazy(() => import("./pages/chat/Chat"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Friends = lazy(() => import("./pages/friends/Friends"));
const Setting = lazy(() => import("./pages/setting/Setting"));

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path='/' element={<Index />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/:username' element={<Profile />} />
          <Route path='/friends' element={<Friends />} />
          <Route path='/settings' element={<Setting />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
