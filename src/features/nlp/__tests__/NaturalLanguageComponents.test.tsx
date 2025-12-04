import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NaturalLanguageInput } from "../NaturalLanguageInput";
import { NaturalLanguageParser } from "../NaturalLanguageParser";
import { NaturalLanguagePreview } from "../NaturalLanguagePreview";
import { generateTestParseData } from "./nlpTestUtils";
import { ChakraProvider } from "@chakra-ui/react";

// Mock the hooks
jest.mock("../../../hooks/useNlpParser");
jest.mock("../../../hooks/useNaturalLanguage");

describe("NaturalLanguageInput", () => {
  const mockOnParseComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render input field and parse button", () => {
    render(
      <ChakraProvider>
        <NaturalLanguageInput onParseComplete={mockOnParseComplete} />
      </ChakraProvider>,
    );

    expect(
      screen.getByPlaceholderText("Type your task in natural language..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Parse")).toBeInTheDocument();
  });

  it("should call onParseComplete when parse button is clicked", async () => {
    const mockParse = jest.fn().mockResolvedValue(generateTestParseData());
    require("../../../hooks/useNlpParser").useNlpParser.mockReturnValue({
      parseNaturalLanguage: mockParse,
    });

    render(
      <ChakraProvider>
        <NaturalLanguageInput onParseComplete={mockOnParseComplete} />
      </ChakraProvider>,
    );

    const input = screen.getByPlaceholderText(
      "Type your task in natural language...",
    );
    fireEvent.change(input, { target: { value: "Test task input" } });

    const parseButton = screen.getByText("Parse");
    fireEvent.click(parseButton);

    await waitFor(() => {
      expect(mockParse).toHaveBeenCalledWith("Test task input");
      expect(mockOnParseComplete).toHaveBeenCalled();
    });
  });
});

describe("NaturalLanguageParser", () => {
  it("should display loading state when parsing", () => {
    const mockParse = jest.fn().mockImplementation(() => new Promise(() => {}));
    require("../../../hooks/useNlpParser").useNlpParser.mockReturnValue({
      parseNaturalLanguage: mockParse,
    });

    render(
      <ChakraProvider>
        <NaturalLanguageParser text="Test text" />
      </ChakraProvider>,
    );

    expect(screen.getByText("Parsing natural language...")).toBeInTheDocument();
  });

  it("should display parsed results when available", async () => {
    const testData = generateTestParseData();
    const mockParse = jest.fn().mockResolvedValue(testData);
    require("../../../hooks/useNlpParser").useNlpParser.mockReturnValue({
      parseNaturalLanguage: mockParse,
    });

    render(
      <ChakraProvider>
        <NaturalLanguageParser text="Test text" />
      </ChakraProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Parsed Results")).toBeInTheDocument();
      expect(screen.getByText(testData.title || "")).toBeInTheDocument();
    });
  });
});

describe("NaturalLanguagePreview", () => {
  it("should render preview with all fields", () => {
    const testData = generateTestParseData();

    render(
      <ChakraProvider>
        <NaturalLanguagePreview
          previewData={testData}
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      </ChakraProvider>,
    );

    expect(screen.getByText("Task Preview")).toBeInTheDocument();
    expect(screen.getByText(testData.title || "")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const mockOnConfirm = jest.fn();
    const testData = generateTestParseData();

    render(
      <ChakraProvider>
        <NaturalLanguagePreview
          previewData={testData}
          onConfirm={mockOnConfirm}
          onCancel={() => {}}
        />
      </ChakraProvider>,
    );

    const confirmButton = screen.getByText("Confirm");
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
