import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// A component that throws an error
const ErrorComponent = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  // Suppress console.error during tests
  const originalConsoleError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("displays error message when child throws an error", () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("calls console.error when an error is caught", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
