// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAIAssistant } from "../../../hooks/useAIAssistant";

interface AITaskBreakdownProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
}

interface TaskBreakdown {
  steps: string[];
  estimatedTime: string;
  dependencies: string[];
  resources: string[];
}

export const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({
  taskId,
  taskTitle,
  taskDescription = "",
}) => {
  const { aiResponse, isLoading, error, generateAIResponse } = useAIAssistant();
  const [breakdown, setBreakdown] = useState<TaskBreakdown | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    steps: true,
    dependencies: true,
    resources: true,
  });

  useEffect(() => {
    if (taskId) {
      const prompt = `Break down this task into actionable steps:\n\nTitle: ${taskTitle}\nDescription: ${taskDescription}\n\nPlease provide:\n1. Step-by-step breakdown\n2. Estimated time for completion\n3. Any dependencies or prerequisites\n4. Helpful resources or tools needed`;
      generateAIResponse(prompt);
    }
  }, [taskId, taskTitle, taskDescription, generateAIResponse]);

  useEffect(() => {
    if (aiResponse) {
      try {
        // Parse AI response into structured breakdown
        const parsedBreakdown: TaskBreakdown = {
          steps: aiResponse
            .split("\n")
            .filter((line) => line.startsWith("- "))
            .map((line) => line.substring(2)),
          estimatedTime: "2-4 hours",
          dependencies: [],
          resources: [],
        };
        setBreakdown(parsedBreakdown);
      } catch (e) {
        console.error("Failed to parse AI breakdown:", e);
      }
    }
  }, [aiResponse]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading && !breakdown) {
    return (
      <div className="ai-breakdown-loading">
        Analyzing task and generating breakdown...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-breakdown-error">
        Error generating task breakdown: {error}
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="ai-breakdown-empty">No task breakdown available</div>
    );
  }

  return (
    <div className="ai-task-breakdown">
      <h3 className="breakdown-title">AI Task Breakdown</h3>

      <div className="breakdown-section">
        <div className="section-header" onClick={() => toggleSection("steps")}>
          <span>Actionable Steps ({breakdown.steps.length})</span>
          <span className="toggle-icon">
            {expandedSections.steps ? "−" : "+"}
          </span>
        </div>

        {expandedSections.steps && (
          <ol className="steps-list">
            {breakdown.steps.map((step, index) => (
              <li key={index} className="step-item">
                <span className="step-number">{index + 1}.</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="breakdown-section">
        <div
          className="section-header"
          onClick={() => toggleSection("dependencies")}
        >
          <span>Dependencies</span>
          <span className="toggle-icon">
            {expandedSections.dependencies ? "−" : "+"}
          </span>
        </div>

        {expandedSections.dependencies &&
          (breakdown.dependencies.length > 0 ? (
            <ul className="dependencies-list">
              {breakdown.dependencies.map((dep, index) => (
                <li key={index} className="dependency-item">
                  {dep}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-dependencies">No dependencies identified</div>
          ))}
      </div>

      <div className="breakdown-section">
        <div
          className="section-header"
          onClick={() => toggleSection("resources")}
        >
          <span>Helpful Resources</span>
          <span className="toggle-icon">
            {expandedSections.resources ? "−" : "+"}
          </span>
        </div>

        {expandedSections.resources &&
          (breakdown.resources.length > 0 ? (
            <ul className="resources-list">
              {breakdown.resources.map((resource, index) => (
                <li key={index} className="resource-item">
                  {resource}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-resources">No specific resources needed</div>
          ))}
      </div>

      <div className="breakdown-footer">
        <div className="estimated-time">
          <strong>Estimated Time:</strong> {breakdown.estimatedTime}
        </div>
      </div>
    </div>
  );
};
