import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "../SearchBar";
import { SearchResults } from "../SearchResults";
import { CommandPalette } from "../CommandPalette";
import { SearchModal } from "../SearchModal";
import { useSearch } from "../../../hooks/useSearch";
import { useCommandPalette } from "../../../hooks/useCommandPalette";
import {
  createMockSearchResults,
  createMockCommands,
} from "../../../utils/searchTestUtils";

// Mock the hooks
jest.mock("../../../hooks/useSearch");
jest.mock("../../../hooks/useCommandPalette");

describe("Search Integration Tests", () => {
  const mockSearch = jest.fn();
  const mockClearResults = jest.fn();
  const mockOpenCommandPalette = jest.fn();

  beforeEach(() => {
    // Mock useSearch hook
    (useSearch as jest.Mock).mockReturnValue({
      query: "",
      results: [],
      isLoading: false,
      error: null,
      search: mockSearch,
      clearResults: mockClearResults,
      searchByType: jest.fn(),
    });

    // Mock useCommandPalette hook
    (useCommandPalette as jest.Mock).mockReturnValue({
      isOpen: false,
      query: "",
      commands: [],
      filteredCommands: [],
      selectedIndex: 0,
      openCommandPalette: mockOpenCommandPalette,
      closeCommandPalette: jest.fn(),
      toggleCommandPalette: jest.fn(),
      executeCommand: jest.fn(),
      executeCommandById: jest.fn(),
      searchCommands: jest.fn(),
      navigateCommands: jest.fn(),
      selectCurrentCommand: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("SearchBar Component", () => {
    it("should render with placeholder", () => {
      render(<SearchBar placeholder="Test placeholder" />);
      expect(
        screen.getByPlaceholderText("Test placeholder"),
      ).toBeInTheDocument();
    });

    it("should call search when input changes", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.change(input, { target: { value: "test" } });
      expect(mockSearch).toHaveBeenCalledWith("test");
    });

    it("should open command palette on Ctrl+K", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "k", ctrlKey: true });
      expect(mockOpenCommandPalette).toHaveBeenCalled();
    });
  });

  describe("SearchResults Component", () => {
    it("should render no results message when empty", () => {
      render(<SearchResults results={[]} />);
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("should render search results", () => {
      const mockResults = createMockSearchResults(3);
      render(<SearchResults results={mockResults} />);
      mockResults.forEach((result) => {
        expect(screen.getByText(result.title)).toBeInTheDocument();
      });
    });
  });

  describe("CommandPalette Component", () => {
    it("should not render when closed", () => {
      render(<CommandPalette isOpen={false} onClose={() => {}} />);
      expect(
        screen.queryByPlaceholderText("Type a command or search..."),
      ).not.toBeInTheDocument();
    });

    it("should render when open", () => {
      const mockCommands = createMockCommands(3);
      (useCommandPalette as jest.Mock).mockReturnValue({
        ...(useCommandPalette as jest.Mock).mock.results[0].value,
        commands: mockCommands,
        filteredCommands: mockCommands,
      });

      render(<CommandPalette isOpen={true} onClose={() => {}} />);
      expect(
        screen.getByPlaceholderText("Type a command or search..."),
      ).toBeInTheDocument();
    });
  });

  describe("SearchModal Component", () => {
    it("should not render when closed", () => {
      render(<SearchModal isOpen={false} onClose={() => {}} />);
      expect(
        screen.queryByPlaceholderText("Search for tasks, projects, labels..."),
      ).not.toBeInTheDocument();
    });

    it("should render when open", () => {
      render(<SearchModal isOpen={true} onClose={() => {}} />);
      expect(
        screen.getByPlaceholderText("Search for tasks, projects, labels..."),
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should handle Ctrl+K for command palette", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "k", ctrlKey: true });
      expect(mockOpenCommandPalette).toHaveBeenCalled();
    });

    it("should handle Ctrl+F for search focus", () => {
      render(<SearchBar />);
      const input = screen.getByPlaceholderText("Search...");
      fireEvent.keyDown(input, { key: "f", ctrlKey: true });
      expect(input).toHaveFocus();
    });
  });
});
