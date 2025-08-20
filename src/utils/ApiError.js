class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default ApiError;
