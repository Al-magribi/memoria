import "@ant-design/v5-patch-for-react-19";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./service/store.js";
import SocketContext from "./context/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketContext>
      <StrictMode>
        <App />
      </StrictMode>
    </SocketContext>
  </Provider>
);
