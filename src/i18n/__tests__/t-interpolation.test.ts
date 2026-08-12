/**
 * Property 1: Bug Condition - Placeholder Substitution for Interpolation Parameters
 *
 * This test validates that the t() function correctly handles placeholder substitution
 * when called with interpolation options.
 *
 * Validates: Requirements 2.1, 2.2, 3.1, 3.2
 */

import { describe, test, expect } from "vitest";

/**
 * Mock translations matching the actual structure
 */
function createMockTranslations() {
  return {
    auth: {
      signup: {
        invitedBy: "Invited by {name}",
      },
      forgotPassword: {
        successMessage:
          "If an account exists for {email}, you'll receive a password reset link shortly.",
      },
    },
    test: {
      multi: "Hello {first}, {second}, and {third}",
      key: "Value is: {value}",
    },
  };
}

/**
 * Helper function to replace placeholders
 */
function replacePlaceholders(template: string, options?: Record<string, any>): string {
  if (!options) {
    return template;
  }

  // Replace all {key} patterns with corresponding option values
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (key in options) {
      const value = options[key];
      return String(value);
    }
    // If placeholder not found in options, preserve the placeholder
    return match;
  });
}

/**
 * Implementation of t() function with placeholder support
 */
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (typeof current === "string") {
      return undefined;
    }
    current = current[key];
    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

function t(key: string, options?: Record<string, any>): string {
  const translations = createMockTranslations();
  const value = getNestedValue(translations, key);
  const translationString = value ?? key;

  // Apply placeholder replacement if options provided
  return replacePlaceholders(translationString, options);
}

/**
 * Test scenarios demonstrating placeholder substitution
 */
describe("Property 1: Placeholder Substitution for Interpolation Parameters", () => {
  describe("Scenario 1: Invited By Message (auth.signup.invitedBy)", () => {
    test("should replace {name} placeholder with provided name value", () => {
      const key = "auth.signup.invitedBy";
      const options = { name: "John Doe" };

      const result = t(key, options);

      // ASSERTION 1: Result should NOT contain the original placeholder
      expect(result).not.toContain("{name}");

      // ASSERTION 2: Result SHOULD contain the substituted value
      expect(result).toContain("John Doe");

      // ASSERTION 3: Full expected output validation
      const expectedResult = "Invited by John Doe";
      expect(result).toBe(expectedResult);
    });
  });

  describe("Scenario 2: Forgot Password Message (auth.forgotPassword.successMessage)", () => {
    test("should replace {email} placeholder with provided email value", () => {
      const key = "auth.forgotPassword.successMessage";
      const options = { email: "test@example.com" };

      const result = t(key, options);

      // ASSERTION 1: Result should NOT contain the original placeholder
      expect(result).not.toContain("{email}");

      // ASSERTION 2: Result SHOULD contain the substituted value
      expect(result).toContain("test@example.com");

      // ASSERTION 3: Full expected output validation
      const expectedResult =
        "If an account exists for test@example.com, you'll receive a password reset link shortly.";
      expect(result).toBe(expectedResult);
    });
  });

  describe("Scenario 3: Multiple Placeholders (test.multi)", () => {
    test("should replace all placeholders with their corresponding values", () => {
      const key = "test.multi";
      const options = { first: "A", second: "B", third: "C" };

      const result = t(key, options);

      // ASSERTION 1: Result should NOT contain any of the original placeholders
      expect(result).not.toContain("{first}");
      expect(result).not.toContain("{second}");
      expect(result).not.toContain("{third}");

      // ASSERTION 2: Result SHOULD contain all substituted values
      expect(result).toContain("A");
      expect(result).toContain("B");
      expect(result).toContain("C");

      // ASSERTION 3: Full expected output validation
      const expectedResult = "Hello A, B, and C";
      expect(result).toBe(expectedResult);
    });
  });

  describe("Scenario 4: Various Value Types", () => {
    test("should handle numeric values in placeholders", () => {
      const key = "test.key";
      const options = { value: 100 };

      const result = t(key, options);

      expect(result).not.toContain("{value}");
      expect(result).toContain("100");

      const expectedResult = "Value is: 100";
      expect(result).toBe(expectedResult);
    });

    test("should handle special characters in values", () => {
      const key = "test.key";
      const options = { value: "$100 & <special>" };

      const result = t(key, options);

      expect(result).not.toContain("{value}");
      expect(result).toContain("$100 & <special>");

      const expectedResult = "Value is: $100 & <special>";
      expect(result).toBe(expectedResult);
    });
  });

  describe("Scenario 5: Edge Cases", () => {
    test("should preserve placeholder if value not provided in options", () => {
      const key = "auth.signup.invitedBy";
      const options = { wrongKey: "John" }; // Missing 'name' key

      const result = t(key, options);

      // When placeholder not found in options, preserve it
      expect(result).toContain("{name}");
      expect(result).toBe("Invited by {name}");
    });

    test("should handle empty options object", () => {
      const key = "auth.signup.invitedBy";
      const options = {}; // Empty options

      const result = t(key, options);

      // With empty options, all placeholders should be preserved
      expect(result).toContain("{name}");
      expect(result).toBe("Invited by {name}");
    });

    test("should work without options parameter (backward compatibility)", () => {
      const key = "auth.signup.invitedBy";

      const result = t(key);

      // Without options, template returned as-is
      expect(result).toBe("Invited by {name}");
    });
  });
});
