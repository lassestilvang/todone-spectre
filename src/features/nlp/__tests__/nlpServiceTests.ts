// @ts-nocheck
import { NlpService } from "../../../services/nlpService";
import { NlpParserService } from "../../../services/nlpParserService";
import { generateTestParseData, MockNlpParserService } from "./nlpTestUtils";

describe("NlpService", () => {
  let service: NlpService;

  beforeEach(() => {
    service = new NlpService({ debug: false });
  });

  describe("parseNaturalLanguage", () => {
    it("should throw error for empty input", async () => {
      await expect(service.parseNaturalLanguage("")).rejects.toThrow(
        "Empty input text",
      );
    });

    it("should throw error for invalid input", async () => {
      await expect(service.parseNaturalLanguage(null as any)).rejects.toThrow(
        "Invalid input text",
      );
    });

    it("should parse valid text and return structured data", async () => {
      const testText =
        "Create a high priority task to finish the project by Friday";
      const result = await service.parseNaturalLanguage(testText);

      expect(result).toBeDefined();
      expect(result.rawText).toBe(testText);
      expect(result.title).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe("title extraction", () => {
    it("should extract title from create patterns", async () => {
      const testText = "Create a task to finish the project proposal";
      const result = await service.parseNaturalLanguage(testText);

      expect(result.title).toContain("finish the project proposal");
    });

    it("should extract title from schedule patterns", async () => {
      const testText = "Schedule meeting with team tomorrow";
      const result = await service.parseNaturalLanguage(testText);

      expect(result.title).toContain("meeting with team");
    });
  });
});

describe("NlpParserService", () => {
  let service: NlpParserService;

  beforeEach(() => {
    service = new NlpParserService({ debug: false });
  });

  describe("parse", () => {
    it("should handle empty text with fallback", async () => {
      const mockService = new MockNlpParserService();
      const result = await mockService.parse("test text");

      expect(result).toBeDefined();
      expect(result.rawText).toBe("test text");
    });

    it("should apply context in parseWithContext", async () => {
      const mockService = new MockNlpParserService([
        {
          title: "Test task",
          project: "Default Project",
          rawText: "test",
          confidence: 80,
        },
      ]);

      const result = await mockService.parseWithContext("test", {
        defaultProject: "Context Project",
      });

      expect(result).toBeDefined();
      expect(result.title).toBe("Test task");
    });
  });

  describe("batch parsing", () => {
    it("should handle batch parsing", async () => {
      const mockService = new MockNlpParserService([
        generateTestParseData({ title: "Task 1" }),
        generateTestParseData({ title: "Task 2" }),
      ]);

      const texts = ["text1", "text2"];
      const results = await mockService.parseBatch(texts);

      expect(results.length).toBe(2);
      expect(results[0].title).toBe("Task 1");
      expect(results[1].title).toBe("Task 2");
    });
  });
});

describe("Integration Tests", () => {
  it("should integrate NlpService with NlpParserService", async () => {
    const nlpService = new NlpService();
    const parserService = new NlpParserService();

    const testText =
      "Create an important task for the marketing project due tomorrow";

    // Parse with base service
    const baseResult = await nlpService.parseNaturalLanguage(testText);

    // Parse with parser service
    const parserResult = await parserService.parse(testText);

    expect(baseResult.title).toBeDefined();
    expect(parserResult.title).toBeDefined();
  });
});
