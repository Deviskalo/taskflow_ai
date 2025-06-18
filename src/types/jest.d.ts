// Extend Jest matchers with testing-library matchers
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R = void> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
      toBeChecked(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveStyle(style: Partial<CSSStyleDeclaration>): R;
    }
  }
}

// This export is needed for TypeScript to treat this as a module
export {};
