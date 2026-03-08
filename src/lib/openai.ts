import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Verbatim prompt template as specified in requirements
const SYSTEM_MESSAGE = `You are a concise, witty, and constructive website UX/SEO/performance critic. Return ONLY valid JSON with the following fields:
{
  "headline": string,
  "roast": string,
  "scores": {"performance": number, "accessibility": number, "seo": number},
  "issues": [ {"title": string, "description": string, "severity": "low"|"medium"|"high", "evidence": string} ],
  "fixes": [ {"issueTitle": string, "suggestion": string, "codeSnippet": string|null } ],
  "actionable_steps": [string],
  "confidence": "low"|"medium"|"high"
}
Be concise. No extra commentary. If some scores are unknown, estimate conservatively.`;

// Example of a good issue+fix (for reference in code):
// Issue: { title: "Missing alt text", description: "12 images lack alt attributes", severity: "high", evidence: "<img src='hero.png'>" }
// Fix: { issueTitle: "Missing alt text", suggestion: "Add descriptive alt text to all images", codeSnippet: '<img src="hero.png" alt="Hero banner showing product features">' }

export interface RoastResponse {
  headline: string;
  roast: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
  };
  issues: Array<{
    title: string;
    description: string;
    severity: "low" | "medium" | "high";
    evidence: string;
  }>;
  fixes: Array<{
    issueTitle: string;
    suggestion: string;
    codeSnippet: string | null;
  }>;
  actionable_steps: string[];
  confidence: "low" | "medium" | "high";
}

export function parseRoastJSON(raw: string): RoastResponse {
  // Strip text before first { and after last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON found in OpenAI response");
  }
  const cleaned = raw.slice(start, end + 1);
  return JSON.parse(cleaned) as RoastResponse;
}

export async function generateRoast(
  analysisJSON: string,
  model: string = "gpt-4o-mini",
): Promise<RoastResponse> {
  const userMessage = `Here is the analysis object: ${analysisJSON}. Produce the JSON response described above. Keep roast witty but constructive. Provide short code suggestions for fixes when relevant. Max tokens 800. Temperature 0.3.`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    return parseRoastJSON(raw);
  } catch (err: unknown) {
    // Fallback to gpt-4o if gpt-4o-mini is unavailable
    if (model === "gpt-4o-mini" && (err as { status?: number }).status === 404) {
      return generateRoast(analysisJSON, "gpt-4o");
    }
    throw err;
  }
}
