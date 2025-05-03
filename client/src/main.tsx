import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n"; // i18n 초기화 임포트

createRoot(document.getElementById("root")!).render(<App />);
