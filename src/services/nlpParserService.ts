import { nlpService } from "./nlpService";

interface ParseResult {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence?: number;
}

interface NlpParserOptions {
  debug?: boolean;
  strictMode?: boolean;
  fallbackToBasic?: boolean;
}

export class NlpParserService {
  private options: NlpParserOptions;

  constructor(options: NlpParserOptions = {}) {
    this.options = {
      debug: false,
      strictMode: false,
      fallbackToBasic: true,
      ...options,
    };
  }

  async parse(text: string): Promise<ParseResult> {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input text for NLP parser");
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("Empty input text for NLP parser");
    }

    try {
      // Use the main NLP service for parsing
      const result = await nlpService.parseNaturalLanguage(trimmedText);

      // Apply strict mode validation if enabled
      if (this.options.strictMode) {
        this.validateResult(result);
      }

      return this.normalizeResult(result);
    } catch (error) {
      if (this.options.debug) {
        console.error("NLP Parser Service error:", error);
      }

      // Fallback to basic parsing if enabled
      if (this.options.fallbackToBasic) {
        return this.basicFallbackParse(trimmedText);
      }

      throw error;
    }
  }

  private validateResult(result: ParseResult): void {
    if (!result.title) {
      throw new Error("No title extracted from text");
    }

    if (result.confidence && result.confidence < 30) {
      throw new Error("Parsing confidence too low");
    }
  }

  private normalizeResult(result: ParseResult): ParseResult {
    return {
      title: result.title || "Untitled Task",
      description: result.description || "",
      dueDate: result.dueDate || undefined,
      priority: result.priority || "medium",
      labels: result.labels || [],
      project: result.project || undefined,
      rawText: result.rawText,
      confidence: result.confidence || 0,
    };
  }

  private basicFallbackParse(text: string): ParseResult {
    // Simple fallback parser when main service fails
    const firstSentence = text.split(/[.!?]/)[0] || text;
    const title = firstSentence.substring(0, 50).trim();
    const description =
      text.length > title.length ? text.substring(title.length).trim() : "";

    return {
      title,
      description: description || undefined,
      rawText: text,
      confidence: 20,
      priority: "medium",
    };
  }

  async parseBatch(texts: string[]): Promise<ParseResult[]> {
    return Promise.all(texts.map((text) => this.parse(text)));
  }

  async parseWithContext(text: string, context: any): Promise<ParseResult> {
    // Enhanced parsing with additional context
    const result = await this.parse(text);

    // Apply context-based enhancements
    if (context?.defaultProject) {
      result.project = result.project || context.defaultProject;
    }

    if (context?.defaultPriority) {
      result.priority = result.priority || context.defaultPriority;
    }

    return result;
  }
}

export const nlpParserService = new NlpParserService();
