interface PatternMatchResult {
  dueDate?: string;
  priority?: string;
  labels?: string[];
  project?: string;
}

/**
 * Pattern matching for natural language parsing
 */
export function matchPatterns(text: string): PatternMatchResult {
  if (!text) return {};

  const result: PatternMatchResult = {};

  // Date patterns
  const datePatterns = [
    {
      regex: /(?:on|by|due|for)\s+(?:the\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)[^,]*(?:,?\s+\d{4})?/i,
      extract: (match: RegExpMatchArray) => match[0].trim()
    },
    {
      regex: /(?:on|by|due|for)\s+(?:the\s+)?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      extract: (match: RegExpMatchArray) => match[1]
    },
    {
      regex: /(?:today|tomorrow|yesterday|next\s+(?:week|month|year)|this\s+(?:week|month|year))/i,
      extract: (match: RegExpMatchArray) => match[0].trim()
    }
  ];

  // Priority patterns
  const priorityPatterns = [
    {
      regex: /\b(high|urgent|important|critical|asap)\b/i,
      priority: 'high'
    },
    {
      regex: /\b(medium|normal|standard|regular)\b/i,
      priority: 'medium'
    },
    {
      regex: /\b(low|minor|trivial|whenever|sometime)\b/i,
      priority: 'low'
    }
  ];

  // Label patterns
  const labelPatterns = [
    {
      regex: /#(\w+)/g,
      extract: (match: RegExpMatchArray) => match[1].toLowerCase()
    },
    {
      regex: /(?:label|tag|category):\s*([^\s,;]+)/gi,
      extract: (match: RegExpMatchArray) => match[1].toLowerCase()
    }
  ];

  // Project patterns
  const projectPatterns = [
    {
      regex: /(?:project|for|in):\s*([^\s,;]+)/i,
      extract: (match: RegExpMatchArray) => match[1].trim()
    },
    {
      regex: /(?:for\s+the\s+)?(?:project|task|work)\s+([^\s,;]+)/i,
      extract: (match: RegExpMatchArray) => match[1].trim()
    }
  ];

  // Match dates
  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      result.dueDate = pattern.extract(match);
      break;
    }
  }

  // Match priority
  for (const pattern of priorityPatterns) {
    if (pattern.regex.test(text)) {
      result.priority = pattern.priority;
      break;
    }
  }

  // Match labels
  const labels = new Set<string>();
  for (const pattern of labelPatterns) {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(text)) !== null) {
      labels.add(pattern.extract(match));
    }
  }
  if (labels.size > 0) {
    result.labels = Array.from(labels);
  }

  // Match project
  for (const pattern of projectPatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      result.project = pattern.extract(match);
      break;
    }
  }

  return result;
}

/**
 * Enhanced pattern matching with context
 */
export function matchPatternsWithContext(text: string, context: any = {}): PatternMatchResult {
  const basicResult = matchPatterns(text);

  // Apply context-based enhancements
  if (context.defaultPriority && !basicResult.priority) {
    basicResult.priority = context.defaultPriority;
  }

  if (context.defaultProject && !basicResult.project) {
    basicResult.project = context.defaultProject;
  }

  return basicResult;
}

/**
 * Pattern-based text classification
 */
export function classifyTextPattern(text: string): string {
  if (!text) return 'unknown';

  const patterns = [
    {
      regex: /\b(create|add|make|schedule|set up|remind me)\b.*\b(task|reminder|event|meeting|appointment)\b/i,
      type: 'task_creation'
    },
    {
      regex: /\b(update|modify|change|edit|revise)\b.*\b(task|reminder|event)\b/i,
      type: 'task_update'
    },
    {
      regex: /\b(delete|remove|cancel|complete|finish)\b.*\b(task|reminder|event)\b/i,
      type: 'task_deletion'
    },
    {
      regex: /\b(show|list|display|view)\b.*\b(tasks|reminders|events|schedule)\b/i,
      type: 'task_query'
    }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      return pattern.type;
    }
  }

  return 'unknown';
}