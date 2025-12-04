import { Task } from '../types/taskTypes';

interface AIResponse {
  response: string;
  confidence: number;
  timestamp: Date;
}

interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.ai-service.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateAIResponse(prompt: string, options: AIRequestOptions = {}): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          model: options.model || 'gpt-4',
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 150
        })
      });

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.choices[0].text.trim(),
        confidence: data.confidence || 0.9,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async analyzeTaskComplexity(task: Task): Promise<{ complexityScore: number; complexityLevel: string }> {
    const prompt = `Analyze the complexity of this task:\n\nTitle: ${task.title}\nDescription: ${task.description || 'No description'}\n\nReturn a complexity score (0-100) and level (low, medium, high)`;

    const response = await this.generateAIResponse(prompt);

    // Parse the AI response to extract complexity information
    const complexityScore = this.extractComplexityScore(response.response);
    const complexityLevel = this.determineComplexityLevel(complexityScore);

    return { complexityScore, complexityLevel };
  }

  async generateTaskSuggestions(taskId: string, taskTitle: string, taskDescription?: string): Promise<string[]> {
    const prompt = `Generate 5 helpful suggestions for completing this task:\n\nTask ID: ${taskId}\nTitle: ${taskTitle}\nDescription: ${taskDescription || 'No description'}\n\nFormat each suggestion as a concise action item.`;

    const response = await this.generateAIResponse(prompt);

    // Parse suggestions from AI response
    return this.parseSuggestionsFromResponse(response.response);
  }

  async generateTaskBreakdown(task: Task): Promise<{
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
    resources: string[];
  }> {
    const prompt = `Break down this task into actionable components:\n\nTitle: ${task.title}\nDescription: ${task.description || 'No description'}\n\nProvide:\n1. Step-by-step instructions\n2. Estimated completion time\n3. Required dependencies\n4. Helpful resources`;

    const response = await this.generateAIResponse(prompt);
    return this.parseTaskBreakdown(response.response);
  }

  private extractComplexityScore(response: string): number {
    // Simple parsing logic - in real implementation would use more sophisticated parsing
    const scoreMatch = response.match(/score:\s*(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1], 10) : 50;
  }

  private determineComplexityLevel(score: number): string {
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  }

  private parseSuggestionsFromResponse(response: string): string[] {
    // Parse suggestions from AI response
    const lines = response.split('\n');
    return lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-\\•]\s*/, '').trim())
      .slice(0, 5);
  }

  private parseTaskBreakdown(response: string): {
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
    resources: string[];
  } {
    // Parse structured breakdown from AI response
    const steps: string[] = [];
    const dependencies: string[] = [];
    const resources: string[] = [];
    let estimatedTime = '2-4 hours';

    // Simple parsing - would be more sophisticated in real implementation
    const lines = response.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      if (line.toLowerCase().includes('steps') || line.toLowerCase().includes('instructions')) {
        currentSection = 'steps';
      } else if (line.toLowerCase().includes('dependencies') || line.toLowerCase().includes('prerequisites')) {
        currentSection = 'dependencies';
      } else if (line.toLowerCase().includes('resources') || line.toLowerCase().includes('tools')) {
        currentSection = 'resources';
      } else if (line.toLowerCase().includes('time') || line.toLowerCase().includes('duration')) {
        const timeMatch = line.match(/(\d+-\d+ hours|\d+ hours?|\d+ minutes?)/i);
        if (timeMatch) {
          estimatedTime = timeMatch[0];
        }
      } else if (currentSection && line.trim().startsWith('-')) {
        const item = line.replace(/^-\s*/, '').trim();
        if (currentSection === 'steps' && item) steps.push(item);
        if (currentSection === 'dependencies' && item) dependencies.push(item);
        if (currentSection === 'resources' && item) resources.push(item);
      }
    });

    return {
      steps: steps.length > 0 ? steps : ['Research task requirements', 'Plan implementation approach', 'Execute task', 'Review and test'],
      estimatedTime,
      dependencies: dependencies.length > 0 ? dependencies : [],
      resources: resources.length > 0 ? resources : ['Task management tools', 'Documentation resources']
    };
  }
}

// Singleton instance
const aiServiceInstance = new AIService(process.env.REACT_APP_AI_API_KEY || 'default-api-key');

export { AIService, aiServiceInstance as aiService };