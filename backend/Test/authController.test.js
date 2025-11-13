const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');
const ErrorHandler = require('../middleware/errorHandlers');
const {
  logIn,
  signUp,
  whoami,
  changePassword
} = require('../controllers/auth');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../models/user-model');
jest.mock('../middleware/errorHandlers');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    process.env.SECRETKEY = 'testsecret';
  });

  // ---------------------------------------------------------------------------
  // LOGIN TESTS
  // ---------------------------------------------------------------------------
  test('logIn should return token when credentials are correct', async () => {
    mockReq.body = { username: 'john', password: '1234' };
    const mockUser = { username: 'john', password: 'hashedpw' };

    userModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mockedToken');

    await logIn(mockReq, mockRes, mockNext);

    expect(userModel.findOne).toHaveBeenCalledWith({ username: 'john' });
    expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedpw');
    expect(jwt.sign).toHaveBeenCalledWith(
      { username: 'john' },
      'testsecret',
      { expiresIn: '14h' }
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      message: 'Login successful',
      token: 'mockedToken'
    });
  });

  test('logIn should call next if username or password missing', async () => {
    const error = { message: 'username or password not passed', statusCode: 400 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: '' };

    await logIn(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('logIn should call next if user not found', async () => {
    const error = { message: 'Invalid credentials or user not found', statusCode: 401 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: 'john', password: '1234' };
    userModel.findOne.mockResolvedValue(null);

    await logIn(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('logIn should call next if password mismatch', async () => {
    const error = { message: 'Invalid credentials', statusCode: 401 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: 'john', password: '1234' };
    userModel.findOne.mockResolvedValue({ username: 'john', password: 'wrong' });
    bcrypt.compare.mockResolvedValue(false);

    await logIn(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  // ---------------------------------------------------------------------------
  // SIGNUP TESTS
  // ---------------------------------------------------------------------------
  test('signUp should create user successfully', async () => {
    const mockSavedUser = { username: 'john', password: 'hashed', name: 'John Doe' };
    mockReq.body = { username: 'john', password: '1234', name: 'John Doe' };
    userModel.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSavedUser)
    }));

    await signUp(mockReq, mockRes, mockNext);

    expect(userModel.findOne).toHaveBeenCalledWith({ username: 'john' });
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      message: 'User created',
      data: mockSavedUser
    });
  });

  test('signUp should return 409 if username already exists', async () => {
    const existingUser = { username: 'john' };
    mockReq.body = { username: 'john', password: '1234', name: 'John' };
    userModel.findOne.mockResolvedValue(existingUser);

    await signUp(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'username already exists',
      code: 409
    });
  });

  test('signUp should call next if fields missing', async () => {
    const error = { message: 'username or password not passed or not validated', statusCode: 400 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: '', password: '' };

    await signUp(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  // ---------------------------------------------------------------------------
  // WHOAMI TESTS
  // ---------------------------------------------------------------------------
  test('whoami should decode token successfully', async () => {
    mockReq.body = { token: 'mocktoken' };
    jwt.verify.mockReturnValue({ username: 'john' });

    await whoami(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('mocktoken', 'testsecret');
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      message: 'user verified',
      user: { username: 'john' }
    });
  });

  test('whoami should call next if token missing', async () => {
    const error = { message: 'Token not found', statusCode: 400 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = {};

    await whoami(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  // ---------------------------------------------------------------------------
  // CHANGE PASSWORD TESTS
  // ---------------------------------------------------------------------------
  test('changePassword should update user password successfully', async () => {
    mockReq.body = { username: 'john', password: 'newpass' };
    bcrypt.hash.mockResolvedValue('newhashed');
    userModel.findOneAndUpdate.mockResolvedValue({ username: 'john' });

    await changePassword(mockReq, mockRes, mockNext);

    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
      { username: 'john' },
      { password: 'newhashed' }
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 200,
      status: 'success',
      user: { username: 'john' }
    });
  });

  test('changePassword should call next if username or password missing', async () => {
    const error = { message: 'username or password not found', statusCode: 400 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: '' };

    await changePassword(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('changePassword should call next if user update fails', async () => {
    const error = { message: 'user password not updated', statusCode: 400 };
    ErrorHandler.mockImplementation(async () => error);
    mockReq.body = { username: 'john', password: '1234' };
    bcrypt.hash.mockResolvedValue('newhash');
    userModel.findOneAndUpdate.mockResolvedValue(null);

    await changePassword(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
