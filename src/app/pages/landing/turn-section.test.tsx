import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TurnSection } from "./turn-section";

beforeAll(() => {
  // jsdom has no IntersectionObserver; motion's whileInView needs one to exist.
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", NoopObserver);
});

function renderTurn(onEnter = vi.fn()) {
  render(<TurnSection onEnter={onEnter} />);
  return { onEnter };
}

describe("TurnSection (the live turn)", () => {
  it("shows the first action and its written reply before any interaction", () => {
    renderTurn();
    expect(screen.getByRole("heading", { name: "What do you do?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your action")).toHaveValue("I step through the iron doors");
    expect(screen.getByText(/Twelve steps down/)).toBeInTheDocument();
  });

  it("answers a chosen action with its own reply and fills the line", async () => {
    renderTurn();
    fireEvent.click(screen.getByRole("button", { name: "I call back to the voice" }));
    expect(screen.getByLabelText("Your action")).toHaveValue("I call back to the voice");
    expect(await screen.findByText(/You are not my son/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I call back to the voice" })).toHaveAttribute("aria-pressed", "true");
  });

  it("says plainly that only the real Dungeon Master answers anything else", async () => {
    const { onEnter } = renderTurn();
    fireEvent.change(screen.getByLabelText("Your action"), { target: { value: "I sing to the ghost" } });
    fireEvent.click(screen.getByRole("button", { name: "Act" }));
    expect(await screen.findByText(/Only the real Dungeon Master answers that one/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Enter with Discord" }));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});
