import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import { DarkModeProvider } from "./context/DarkModeContext";

const Register = lazy(() => import("./pages/register/register"));
const Home = lazy(() => import("./pages/home/Home"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const Friends = lazy(() => import("./pages/friend/Friends"));
const Message = lazy(() => import("./pages/message/Message"));
const Setting = lazy(() => import("./pages/setting/Setting"));

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />

          <Route path='/signin' element={<Login />} />

          <Route path='/signup' element={<Register />} />

          <Route path='/profile' element={<Profile />} />

          <Route path='/friends' element={<Friends />} />

          <Route path='/message' element={<Message />} />

          <Route path='/setting' element={<Setting />} />
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  );
}

export default App;
