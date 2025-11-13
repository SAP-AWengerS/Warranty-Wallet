const {
  getAlluser,
  getOneUserByUsername,
  deleteOneUserByUsername,
} = require("../controllers/users");

const userModel = require("../models/user-model");
const ErrorHandler = require("../middleware/errorHandlers");

// Mock dependencies
jest.mock("../models/user-model");
jest.mock("../middleware/errorHandlers");

describe("User Controller Tests", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, body: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // getAlluser
  // ---------------------------------------------------------------------------
  test("getAlluser → should return all users when found", async () => {
    const mockUsers = [{ username: "john" }, { username: "alice" }];
    userModel.find.mockResolvedValue(mockUsers);

    await getAlluser(mockReq, mockRes, mockNext);

    expect(userModel.find).toHaveBeenCalledWith({});
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "All user",
      users: mockUsers,
    });
  });

  test("getAlluser → should call next() when no users found", async () => {
    const errorInstance = { message: "Operation failed", statusCode: 500 };
    ErrorHandler.mockImplementation(async () => errorInstance);
    userModel.find.mockResolvedValue(null);

    await getAlluser(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorInstance);
  });

  // ---------------------------------------------------------------------------
  // getOneUserByUsername
  // ---------------------------------------------------------------------------
  test("getOneUserByUsername → should return user when found", async () => {
    const mockUser = { username: "john" };
    mockReq.params.username = "john";
    userModel.findOne.mockResolvedValue(mockUser);

    await getOneUserByUsername(mockReq, mockRes, mockNext);

    expect(userModel.findOne).toHaveBeenCalledWith({ username: "john" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User found",
      user: mockUser,
    });
  });

  test("getOneUserByUsername → should call next() when user not found", async () => {
    const errorInstance = { message: "Operation failed", statusCode: 500 };
    ErrorHandler.mockImplementation(async () => errorInstance);
    mockReq.params.username = "ghost";
    userModel.findOne.mockResolvedValue(null);

    await getOneUserByUsername(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorInstance);
  });

  // ---------------------------------------------------------------------------
  // deleteOneUserByUsername
  // ---------------------------------------------------------------------------
  test("deleteOneUserByUsername → should delete and return user", async () => {
    const mockUser = { username: "john" };
    mockReq.params.username = "john";
    userModel.findOneAndDelete.mockResolvedValue(mockUser);

    await deleteOneUserByUsername(mockReq, mockRes, mockNext);

    expect(userModel.findOneAndDelete).toHaveBeenCalledWith({ username: "john" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User found",
      user: mockUser,
    });
  });

  test("deleteOneUserByUsername → should call next() when deletion fails", async () => {
    const errorInstance = { message: "Operation failed", statusCode: 500 };
    ErrorHandler.mockImplementation(async () => errorInstance);
    mockReq.params.username = "notfound";
    userModel.findOneAndDelete.mockResolvedValue(null);

    await deleteOneUserByUsername(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorInstance);
  });
});