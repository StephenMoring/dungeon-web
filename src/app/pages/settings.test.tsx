import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { Settings } from "./settings";

beforeAll(() => {
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", NoopResizeObserver);
});

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<p>Dashboard page</p>} />
        <Route path="/" element={<p>Landing page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Settings", () => {
  it("names each slider on the element that has the slider role", () => {
    renderSettings();
    expect(screen.getByRole("slider", { name: "Master Volume" })).toHaveAttribute("aria-valuenow", "80");
    expect(screen.getByRole("slider", { name: "Creativity Level" })).toHaveAttribute("aria-valuenow", "70");
  });

  it("shows only the gold outline on a focused switch, no ring", () => {
    renderSettings();
    for (const toggle of screen.getAllByRole("switch")) {
      expect(toggle).toHaveClass("focus-visible:outline-gold", "focus-visible:ring-0");
      expect(toggle).not.toHaveClass("focus-visible:ring-[3px]");
    }
  });

  it("goes back to the dashboard on Cancel", async () => {
    renderSettings();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Dashboard page")).toBeInTheDocument();
  });
});
