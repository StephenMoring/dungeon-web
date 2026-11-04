import { describe, expect, it } from "vitest";
import { failureMessage } from "./http";

function response(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

describe("failureMessage", () => {
  it("passes on the server's message when a limit is hit", async () => {
    const message = await failureMessage(
      response(429, { detail: "You're going too fast. Try again in 40 seconds." }),
      "Failed to generate preview",
    );
    expect(message).toBe("You're going too fast. Try again in 40 seconds.");
  });

  it("keeps the page's own wording for other failures", async () => {
    const message = await failureMessage(response(502, { detail: "LLM returned invalid json" }), "Failed to generate preview");
    expect(message).toBe("Failed to generate preview: 502");
  });

  it("falls back when a 429 has no usable message", async () => {
    const message = await failureMessage(new Response("not json", { status: 429 }), "Failed to create campaign");
    expect(message).toBe("Failed to create campaign: 429");
  });
});
