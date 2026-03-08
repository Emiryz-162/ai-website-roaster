import { parseRoastJSON } from "@/lib/openai";

describe("parseRoastJSON", () => {
  it("should parse clean JSON response", () => {
    const json = JSON.stringify({
      headline: "Test",
      roast: "A roast",
      scores: { performance: 80, accessibility: 70, seo: 60 },
      issues: [],
      fixes: [],
      actionable_steps: [],
      confidence: "high",
    });

    const result = parseRoastJSON(json);
    expect(result.headline).toBe("Test");
    expect(result.scores.performance).toBe(80);
    expect(result.confidence).toBe("high");
  });

  it("should extract JSON from text with surrounding content", () => {
    const raw = `Here is the result:\n\n{"headline":"Extracted","roast":"Found it","scores":{"performance":50,"accessibility":50,"seo":50},"issues":[],"fixes":[],"actionable_steps":[],"confidence":"medium"}\n\nHope that helps!`;

    const result = parseRoastJSON(raw);
    expect(result.headline).toBe("Extracted");
    expect(result.confidence).toBe("medium");
  });

  it("should throw on response with no JSON", () => {
    expect(() => parseRoastJSON("No JSON here at all")).toThrow(
      "No JSON found in OpenAI response",
    );
  });

  it("should throw on malformed JSON", () => {
    expect(() => parseRoastJSON("{bad json}")).toThrow();
  });

  it("should handle nested braces in JSON", () => {
    const json = JSON.stringify({
      headline: "Nested",
      roast: "A { tricky } roast",
      scores: { performance: 90, accessibility: 85, seo: 75 },
      issues: [
        {
          title: "Test",
          description: "desc",
          severity: "low",
          evidence: "{ code }",
        },
      ],
      fixes: [],
      actionable_steps: [],
      confidence: "high",
    });

    const result = parseRoastJSON(`Some text ${json} more text`);
    expect(result.headline).toBe("Nested");
    expect(result.issues[0].evidence).toBe("{ code }");
  });
});
