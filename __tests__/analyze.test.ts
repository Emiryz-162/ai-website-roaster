import { analyzeWebsite, analyzeFromHTML } from "@/lib/analyze";

// Mock the fetcher module
jest.mock("@/lib/fetcher", () => ({
  fetchWebsite: jest.fn().mockResolvedValue({
    html: "<html><head><title>Test Page</title></head><body><h1>Hello</h1><img src='x.png'></body></html>",
    screenshot: "base64string",
    status: 200,
  }),
  FetcherError: class FetcherError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
      super(message);
      this.code = code;
      this.name = "FetcherError";
    }
  },
}));

// Mock the OpenAI module
jest.mock("@/lib/openai", () => ({
  generateRoast: jest.fn().mockResolvedValue({
    headline: "Test Headline",
    roast: "A witty roast",
    scores: { performance: 70, accessibility: 60, seo: 50 },
    issues: [
      {
        title: "Missing alt",
        description: "Image lacks alt text",
        severity: "high",
        evidence: "<img src='x.png'>",
      },
    ],
    fixes: [
      {
        issueTitle: "Missing alt",
        suggestion: "Add alt text",
        codeSnippet: '<img src="x.png" alt="description">',
      },
    ],
    actionable_steps: ["Add alt text to images"],
    confidence: "medium",
  }),
  parseRoastJSON: jest.fn(),
}));

describe("analyzeWebsite", () => {
  it("should return a complete analysis result for a valid URL", async () => {
    const result = await analyzeWebsite("https://example.com");
    expect(result).toHaveProperty("roast");
    expect(result).toHaveProperty("screenshot");
    expect(result).toHaveProperty("url", "https://example.com");
    expect(result).toHaveProperty("timestamp");
    expect(result.roast.headline).toBe("Test Headline");
    expect(result.roast.issues).toHaveLength(1);
  });

  it("should reject invalid protocols", async () => {
    await expect(analyzeWebsite("ftp://example.com")).rejects.toThrow(
      "Only HTTP/HTTPS URLs are supported",
    );
  });

  it("should reject malformed URLs", async () => {
    await expect(analyzeWebsite("not-a-url")).rejects.toThrow();
  });
});

describe("analyzeFromHTML", () => {
  it("should return analysis result with null screenshot", async () => {
    const result = await analyzeFromHTML(
      "<html><body><h1>Test</h1></body></html>",
      "https://example.com",
    );
    expect(result.screenshot).toBeNull();
    expect(result.roast.headline).toBe("Test Headline");
    expect(result.url).toBe("https://example.com");
  });
});
