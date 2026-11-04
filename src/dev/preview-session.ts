import {
  PREVIEW_CAMPAIGNS,
  PREVIEW_CHARACTERS,
  PREVIEW_CLASSES,
  PREVIEW_RACES,
  PREVIEW_TURN_STREAM,
  PREVIEW_TURNS,
} from "./fixtures";

export function isPreviewRequested(search: string): boolean {
  return new URLSearchParams(search).get("preview") === "1";
}

const PREVIEW_USER = { id: 0, username: "Aldric", avatar_url: "" };

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function stubResponse(path: string, method: string): Response | null {
  if (method === "GET") {
    if (path === "/api/auth/me") return json(PREVIEW_USER);
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
    const oneCharacter = path.match(/^\/api\/characters\/(\d+)$/);
    if (oneCharacter) {
      const match = PREVIEW_CHARACTERS.find((c) => c.character.id === Number(oneCharacter[1]));
      if (match) return json(match.character);
    }
  }
  if (method === "POST" && path === "/api/auth/logout") return new Response(null, { status: 204 });
  if (method === "POST" && /^\/api\/characters\/\d+\/turns\/stream$/.test(path)) {
    return new Response(PREVIEW_TURN_STREAM, { status: 200, headers: { "Content-Type": "text/event-stream" } });
  }
  return null;
}

// The session is an httpOnly cookie the page can't fake, so preview stubs /auth/me
// to say "signed in" instead, for as long as the page stays in preview mode.
export function startPreviewSession(): void {

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
