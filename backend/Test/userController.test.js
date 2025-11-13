const { getMyProfile } = require("../controllers/user");
const userModel = require("../models/user-model");
const ErrorHandler = require("../middleware/errorHandlers");

jest.mock("../models/user-model");
jest.mock("../middleware/errorHandlers");

describe("getMyProfile Controller", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // ✅ SUCCESS CASE
  // ---------------------------------------------------------------------------
  test("should return user profile when decodedUser is valid", async () => {
    const mockUser = { username: "john", name: "John Doe", password: "hashedpw" };
    mockReq.body.decodedUser = { username: "john" };
    userModel.findOne.mockResolvedValue({ ...mockUser });

    await getMyProfile(mockReq, mockRes, mockNext);

    expect(userModel.findOne).toHaveBeenCalledWith({ username: "john" });
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      message: "Profile found",
      user: { username: "john", name: "John Doe" }, // password deleted
    });
  });

  // ---------------------------------------------------------------------------
  // ⚠️ FAILURE CASE: decodedUser missing
  // ---------------------------------------------------------------------------
  test("should call next() with ErrorHandler when decodedUser is missing", async () => {
    const errorInstance = { message: "Application id not valid", statusCode: 400 };
    ErrorHandler.mockImplementation(async () => errorInstance);

    await getMyProfile(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorInstance);
    expect(userModel.findOne).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // ⚠️ FAILURE CASE: user not found (optional safety)
  // ---------------------------------------------------------------------------
  test("should handle user not found gracefully (userModel returns null)", async () => {
    mockReq.body.decodedUser = { username: "ghost" };
    userModel.findOne.mockResolvedValue(null);

    await getMyProfile(mockReq, mockRes, mockNext);

    // even if user is null, it shouldn't crash; password delete will fail silently
    expect(userModel.findOne).toHaveBeenCalledWith({ username: "ghost" });
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      message: "Profile found",
      user: null,
    });
  });
});
