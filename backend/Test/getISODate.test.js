const { getStartDate, getEndDate } = require("./getISODate");

describe("getISODate utility functions", () => {
  // ---------------------------------------------------------------------------
  // getStartDate
  // ---------------------------------------------------------------------------
  test("getStartDate() appends midnight UTC time to date string", () => {
    const input = "2025-11-10";
    const result = getStartDate(input);
    expect(result).toBe("2025-11-10T00:00:00.000Z");
  });

  test("getStartDate() works even if input already has time component", () => {
    const input = "2025-11-10T12:34:56.000Z";
    const result = getStartDate(input);
    expect(result).toBe("2025-11-10T12:34:56.000Z");
  });

  test("getStartDate() should handle invalid input gracefully", () => {
    const input = "";
    const result = getStartDate(input);
    expect(result).toBe("");
  });

  // ---------------------------------------------------------------------------
  // getEndDate
  // ---------------------------------------------------------------------------
  test("getEndDate() appends end-of-day UTC time to date string", () => {
    const input = "2025-11-10";
    const result = getEndDate(input);
    expect(result).toBe("2025-11-10T23:59:00.000Z");
  });

  test("getEndDate() works even if input already has time", () => {
    const input = "2025-11-10T08:00:00.000Z";
    const result = getEndDate(input);
    expect(result).toBe("2025-11-10T08:00:00.000Z");
  });

  test("getEndDate() should handle empty string", () => {
    const input = "";
    const result = getEndDate(input);
    expect(result).toBe("");
  });
});
