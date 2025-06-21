import React from "react";
import "./rightbar.scss";
import Suggestions from "./Suggestions";
import Friends from "./Friends";

const RightBar = () => {
  // Hanya render di desktop
  if (window.innerWidth <= 1024) return null;
  return (
    <div className='flex-1 right-bar d-flex flex-column'>
      <Suggestions />

      <Friends />
    </div>
  );
};

export default RightBar;
