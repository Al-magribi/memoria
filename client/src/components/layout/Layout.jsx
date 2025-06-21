import React from "react";
import Header from "../header/Header";
import LeftBar from "../left/LeftBar";
import RightBar from "../right/RightBar";
import "./layout.scss";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />

      <div className="layout-content">
        <LeftBar />
        <div className="layout-main">{children}</div>
        <RightBar />
      </div>
    </div>
  );
};

export default Layout;
