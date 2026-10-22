import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

function boot(): void {
  createRoot(document.getElementById("root")!).render(<App />);
}

if (import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "1") {
  // Dynamic import inside the DEV guard so production builds drop the preview code.
  import("./dev/preview-session").then((m) => {
    if (m.isPreviewRequested(location.search)) m.startPreviewSession();
    boot();
  });
} else {
  boot();
}
