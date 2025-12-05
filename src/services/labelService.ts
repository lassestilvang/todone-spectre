import { Label, LabelModel } from "../types/models";
import { Result, AsyncResult } from "../types/common";

/**
 * Label Service
 * Provides CRUD operations for labels
 */
class LabelService {
  private labels: Label[] = [];
  private storageKey = "todone_labels";

  constructor() {
    this.loadLabels();
  }

  /**
   * Load labels from localStorage
   */
  private loadLabels(): void {
    try {
      const savedLabels = localStorage.getItem(this.storageKey);
      if (savedLabels) {
        const parsedLabels = JSON.parse(savedLabels);
        this.labels = parsedLabels.map((label: any) => new LabelModel(label));
      }
    } catch (error) {
      console.error("Failed to load labels:", error);
    }
  }

  /**
   * Save labels to localStorage
   */
  private saveLabels(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.labels));
    } catch (error) {
      console.error("Failed to save labels:", error);
    }
  }

  /**
   * Get all labels
   */
  getAllLabels(): AsyncResult<Label[]> {
    return Promise.resolve({
      success: true,
      data: [...this.labels],
    });
  }

  /**
   * Get label by ID
   */
  getLabelById(id: string): AsyncResult<Label | null> {
    const label = this.labels.find((l) => l.id === id);
    return Promise.resolve({
      success: true,
      data: label ? { ...label } : null,
    });
  }

  /**
   * Create new label
   */
  createLabel(labelData: Partial<Label>): AsyncResult<Label> {
    try {
      const newLabel = new LabelModel(labelData);
      this.labels.push(newLabel);
      this.saveLabels();
      return Promise.resolve({
        success: true,
        data: { ...newLabel },
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to create label"),
      });
    }
  }

  /**
   * Update existing label
   */
  updateLabel(id: string, labelData: Partial<Label>): AsyncResult<Label> {
    try {
      const index = this.labels.findIndex((l) => l.id === id);
      if (index === -1) {
        throw new Error("Label not found");
      }

      const updatedLabel = new LabelModel({
        ...this.labels[index],
        ...labelData,
      });

      this.labels[index] = updatedLabel;
      this.saveLabels();

      return Promise.resolve({
        success: true,
        data: { ...updatedLabel },
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to update label"),
      });
    }
  }

  /**
   * Delete label
   */
  deleteLabel(id: string): AsyncResult<boolean> {
    try {
      const initialLength = this.labels.length;
      this.labels = this.labels.filter((l) => l.id !== id);

      if (this.labels.length === initialLength) {
        throw new Error("Label not found");
      }

      this.saveLabels();
      return Promise.resolve({
        success: true,
        data: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to delete label"),
      });
    }
  }

  /**
   * Search labels by name
   */
  searchLabels(query: string): AsyncResult<Label[]> {
    try {
      const results = this.labels.filter((label) =>
        label.name.toLowerCase().includes(query.toLowerCase()),
      );

      return Promise.resolve({
        success: true,
        data: [...results],
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to search labels"),
      });
    }
  }

  /**
   * Get personal labels
   */
  getPersonalLabels(): AsyncResult<Label[]> {
    try {
      const personalLabels = this.labels.filter((label) => label.isPersonal);
      return Promise.resolve({
        success: true,
        data: [...personalLabels],
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get personal labels"),
      });
    }
  }

  /**
   * Get shared labels
   */
  getSharedLabels(): AsyncResult<Label[]> {
    try {
      const sharedLabels = this.labels.filter((label) => !label.isPersonal);
      return Promise.resolve({
        success: true,
        data: [...sharedLabels],
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get shared labels"),
      });
    }
  }

  /**
   * Clear all labels
   */
  clearAllLabels(): AsyncResult<boolean> {
    try {
      this.labels = [];
      this.saveLabels();
      return Promise.resolve({
        success: true,
        data: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to clear labels"),
      });
    }
  }
}

// Singleton instance
const labelService = new LabelService();
export default labelService;
