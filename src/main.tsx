import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const storedTheme = window.localStorage.getItem("bpjsight-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : prefersDark ? "dark" : "light";

document.documentElement.classList.toggle("dark", initialTheme === "dark");
document.documentElement.dataset.theme = initialTheme;

createRoot(document.getElementById("root")!).render(<App />);


