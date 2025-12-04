import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CommentList from "../CommentList";
import CommentItem from "../CommentItem";
import CommentForm from "../CommentForm";
import CommentSection from "../CommentSection";
import { CommentTestUtils } from "../../../utils/commentTestUtils";
import { Comment } from "../../../types/common";

describe("Comment Components", () => {
  const mockComments = CommentTestUtils.generateMockComments(3);

  describe("CommentList", () => {
    it("should render empty state when no comments", () => {
      render(
        <CommentList
          comments={[]}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onReply={jest.fn()}
        />,
      );
      expect(screen.getByText("No comments yet")).toBeInTheDocument();
    });

    it("should render multiple comments", () => {
      render(
        <CommentList
          comments={mockComments}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onReply={jest.fn()}
        />,
      );
      expect(screen.getAllByText(/Test comment/).length).toBe(3);
    });
  });

  describe("CommentItem", () => {
    const mockComment = mockComments[0];
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();
    const mockReply = jest.fn();

    it("should render comment content and user info", () => {
      render(
        <CommentItem
          comment={mockComment}
          onEdit={mockEdit}
          onDelete={mockDelete}
          onReply={mockReply}
        />,
      );

      expect(screen.getByText(mockComment.content)).toBeInTheDocument();
      expect(screen.getByText(mockComment.user)).toBeInTheDocument();
    });

    it("should call edit handler when edit button clicked", () => {
      render(
        <CommentItem
          comment={mockComment}
          onEdit={mockEdit}
          onDelete={mockDelete}
          onReply={mockReply}
        />,
      );

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);
      expect(mockEdit).toHaveBeenCalledWith(mockComment);
    });

    it("should call delete handler when delete button clicked", () => {
      render(
        <CommentItem
          comment={mockComment}
          onEdit={mockEdit}
          onDelete={mockDelete}
          onReply={mockReply}
        />,
      );

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);
      expect(mockDelete).toHaveBeenCalledWith(mockComment.id);
    });
  });

  describe("CommentForm", () => {
    const mockSubmit = jest.fn();

    it("should render form with textarea and submit button", () => {
      render(<CommentForm taskId="task-1" onSubmit={mockSubmit} />);

      expect(
        screen.getByPlaceholderText(/Write a comment/),
      ).toBeInTheDocument();
      expect(screen.getByText("Post Comment")).toBeInTheDocument();
    });

    it("should call submit handler with content when form submitted", () => {
      const testContent = "Test comment content";
      render(<CommentForm taskId="task-1" onSubmit={mockSubmit} />);

      const textarea = screen.getByPlaceholderText(/Write a comment/);
      fireEvent.change(textarea, { target: { value: testContent } });
      fireEvent.submit(screen.getByText("Post Comment"));

      expect(mockSubmit).toHaveBeenCalledWith(testContent);
    });
  });

  describe("CommentSection", () => {
    it("should render loading state initially", () => {
      // Mock the useComments hook
      jest.mock("../../../hooks/useComments", () => ({
        useComments: () => ({
          comments: [],
          loading: true,
          error: null,
          createComment: jest.fn(),
          updateComment: jest.fn(),
          deleteComment: jest.fn(),
        }),
      }));

      render(<CommentSection taskId="task-1" />);
      expect(screen.getByText("Loading comments...")).toBeInTheDocument();
    });

    it("should render error state when error occurs", () => {
      jest.mock("../../../hooks/useComments", () => ({
        useComments: () => ({
          comments: [],
          loading: false,
          error: "Failed to load comments",
          createComment: jest.fn(),
          updateComment: jest.fn(),
          deleteComment: jest.fn(),
        }),
      }));

      render(<CommentSection taskId="task-1" />);
      expect(screen.getByText("Error loading comments")).toBeInTheDocument();
    });
  });
});
