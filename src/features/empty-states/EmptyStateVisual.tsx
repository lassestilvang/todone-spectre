import React from "react";
import { EmptyStateConfig } from "../../../types/emptyStateTypes";

interface EmptyStateVisualProps {
  config: EmptyStateConfig;
  className?: string;
  animation?: "fade" | "slide" | "none";
}

export const EmptyStateVisual: React.FC<EmptyStateVisualProps> = ({
  config,
  className = "",
  animation = "fade",
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case "fade":
        return "animate-fade-in";
      case "slide":
        return "animate-slide-up";
      case "none":
      default:
        return "";
    }
  };

  return (
    <div className={`empty-state-visual ${className} ${getAnimationClass()}`}>
      <div className="visual-container">
        {config.icon && <div className="visual-icon">{config.icon}</div>}

        <div className="visual-content">
          <h2 className="visual-title">{config.title}</h2>
          <p className="visual-description">{config.description}</p>
        </div>

        {config.actions && (
          <div className="visual-actions">{config.actions}</div>
        )}
      </div>

      <style jsx>{`
        .empty-state-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 2rem;
          text-align: center;
        }

        .visual-container {
          max-width: 500px;
          width: 100%;
        }

        .visual-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .visual-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .visual-description {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .visual-actions {
          margin-top: 1rem;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
