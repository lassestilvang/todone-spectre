// @ts-nocheck
import React, { useState } from "react";
import CommentList from "./CommentList";
import { Comment } from "../../types/common";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface CommentListWithPaginationProps {
  comments: Comment[];
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReply: (comment: Comment) => void;
  itemsPerPage?: number;
}

const CommentListWithPagination: React.FC<CommentListWithPaginationProps> = ({
  comments,
  onEdit,
  onDelete,
  onReply,
  itemsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">(
    "newest",
  );

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === "popular") {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComments = sortedComments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No comments yet</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, sortedComments.length)} of{" "}
            {sortedComments.length} comments
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CommentList
        comments={paginatedComments}
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export { CommentListWithPagination };
export default CommentListWithPagination;
