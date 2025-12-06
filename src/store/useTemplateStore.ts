// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { TemplateState, Template, TemplateCategory } from "../types/store";
import {
  Template as TemplateType,
  TemplateCategory as TemplateCategoryType,
} from "../types/template";

export const useTemplateStore = create<TemplateState>()(
  devtools(
    persist(
      (set, get) => ({
        templates: [],
        categories: [],
        filteredTemplates: [],
        currentFilter: {},
        sortBy: "name",
        sortDirection: "asc",
        templateError: null,
        selectedTemplateIds: [],
        previewTemplate: undefined,

        // CRUD Operations for Templates
        addTemplate: (
          templateData: Omit<TemplateType, "id" | "createdAt" | "updatedAt">,
        ) => {
          const newTemplate: TemplateType = {
            ...templateData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
            rating: 0,
            isPublic: templateData.isPublic || false,
            variables: templateData.variables || {},
          };
          set((state) => ({
            templates: [...state.templates, newTemplate],
          }));
          get().applyTemplateFilters();
        },

        updateTemplate: (
          id: string,
          updates: Partial<Omit<TemplateType, "id" | "createdAt">>,
        ) => {
          set((state) => ({
            templates: state.templates.map((template) =>
              template.id === id
                ? {
                    ...template,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : template,
            ),
          }));
          get().applyTemplateFilters();
        },

        deleteTemplate: (id: string) => {
          set((state) => ({
            templates: state.templates.filter((template) => template.id !== id),
          }));
          get().applyTemplateFilters();
        },

        // CRUD Operations for Categories
        addCategory: (
          categoryData: Omit<
            TemplateCategoryType,
            "id" | "createdAt" | "updatedAt"
          >,
        ) => {
          const newCategory: TemplateCategoryType = {
            ...categoryData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            order: get().categories.length,
          };
          set((state) => ({
            categories: [...state.categories, newCategory],
          }));
        },

        updateCategory: (
          id: string,
          updates: Partial<Omit<TemplateCategoryType, "id" | "createdAt">>,
        ) => {
          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id
                ? {
                    ...category,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : category,
            ),
          }));
        },

        deleteCategory: (id: string) => {
          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== id,
            ),
          }));
        },

        // Filtering and Sorting
        setTemplateFilter: (filter: TemplateState["currentFilter"]) => {
          set({ currentFilter: filter });
          get().applyTemplateFilters();
        },

        setTemplateSort: (
          sortBy: TemplateState["sortBy"],
          sortDirection: TemplateState["sortDirection"],
        ) => {
          set({ sortBy, sortDirection });
          get().applyTemplateFilters();
        },

        applyTemplateFilters: () => {
          const { templates, currentFilter, sortBy, sortDirection } = get();
          let filtered = [...templates];

          // Apply category filter
          if (currentFilter.categoryId) {
            filtered = filtered.filter(
              (template) => template.categoryId === currentFilter.categoryId,
            );
          }

          // Apply search query filter
          if (currentFilter.searchQuery) {
            const query = currentFilter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (template) =>
                template.name.toLowerCase().includes(query) ||
                template.description?.toLowerCase().includes(query) ||
                template.tags?.some((tag) => tag.toLowerCase().includes(query)),
            );
          }

          // Apply public/private filter
          if (currentFilter.isPublic !== undefined) {
            filtered = filtered.filter(
              (template) => template.isPublic === currentFilter.isPublic,
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            const aValue: any = a[sortBy];
            const bValue: any = b[sortBy];

            // Handle date sorting
            if (aValue instanceof Date && bValue instanceof Date) {
              return sortDirection === "asc"
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
            }

            // Handle string sorting
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }

            // Handle numeric sorting (usageCount, rating)
            if (typeof aValue === "number" && typeof bValue === "number") {
              return sortDirection === "asc"
                ? aValue - bValue
                : bValue - aValue;
            }

            return 0;
          });

          set({ filteredTemplates: filtered });
        },

        // Template loading states
        setTemplates: (templates: TemplateType[]) => {
          set({ templates });
          get().applyTemplateFilters();
        },

        setCategories: (categories: TemplateCategoryType[]) => {
          set({ categories });
        },

        // Template error handling
        setTemplateError: (error: string | null) => {
          set({ templateError: error });
        },

        // Template selection
        setSelectedTemplateIds: (templateIds: string[]) => {
          set({ selectedTemplateIds: templateIds });
        },

        // Bulk operations
        bulkDeleteTemplates: (templateIds: string[]) => {
          set((state) => ({
            templates: state.templates.filter(
              (template) => !templateIds.includes(template.id),
            ),
          }));
          get().applyTemplateFilters();
        },

        // Preview operations
        setPreviewTemplate: (
          templateId: string,
          content: string,
          variables: Record<string, string>,
        ) => {
          set({
            previewTemplate: {
              templateId,
              content,
              variables,
            },
          });
        },

        clearPreviewTemplate: () => {
          set({ previewTemplate: undefined });
        },

        // Template application
        applyTemplate: (
          templateId: string,
          variables?: Record<string, string>,
        ): string => {
          const template = get().templates.find((t) => t.id === templateId);
          if (!template) {
            throw new Error("Template not found");
          }

          // Simple variable replacement logic
          let result = template.content;
          if (variables) {
            for (const [key, value] of Object.entries(variables)) {
              const placeholder = `{{${key}}}`;
              result = result.replace(new RegExp(placeholder, "g"), value);
            }
          }

          // Increment usage count
          get().updateTemplate(templateId, {
            usageCount: (template.usageCount || 0) + 1,
          });

          return result;
        },

        // Initialize with some sample templates
        initializeSampleTemplates: () => {
          const sampleTemplates: TemplateType[] = [
            {
              id: "template-1",
              name: "Project Documentation",
              description: "Comprehensive template for project documentation",
              content:
                "## {{projectName}} Documentation\n\n### Overview\n{{projectDescription}}\n\n### Features\n- {{feature1}}\n- {{feature2}}\n- {{feature3}}\n\n### Installation\n```bash\n{{installationCommand}}\n```\n\n### Usage\n```javascript\n{{usageExample}}\n```",
              categoryId: "category-1",
              tags: ["documentation", "project", "technical"],
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0,
              rating: 4,
              isPublic: true,
              variables: {
                projectName: "Todone",
                projectDescription:
                  "A comprehensive task management application",
                feature1: "Task creation and management",
                feature2: "Project organization",
                feature3: "Team collaboration",
                installationCommand: "npm install todone",
                usageExample: "const app = new Todone();\napp.start();",
              },
            },
            {
              id: "template-2",
              name: "Meeting Notes",
              description: "Template for structured meeting notes",
              content:
                "# {{meetingTitle}} Meeting Notes\n\n**Date:** {{meetingDate}}\n**Location:** {{meetingLocation}}\n**Attendees:** {{attendees}}\n\n## Agenda\n1. {{agendaItem1}}\n2. {{agendaItem2}}\n3. {{agendaItem3}}\n\n## Discussion Points\n- {{discussionPoint1}}\n- {{discussionPoint2}}\n\n## Action Items\n- [ ] {{actionItem1}} ({{assignee1}})\n- [ ] {{actionItem2}} ({{assignee2}})\n\n## Next Steps\n{{nextSteps}}",
              categoryId: "category-2",
              tags: ["meeting", "notes", "business"],
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0,
              rating: 3,
              isPublic: true,
              variables: {
                meetingTitle: "Project Kickoff",
                meetingDate: "2023-11-15",
                meetingLocation: "Conference Room A",
                attendees: "John Doe, Jane Smith, Bob Johnson",
                agendaItem1: "Project Overview",
                agendaItem2: "Timeline Discussion",
                agendaItem3: "Resource Allocation",
                discussionPoint1: "Discussed project scope and deliverables",
                discussionPoint2: "Reviewed technical requirements",
                actionItem1: "Create project plan",
                assignee1: "John Doe",
                actionItem2: "Set up development environment",
                assignee2: "Jane Smith",
                nextSteps: "Schedule follow-up meeting for next week",
              },
            },
          ];

          const sampleCategories: TemplateCategoryType[] = [
            {
              id: "category-1",
              name: "Technical",
              description:
                "Templates for technical documentation and development",
              color: "#3B82F6",
              icon: "code",
              order: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "category-2",
              name: "Business",
              description: "Templates for business processes and meetings",
              color: "#10B981",
              icon: "briefcase",
              order: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "category-3",
              name: "Personal",
              description: "Templates for personal productivity",
              color: "#8B5CF6",
              icon: "user",
              order: 2,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          set({ templates: sampleTemplates, categories: sampleCategories });
          get().applyTemplateFilters();
        },
      }),
      {
        name: "todone-templates-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});
