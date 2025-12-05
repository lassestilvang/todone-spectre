import { parse, isValid, format } from "date-fns";

/**
 * Extracts date information from text using various date patterns
 */
export function parseDateFromText(text: string): string | undefined {
  if (!text) return undefined;

  // Common date patterns
  const datePatterns = [
    // Full date formats
    /(?:on|by|due|for)\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)[^,]*(?:,?\s+\d{4})?)/i,
    /(?:on|by|due|for)\s+(?:the\s+)?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /(?:on|by|due|for)\s+(?:the\s+)?(\d{4}[/-]\d{1,2}[/-]\d{1,2})/i,

    // Relative dates
    /(?:today|tomorrow|yesterday|next\s+(?:week|month|year)|this\s+(?:week|month|year))/i,
    /(?:in|after)\s+(\d+)\s+(?:day|week|month|year)s?/i,
    /(?:next|last)\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,

    // Time patterns
    /(?:at|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,

    // Combined date and time
    /(?:on|by|due|for)\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)[^,]*(?:,?\s+\d{4})?\s+(?:at|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))/i,
  ];

  // Try to find date patterns
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // For now, return the matched text - in a real app, this would be parsed to a proper date
      return match[0].trim();
    }
  }

  // Try to parse common date formats
  const commonFormats = [
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd-MM-yyyy",
    "MMMM d, yyyy",
    "MMM d, yyyy",
    "d MMMM yyyy",
    "EEEE, MMMM d, yyyy",
  ];

  for (const dateFormat of commonFormats) {
    const parsedDate = parse(text, dateFormat, new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, "MMMM d, yyyy");
    }
  }

  return undefined;
}

/**
 * Extracts priority from text
 */
export function extractPriority(text: string): string | undefined {
  if (!text) return undefined;

  const priorityKeywords = {
    high: [
      "high",
      "urgent",
      "important",
      "critical",
      "asap",
      "priority",
      "top",
    ],
    medium: ["medium", "normal", "standard", "regular"],
    low: ["low", "minor", "trivial", "whenever", "sometime"],
  };

  const textLower = text.toLowerCase();

  for (const [priority, keywords] of Object.entries(priorityKeywords)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        return priority;
      }
    }
  }

  return undefined;
}

/**
 * Extracts labels from text
 */
export function extractLabels(text: string): string[] | undefined {
  if (!text) return undefined;

  // Common label patterns
  const labelPatterns = [
    // Hash tags
    /#(\w+)/g,
    // Label keywords
    /(?:label|tag|category|type):\s*([^\s,;]+)/gi,
    // Common label words
    /(?:work|personal|home|office|important|urgent|meeting|call|email|document|research|study|shopping|errand|health|fitness|family|friends|social|finance|bills|travel|vacation|project|task|reminder|event|appointment)/gi,
  ];

  const labels = new Set<string>();

  for (const pattern of labelPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        // Clean up the label text
        const cleaned = match
          .replace(/^[#:]/, "")
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();

        if (cleaned.length > 2) {
          // Minimum label length
          labels.add(cleaned);
        }
      });
    }
  }

  return labels.size > 0 ? Array.from(labels) : undefined;
}

/**
 * Extracts project from text
 */
export function extractProject(text: string): string | undefined {
  if (!text) return undefined;

  // Project patterns
  const projectPatterns = [
    // Explicit project mentions
    /(?:project|for|in):\s*([^\s,;]+)/i,
    // Common project prefixes
    /(?:for\s+the\s+)?(?:project|task|work)\s+([^\s,;]+)/i,
    // Team/project names
    /(?:team|group|department|division)\s+([^\s,;]+)/i,
  ];

  for (const pattern of projectPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Cleans and normalizes text for parsing
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/[.,;:!?]+/g, " ") // Remove excessive punctuation
    .toLowerCase(); // Normalize case
}
