import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { Roll } from "@/app/api/turn-stream";
import { RollCard } from "./roll-card";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("motion/react", async (importActual) => {
  const actual = await importActual<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => reducedMotion.value };
});

const FAIL: Roll = {
  stat: "agility",
  stat_value: 6,
  roll: 7,
  total: 13,
  difficulty: "hard",
  target: 20,
  success: false,
  reason: "sneak",
};

describe("RollCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reducedMotion.value = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the arithmetic and outcome once settled", () => {
    const onSettled = vi.fn();
    render(<RollCard roll={FAIL} animate onSettled={onSettled} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Agility check · Hard · 7 + 6 = 13 vs 20 · Failure")).toBeInTheDocument();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("does not reveal the outcome while rolling", () => {
    render(<RollCard roll={FAIL} animate />);

    expect(screen.queryByText(/Failure/)).not.toBeInTheDocument();
  });

  it("settles immediately under reduced motion", () => {
    reducedMotion.value = true;
    const onSettled = vi.fn();
    render(<RollCard roll={FAIL} animate onSettled={onSettled} />);

    expect(screen.getByText(/· Failure$/)).toBeInTheDocument();
    expect(onSettled).toHaveBeenCalledTimes(1);
  });

  it("labels success", () => {
    render(<RollCard roll={{ ...FAIL, roll: 16, total: 22, success: true }} animate={false} />);

    expect(screen.getByText("Agility check · Hard · 16 + 6 = 22 vs 20 · Success")).toBeInTheDocument();
  });
});
