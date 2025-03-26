import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add debug console statements
console.log("Main.tsx is executing");
const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("App rendered successfully");
} else {
  console.error("Root element not found - unable to render app");
}
