import { createBrowserRouter } from "react-router";
import { Home } from "./pages/home";
import { CharacterCreation } from "./pages/character-creation";
import { Campaign } from "./pages/campaign";
import { CampaignList } from "./pages/campaign-list";
import { History } from "./pages/history";
import { Settings } from "./pages/settings";
import { NotFound } from "./pages/not-found";
import { Layout } from "./components/shared/layout";
import { ProtectedRoute } from "./components/shared/protected-route";
import { Landing } from "./pages/landing";
import { AuthCallback } from "./pages/auth-callback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            Component: Home,
          },
          {
            path: "character/new",
            Component: CharacterCreation,
          },
          {
            path: "adventure/:id",
            Component: Campaign,
          },
          {
            path: "campaigns",
            Component: CampaignList,
          },
          {
            path: "history",
            Component: History,
          },
          {
            path: "settings",
            Component: Settings,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
