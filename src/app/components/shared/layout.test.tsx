import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthContext } from "@/app/context/auth-context";
import { Home } from "@/app/pages/home/index";
import { Layout } from "./layout";

vi.mock("@/app/api/characters", () => ({ getCharacters: () => Promise.resolve([]) }));
vi.mock("@/app/api/campaigns", () => ({ createCampaign: vi.fn() }));

const mockAuth = {
  user: { id: "1", username: "Steph", avatar: null, email: null },
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
};

function renderAt(path: string) {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Home />} />
            <Route path="campaigns" element={<p>Campaigns</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("Layout navbar", () => {
  it("puts one overlay navbar inside the dashboard hero, so it scrolls away with the art", () => {
    const { container } = renderAt("/dashboard");
    const navs = container.querySelectorAll("nav[data-variant]");
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAttribute("data-variant", "overlay");
    expect(navs[0].closest('section[aria-labelledby="dashboard-title"]')).not.toBeNull();
  });

  it("renders the solid navbar above other screens", () => {
    const { container } = renderAt("/campaigns");
    const navs = container.querySelectorAll("nav[data-variant]");
    expect(navs).toHaveLength(1);
    expect(navs[0]).toHaveAttribute("data-variant", "solid");
  });
});
