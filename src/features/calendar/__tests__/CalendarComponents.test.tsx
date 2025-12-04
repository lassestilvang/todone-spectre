import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CalendarView } from "../CalendarView";
import { CalendarEvent } from "../CalendarEvent";
import { CalendarSync } from "../CalendarSync";
import { CalendarIntegration } from "../CalendarIntegration";
import { CalendarTestUtils } from "../../../../utils/calendarTestUtils";
import { CalendarServiceMocks } from "../../../../utils/calendarServiceMocks";

// Mock the hooks
jest.mock("../../../../hooks/useCalendar");
jest.mock("../../../../hooks/useTasks");

describe("Calendar Components", () => {
  const mockCalendarService = CalendarServiceMocks.createMockCalendarService();
  const mockCalendarSyncService =
    CalendarServiceMocks.createMockCalendarSyncService();

  beforeEach(() => {
    // Setup mock implementations
    require("../../../../hooks/useCalendar").useCalendar.mockReturnValue({
      events: CalendarTestUtils.generateMockEvents(3),
      loading: false,
      error: null,
      fetchEvents: jest
        .fn()
        .mockResolvedValue(CalendarTestUtils.generateMockEvents(3)),
      createEvent: jest
        .fn()
        .mockResolvedValue(CalendarTestUtils.generateMockEvents(1)[0]),
      updateEvent: jest
        .fn()
        .mockResolvedValue(CalendarTestUtils.generateMockEvents(1)[0]),
      deleteEvent: jest.fn().mockResolvedValue(true),
      linkTaskToEvent: jest.fn().mockResolvedValue(true),
      getEventsForDateRange: jest
        .fn()
        .mockResolvedValue(CalendarTestUtils.generateMockEvents(2)),
    });

    require("../../../../hooks/useTasks").useTasks.mockReturnValue({
      tasks: CalendarTestUtils.generateMockTasksWithCalendar(3),
      loading: false,
      error: null,
    });
  });

  describe("CalendarView", () => {
    it("should render calendar view with events", async () => {
      render(<CalendarView />);

      // Check if calendar header is rendered
      expect(screen.getByText(/Previous/i)).toBeInTheDocument();
      expect(screen.getByText(/Next/i)).toBeInTheDocument();
      expect(screen.getByText(/Today/i)).toBeInTheDocument();

      // Check if events are displayed
      await waitFor(() => {
        expect(screen.getAllByText(/Test Event/i).length).toBeGreaterThan(0);
      });
    });

    it("should handle date navigation", () => {
      render(<CalendarView />);

      const prevButton = screen.getByText(/Previous/i);
      const nextButton = screen.getByText(/Next/i);
      const todayButton = screen.getByText(/Today/i);

      fireEvent.click(prevButton);
      fireEvent.click(nextButton);
      fireEvent.click(todayButton);
    });
  });

  describe("CalendarEvent", () => {
    it("should render calendar event with correct information", () => {
      const mockEvent = CalendarTestUtils.generateMockEvents(1)[0];

      render(<CalendarEvent event={mockEvent} />);

      expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.priority)).toBeInTheDocument();
    });

    it("should call onClick when clicked", () => {
      const mockEvent = CalendarTestUtils.generateMockEvents(1)[0];
      const handleClick = jest.fn();

      render(<CalendarEvent event={mockEvent} onClick={handleClick} />);

      fireEvent.click(screen.getByText(mockEvent.title));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("CalendarSync", () => {
    it("should render sync controls", () => {
      render(
        <CalendarSync
          syncStatus="idle"
          lastSynced={new Date()}
          availableCalendars={CalendarTestUtils.generateMockCalendars(2)}
          syncCalendars={jest.fn()}
          getSyncStatus={jest.fn()}
        />,
      );

      expect(screen.getByText(/Calendar Sync/i)).toBeInTheDocument();
      expect(screen.getByText(/Sync Calendars/i)).toBeInTheDocument();
    });

    it("should handle calendar selection", () => {
      const mockCalendars = CalendarTestUtils.generateMockCalendars(2);
      const handleToggle = jest.fn();

      render(
        <CalendarSync
          syncStatus="idle"
          availableCalendars={mockCalendars}
          selectedCalendars={[]}
          onSync={jest.fn()}
          onCalendarToggle={handleToggle}
        />,
      );

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      expect(handleToggle).toHaveBeenCalledWith(mockCalendars[0].id);
    });
  });

  describe("CalendarIntegration", () => {
    it("should render integration component", () => {
      render(<CalendarIntegration taskId="test-task-1" />);

      expect(screen.getByText(/Calendar Integration/i)).toBeInTheDocument();
    });

    it("should show task information when taskId is provided", () => {
      render(<CalendarIntegration taskId="test-task-1" />);

      expect(screen.getByText(/Current Task/i)).toBeInTheDocument();
    });
  });
});
