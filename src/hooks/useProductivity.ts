import { useState, useEffect } from "react";
import { ProductivityService } from "../services/productivityService";

export const useProductivity = () => {
  const [productivityData, setProductivityData] = useState(
    ProductivityService.getInstance().getProductivityData(),
  );
  const [productivityMetrics, setProductivityMetrics] = useState(
    ProductivityService.getInstance().getProductivityMetrics(),
  );

  useEffect(() => {
    const productivityService = ProductivityService.getInstance();

    // Set up a listener or interval to update productivity data
    const interval = setInterval(() => {
      setProductivityData(productivityService.getProductivityData());
      setProductivityMetrics(productivityService.getProductivityMetrics());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const updateTaskCompletion = () => {
    ProductivityService.getInstance().updateTaskCompletion({
      id: "",
      title: "",
      description: "",
      status: "completed",
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(),
      completedAt: new Date(),
      userId: "",
      projectId: "",
      tags: [],
      recurringPattern: null,
      parentTaskId: null,
      position: 0,
    });
  };

  const updateTaskCreation = () => {
    ProductivityService.getInstance().updateTaskCreation();
  };

  return {
    productivityData,
    productivityMetrics,
    updateTaskCompletion,
    updateTaskCreation,
  };
};
