import {
  PREVIEW_CAMPAIGNS,
  PREVIEW_CHARACTERS,
  PREVIEW_CLASSES,
  PREVIEW_RACES,
  PREVIEW_TURNS,
} from "./fixtures";

export function isPreviewRequested(search: string): boolean {
  return new URLSearchParams(search).get("preview") === "1";
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function stubResponse(path: string, method: string): Response | null {
  if (method === "GET") {
    if (path === "/api/characters/") return json(PREVIEW_CHARACTERS);
    if (path === "/api/campaigns/") return json(PREVIEW_CAMPAIGNS);
    if (path === "/api/characters/classes") return json(PREVIEW_CLASSES);
    if (path === "/api/characters/races") return json(PREVIEW_RACES);
    const campaignChars = path.match(/^\/api\/campaigns\/(\d+)\/characters$/);
    if (campaignChars) {
      const campaignId = Number(campaignChars[1]);
      const match = PREVIEW_CHARACTERS.find((c) => c.character.campaign_id === campaignId);
      return json(match?.character.id != null ? [{ id: match.character.id }] : []);
    }
    if (/^\/api\/characters\/\d+\/turns$/.test(path)) return json(PREVIEW_TURNS);
  }
  if (method === "POST" && /^\/api\/characters\/\d+\/turns$/.test(path)) {
    return json({ message: "The tower window goes dark. Something below the courtyard stones begins to knock." });
  }
  return null;
}

// Visiting ?preview=1 leaves the fake JWT in localStorage; logging out clears it.
export function startPreviewSession(): void {
  localStorage.setItem("dungeon_jwt", "preview");
  localStorage.setItem(
    "dungeon_user",
    JSON.stringify({ id: "preview", username: "Aldric", avatar: null, email: null }),
  );

  const realFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = input instanceof Request ? input : null;
    const raw = request ? request.url : input.toString();
    const method = (init?.method ?? request?.method ?? "GET").toUpperCase();
    const path = new URL(raw, window.location.origin).pathname;
    const stub = stubResponse(path, method);
    return stub ? Promise.resolve(stub) : realFetch(input, init);
  };
}
