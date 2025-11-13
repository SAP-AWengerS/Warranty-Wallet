const ApiFeatureHead = require("./ApiFeatureHead");
const { getRegex } = require("./getRegex");

// Mock dependencies
jest.mock("./getRegex", () => ({
  getRegex: jest.fn((value) => new RegExp(value, "i"))
}));

describe("ApiFeatureHead", () => {
  let mockQuery;
  let queryStr;

  beforeEach(() => {
    // Mock Mongoose query object
    mockQuery = {
      find: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      aggregate: jest.fn().mockReturnThis(),
    };

    queryStr = {
      name: "John",
      department: "HR",
      startDate: "2025-01-01",
      endDate: "2025-02-01",
      entryDate: "",
    };

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // FILTER
  // ---------------------------------------------------------------------------
  test("filter() removes empty, startDate, and endDate fields", () => {
    const apiFeature = new ApiFeatureHead(mockQuery, queryStr);

    apiFeature.filter();

    // Check if find() was called
    expect(mockQuery.find).toHaveBeenCalled();

    // Verify newQueryStr has removed fields
    expect(apiFeature.newQueryStr).not.toHaveProperty("startDate");
    expect(apiFeature.newQueryStr).not.toHaveProperty("endDate");
    expect(apiFeature.newQueryStr).not.toHaveProperty("entryDate");

    // Verify regex applied
    expect(getRegex).toHaveBeenCalledWith("John");
    expect(getRegex).toHaveBeenCalledWith("HR");
  });

  // ---------------------------------------------------------------------------
  // PAGINATION
  // ---------------------------------------------------------------------------
  test("pagination() applies skip and limit correctly", () => {
    const apiFeature = new ApiFeatureHead(mockQuery, queryStr);

    apiFeature.pagination(2, 10);

    expect(mockQuery.find).toHaveBeenCalled();
    expect(mockQuery.skip).toHaveBeenCalledWith(10); // (page-1)*limit = 10
    expect(mockQuery.limit).toHaveBeenCalledWith(10);
  });

  test("pagination() defaults to page 1 when no currentPage is provided", () => {
    const apiFeature = new ApiFeatureHead(mockQuery, queryStr);

    apiFeature.pagination(undefined, 5);

    expect(mockQuery.skip).toHaveBeenCalledWith(0); // first page
    expect(mockQuery.limit).toHaveBeenCalledWith(5);
  });

  // ---------------------------------------------------------------------------
  // MATCH
  // ---------------------------------------------------------------------------
  test("match() removes dept, page, and limit and calls aggregate correctly", () => {
    const apiFeature = new ApiFeatureHead(mockQuery, {
      dept: "IT",
      page: 2,
      limit: 5,
      checkItem: "CPU",
      result: "Pass",
    });

    apiFeature.match();

    expect(mockQuery.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          checkItem: "CPU",
          result: "Pass",
        },
      },
      { $project: { _id: 1, checkItem: 1, result: 1 } },
    ]);
  });
});
