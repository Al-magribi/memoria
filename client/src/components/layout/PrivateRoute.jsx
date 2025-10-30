import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const PrivateRoute = () => {
  // Periksa apakah pengguna sudah login
  // Jika pengguna belum login, arahkan ke halaman login
  return isAuthenticated() ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoute;
