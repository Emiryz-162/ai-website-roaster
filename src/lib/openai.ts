import OpenAI from "openai";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

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

// Language name mapping for OpenAI prompt instruction
const LANGUAGE_NAMES: Record<string, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  es: { label: "Spanish", native: "Espa\u00f1ol" },
  zh: { label: "Chinese", native: "\u4E2D\u6587" },
  hi: { label: "Hindi", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  ar: { label: "Arabic", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  pt: { label: "Portuguese", native: "Portugu\u00EAs" },
  bn: { label: "Bengali", native: "\u09AC\u09BE\u0982\u09B2\u09BE" },
  ru: { label: "Russian", native: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
  ja: { label: "Japanese", native: "\u65E5\u672C\u8A9E" },
  tr: { label: "Turkish", native: "T\u00FCrk\u00E7e" },
};

export async function generateRoast(
  analysisJSON: string,
  model: string = "gpt-4o-mini",
  language: string = "en",
): Promise<RoastResponse> {
  let userMessage = `Here is the analysis object: ${analysisJSON}. Produce the JSON response described above. Keep roast witty but constructive. Provide short code suggestions for fixes when relevant. Max tokens 800. Temperature 0.3.`;

  // Add language instruction for non-English responses
  if (language !== "en" && LANGUAGE_NAMES[language]) {
    const { label, native } = LANGUAGE_NAMES[language];
    userMessage += `\n\nIMPORTANT: The entire response (headline, roast, descriptions, suggestions, actionable_steps) MUST be written in ${label} (${native}). Keep JSON keys in English.`;
  }

  try {
    const completion = await getClient().chat.completions.create({
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
      return generateRoast(analysisJSON, "gpt-4o", language);
    }
    throw err;
  }
}
