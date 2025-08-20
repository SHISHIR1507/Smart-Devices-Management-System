class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.success = true;          // always true for success
    this.statusCode = statusCode; // store HTTP code if needed
    this.message = message;       // human readable
    this.data = data;             // actual payload
  }
}

export default ApiResponse;
