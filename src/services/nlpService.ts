import {
  parseDateFromText,
  extractPriority,
  extractLabels,
  extractProject,
} from "../utils/nlpUtils";
import { matchPatterns } from "../utils/nlpPatternUtils";

interface ParsedTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
  rawText: string;
  confidence: number;
}

interface NlpServiceOptions {
  debug?: boolean;
  strictMode?: boolean;
}

export class NlpService {
  private options: NlpServiceOptions;

  constructor(options: NlpServiceOptions = {}) {
    this.options = {
      debug: false,
      strictMode: false,
      ...options,
    };
  }

  async parseNaturalLanguage(text: string): Promise<ParsedTaskData> {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input text");
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("Empty input text");
    }

    if (this.options.debug) {
      console.log("NLP Service - Input text:", trimmedText);
    }

    // Extract basic task information
    const title = this.extractTitle(trimmedText);
    const description = this.extractDescription(trimmedText, title);

    // Use pattern matching for structured extraction
    const patternResults = matchPatterns(trimmedText);

    // Extract specific fields using utilities
    const dueDate = parseDateFromText(trimmedText) || patternResults.dueDate;
    const priority = extractPriority(trimmedText) || patternResults.priority;
    const labels = extractLabels(trimmedText) || patternResults.labels;
    const project = extractProject(trimmedText) || patternResults.project;

    // Calculate confidence score
    const confidence = this.calculateConfidence({
      title,
      description,
      dueDate,
      priority,
      labels,
      project,
    });

    const result: ParsedTaskData = {
      title,
      description,
      dueDate,
      priority,
      labels,
      project,
      rawText: trimmedText,
      confidence,
    };

    if (this.options.debug) {
      console.log("NLP Service - Parsed result:", result);
    }

    return result;
  }

  private extractTitle(text: string): string {
    // Try to extract title from common patterns
    const titlePatterns = [
      /^(create|add|make|schedule|set up|remind me)\s+(?:a|an|the)?\s+(.+?)(?:\s+(?:by|due|on|at|for|with|to)|$)/i,
      /^(?:task|reminder|event|meeting|appointment):\s*(.+)/i,
      /^(.+?)(?:\s+(?:by|due|on|at|for|with|to)|$)/i,
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: use first sentence or first 50 characters
    const firstSentence = text.split(/[.!?]/)[0] || text;
    return firstSentence.substring(0, 50).trim();
  }

  private extractDescription(text: string, title: string): string | undefined {
    // Remove title from text
    const textWithoutTitle = text
      .replace(new RegExp(escapeRegExp(title), "i"), "")
      .trim();

    // If there's remaining text after removing title, use it as description
    if (textWithoutTitle && textWithoutTitle.length > 0) {
      return textWithoutTitle.trim();
    }

    return undefined;
  }

  private calculateConfidence(
    parsedData: Omit<ParsedTaskData, "rawText" | "confidence">,
  ): number {
    let confidence = 50; // Base confidence

    // Increase confidence for each successfully parsed field
    if (parsedData.title) confidence += 10;
    if (parsedData.description) confidence += 5;
    if (parsedData.dueDate) confidence += 15;
    if (parsedData.priority) confidence += 10;
    if (parsedData.labels && parsedData.labels.length > 0) confidence += 5;
    if (parsedData.project) confidence += 5;

    // Cap at 100%
    return Math.min(100, confidence);
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const nlpService = new NlpService();
