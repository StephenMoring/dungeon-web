import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { RestOverlay } from "./rest-overlay";

const combatApi = vi.hoisted(() => ({ finishRest: vi.fn() }));
vi.mock("@/app/api/combat", () => combatApi);

const REST = { started_at: "", ready_at: "", seconds: 20, seconds_left: 20 };
const HEALED = { id: 1, current_hp: 20, max_hp: 20 };

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe("RestOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    combatApi.finishRest.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it("can't finish before the fire has burned for the whole rest", async () => {
    combatApi.finishRest.mockResolvedValue(HEALED);
    const onRested = vi.fn();
    render(<RestOverlay characterId={1} rest={REST} onRested={onRested} onFailed={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Resting by the fire" })).toBeInTheDocument();
    await advance(19_000);
    expect(combatApi.finishRest).not.toHaveBeenCalled();
    expect(screen.getByText("1s")).toBeInTheDocument();

    await advance(1_500);
    expect(combatApi.finishRest).toHaveBeenCalledWith(1);
    expect(onRested).toHaveBeenCalledWith(HEALED);
  });

  it("resumes with the time the server says is left", async () => {
    combatApi.finishRest.mockResolvedValue(HEALED);
    render(<RestOverlay characterId={1} rest={{ ...REST, seconds_left: 5 }} onRested={vi.fn()} onFailed={vi.fn()} />);

    await advance(5_500);
    expect(combatApi.finishRest).toHaveBeenCalledTimes(1);
  });

  it("asks again when the server says it's a moment too early", async () => {
    combatApi.finishRest.mockRejectedValueOnce(new Error("The fire needs 1 more seconds.")).mockResolvedValue(HEALED);
    const onRested = vi.fn();
    render(<RestOverlay characterId={1} rest={{ ...REST, seconds_left: 1 }} onRested={onRested} onFailed={vi.fn()} />);

    await advance(1_500);
    await advance(1_000);
    expect(combatApi.finishRest).toHaveBeenCalledTimes(2);
    expect(onRested).toHaveBeenCalledWith(HEALED);
  });

  it("gives up after a few refusals", async () => {
    combatApi.finishRest.mockRejectedValue(new Error("You aren't resting."));
    const onFailed = vi.fn();
    render(<RestOverlay characterId={1} rest={{ ...REST, seconds_left: 1 }} onRested={vi.fn()} onFailed={onFailed} />);

    await advance(10_000);
    expect(onFailed).toHaveBeenCalledWith("You aren't resting.");
  });
});
