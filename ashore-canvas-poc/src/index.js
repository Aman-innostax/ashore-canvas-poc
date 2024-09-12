import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import DemoCanvas from "./Components/DemoCanvas";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    {/* <App /> */}
    <DemoCanvas />
  </StrictMode>
);
