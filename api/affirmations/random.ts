import type { IncomingMessage, ServerResponse } from "node:http";
import { chooseAffirmation } from "../../lib/affirmations/src/index";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }
  try {
    const affirmation = chooseAffirmation();
    res.statusCode = 200;
    res.end(req.method === "HEAD" ? undefined : JSON.stringify(affirmation));
  } catch {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: "The affirmation machine needs a little care. Please try again later." }));
  }
}