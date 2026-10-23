import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { HeroesSection } from "./heroes-section";

beforeAll(() => {
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

function markedParts(container: HTMLElement) {
  return [...container.querySelectorAll('[data-active="true"]')].map((el) => el.getAttribute("data-part"));
}

describe("HeroesSection margin notes", () => {
  it("keeps a note's part marked when the focused note is clicked or activated by key", () => {
    const { container } = render(<HeroesSection />);
    const note = screen.getByRole("button", { name: /^Wounds/ });

    fireEvent.mouseEnter(note);
    fireEvent.focus(note);
    fireEvent.click(note);
    expect(markedParts(container)).toEqual(["wounds"]);

    // Enter/Space on a focused button fires click; the mark must stay.
    fireEvent.click(note);
    expect(markedParts(container)).toEqual(["wounds"]);
    expect(note).not.toHaveAttribute("aria-pressed");
  });

  it("clears the mark when the note loses focus", () => {
    const { container } = render(<HeroesSection />);
    const note = screen.getByRole("button", { name: /^Wounds/ });
    fireEvent.focus(note);
    fireEvent.blur(note);
    expect(markedParts(container)).toEqual([]);
  });
});
