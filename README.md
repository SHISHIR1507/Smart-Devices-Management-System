# Smart-Devices-Management-System

A scalable backend service for managing IoT-enabled smart devices, users, and activity logs.

The system provides secure authentication (JWT-based), role-based access control, and APIs for device lifecycle management, including registration, status updates, heartbeat monitoring, usage analytics, and advanced features like data export and real-time WebSocket communication.

It also supports rate limiting for fair API usage and automated background jobs to maintain device health by deactivating inactive devices.

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker & Docker Compose installed

### Quick Start with Docker
1. **Clone the repository**
   ```bash
   git clone https://github.com/SHISHIR1507/Smart-Devices-Management-System.git
   cd Smart-Devices-Management-System
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   ```

3. **Start all services**
   ```bash
   docker-compose up
   ```

4. **Access the application**
   - API Server: http://localhost:5009
   - Redis Cache: localhost:6379
   - Socket.io Test: http://localhost:5009/socket-test.html

### Docker Architecture
- **Node.js API**: Main backend service (Port 5009)
- **Redis Cache**: Session storage, caching, background job queues (Port 6379)
- **Custom Network**: Isolated container communication
- **Persistent Storage**: Redis data survives container restarts

### Docker Commands
```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

---

## 📂 Project Structure
```
Smart-Devices-Management-System/
│── package.json                                  
│── Dockerfile                     
│── docker-compose.yml             
│── .dockerignore                  
│── .gitignore                    
│── .env                          
│── .env.docker                   
│── README.md                     
│── healthcheck.js                # Health check endpoint
│── socket-test.html              # WebSocket testing interface
│
├── src/                          # Source code directory
│ ├── controllers/                
│ │ ├── user.controller.js
│ │ ├── export.controller.js
│ │ ├── device.controller.js
│ │ └── log.controller.js
│ │
│ ├── routes/                     
│ │ ├── user.route.js
│ │ ├── export.route.js
│ │ ├── device.route.js
│ │ └── log.route.js
│ │
│ ├── models/                     
│ │ ├── Device.model.js
│ │ ├── User.model.js
│ │ └── Log.model.js
│ │
│ ├── middlewares/                
│ │ ├── auth.middleware.js
│ │ ├── authorize.js
│ │ ├── cache.js
│ │ ├── limiters.js
│ │ └── reqLogger.js
│ │
│ ├── lib/                        
│ │ ├── database.js               
│ │ ├── deviceJobs.js             
│ │ ├── redis.js                  
│ │ └── socket.js                 
│ │
│ ├── utils/                      
│ │ ├── ApiError.js
│ │ ├── ApiResponse.js
│ │ └── AsyncHandler.js
│ │
│ └── server.js                   # Entry point
│
```

---

## ⚡ Manual Setup (Alternative)

### Prerequisites
- Node.js 18+
- MongoDB running
- Redis running

1. **Clone the repository**
   ```
   git clone https://github.com/SHISHIR1507/Smart-Devices-Management-System.git
   cd smart-devices-management
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set environment variables**
    Create a .env file in the project root:
   ```
   PORT=5009
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES=<your-token-expiration>
   REDIS_HOST=<your-host>
   REDIS_PORT=6379
   REDIS_PASSWORD=<your-redis-pwd>   
   REDIS_DB=<db>        
   ACCESS_TOKEN_SECRET=<yourSecretKey>
   REFRESH_TOKEN_SECRET=<yourSuperSecretKey>
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   ```

4. **Run the server**
   ```
   npm run dev
   ```
   Server will start at: http://localhost:5009

---

## 🔐 Authentication
* JWT-based authentication with access and refresh tokens stored in cookies
* Users must signup → login → get tokens before accessing protected APIs
* All device routes (`/devices/*`) and export routes (`/export/*`) are protected
* Automatic token refresh mechanism for seamless user experience

---

## 📌 API Documentation

### 1. **Authentication Routes**

#### Signup
* **POST** `/auth/signup`
* **Body:**
   ```json
   {
     "fullName": "shishir",
     "email": "shishir@example.com",
     "password": "123453805753057686"
   }
   ```
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "User created successfully",
      "data": {
        "token": "eyJhbGc...",
        "refreshToken": "eyJhbGc...",
        "user": {
          "id": "68a8545d1a715a0bc8ebf4e9",
          "name": "shishir",
          "email": "shishir@example.com",
          "role": "user"
        }
      }
    }
    ```

#### Login
* **POST** `/auth/login`
* **Body:**
    ```json
    {
      "email": "shishir@example.com",
      "password": "123453805753057686"
    }
    ```
* **Response:**
    ```json
    {
      "success": true,
      "token": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "user": {
        "id": "68a8545d1a715a0bc8ebf4e9",
        "name": "shishir",
        "email": "shishir@example.com",
        "role": "user"
      }
    }
    ```

#### Refresh Token
* **POST** `/auth/refresh`
* **Body:**
    ```json
    {
      "refreshToken": "eyJhbGc..."
    }
    ```
* **Response:**
    ```json
    {
      "success": true,
      "token": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
    ```
    
#### Logout
* **POST** `/auth/logout`
* **Headers:** `Authorization: Bearer <token>`

---

### 2. **Device Routes (Protected)**

#### Register Device
* **POST** `/devices`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "name": "Smart tv",
      "type": "tv",
      "status": "active"
    }
    ```
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 201,
      "message": "Device registered successfully",
      "data": {
        "name": "Smart tv",
        "type": "tv",
        "status": "active",
        "last_active_at": null,
        "owner_id": "68a8545d1a715a0bc8ebf4e9",
        "_id": "68a8580c51a715a0bc8ebf4f1",
        "createdAt": "2025-08-22T11:47:17.182Z",
        "updatedAt": "2025-08-22T11:47:17.182Z",
        "__v": 0
      }
    }
    ```

#### List Devices
* **GET** `/devices?type=tv&status=active`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `type` (optional): Filter by device type
  - `status` (optional): Filter by device status
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of devices per page
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Devices fetched successfully",
      "data": [
        {
          "_id": "68a858211a715a0bc8ebf4ee",
          "name": "Smart tv",
          "type": "tv",
          "status": "active",
          "last_active_at": null,
          "owner_id": "68a8545d1a715a0bc8ebf4e9",
          "createdAt": "2025-08-22T11:44:33.543Z",
          "updatedAt": "2025-08-22T11:44:33.543Z",
          "__v": 0
        }
      ]
    }
    ```

#### Update Device
* **PATCH** `/devices/:id`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "status": "inactive"
    }
    ```

#### Remove Device
* **DELETE** `/devices/:id`
* **Headers:** `Authorization: Bearer <token>`

#### Device Heartbeat
* **POST** `/devices/:id/heartbeat`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "status": "active"
    }
    ```
* **Response:**
    ```json
    {
      "success": true,
      "message": "Device heartbeat recorded",
      "last_active_at": "2025-08-22T12:30:00.000Z"
    }
    ```

---

### 3. **Analytics & Monitoring Routes (Protected)**

#### Device Analytics
* **GET** `/devices/analytics`
* **Headers:** `Authorization: Bearer <token>`
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Analytics data",
      "data": {
        "source": "db",
        "data": {
          "totalDevices": 647,
          "online": 0,
          "offline": 647,
          "lastUpdated": "2025-08-22T13:18:11.647Z"
        }
      }
    }
    ```

#### Cache Invalidation
* **GET** `/cache/invalidate`
* **Headers:** `Authorization: Bearer <token>`
* **Description:** Manually invalidate Redis cache for fresh data

---

### 4. **Data Export Routes (Protected)**

#### Export Device Logs
* **POST** `/export/logs`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "deviceId": "68a8545d1a715a0bc8ebf4e9",
      "from": "2025-08-01T00:00:00.000Z",
      "to": "2025-08-22T23:59:59.000Z",
      "format": "csv"
    }
    ```
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 202,
      "message": "Export job queued",
      "data": {
        "jobId": "7f947482-7723-41d1-9647-eeb3ab162ecd"
      }
    }
    ```

#### Check Export Status
* **GET** `/export/status/:jobId`
* **Headers:** `Authorization: Bearer <token>`
* **Response:**
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Export status",
      "data": {
        "createdAt": "1755873486570",
        "filePath": "/Users/shishirsingh/Smart Device Management System/exports/7f947482-7723-41d1-9647-eeb3ab162ecd.csv",
        "deviceId": "68a8545d1a715a0bc8ebf4e9",
        "status": "done",
        "finishedAt": "1755873486596",
        "format": "csv"
      }
    }
    ```

---

### 5. **Log Routes (Protected)**

#### Create Log Entry
* **POST** `/devices/:id/logs`
* **Headers:** `Authorization: Bearer <token>`
* **Body:**
    ```json
    {
      "action": "ON"
    }
    ```

#### Get Device Logs
* **GET** `/devices/:id/logs`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Logs per page
  - `from` (optional): Start date
  - `to` (optional): End date

#### Device Usage Statistics
* **GET** `/devices/:id/usage`
* **Headers:** `Authorization: Bearer <token>`

---

## 🚀 Advanced Features Implemented

### 1. **Real-time Communication (WebSocket)**
- Socket.io integration for real-time device updates
- Test interface available at `/socket-test.html`
- Real-time notifications for device status changes
- Live connection status monitoring

### 2. **Caching & Performance**
- Redis-based caching for frequently accessed data
- Cache invalidation endpoints for manual refresh
- Optimized database queries with indexing
- Response time monitoring

### 3. **Background Job Processing**
- **Rate Limiting**: 100 requests per minute per user using express-rate-limit
- **Auto Device Deactivation**: Devices inactive for 24+ hours automatically marked as "inactive"
- **Data Export Jobs**: Asynchronous CSV/JSON export with job status tracking
- **Cleanup Jobs**: Automatic cleanup of old logs and expired tokens

### 4. **Data Export & Analytics**
- CSV/JSON export functionality for device logs
- Asynchronous job processing for large datasets
- Export status tracking with unique job IDs
- Device usage analytics and reporting
- System-wide device statistics

### 5. **Enhanced Security**
- JWT-based authentication with refresh token mechanism
- Role-based access control (RBAC)
- Rate limiting per user/IP
- Request logging and monitoring
- Input validation and sanitization

### 6. **Docker Containerization**
- Multi-container setup with Node.js API and Redis
- Container orchestration with docker-compose
- Development-ready with hot reload
- Production patterns with restart policies
- Health check endpoints

---

## 🎯 Rate Limiting & Error Handling

### Rate Limiting
- **Limit**: 100 requests per minute per user
- **Response when exceeded**:
    ```json
    {
      "success": false,
      "message": "Too many requests, please try again later."
    }
    ```

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

---

## 📊 Monitoring & Health Checks

### Health Check
* **GET** `/health`
* **Response:**
    ```json
    {
      "status": "healthy",
      "timestamp": "2025-08-22T12:00:00.000Z",
      "services": {
        "database": "connected",
        "redis": "connected"
      }
    }
    ```

### System Analytics
* **GET** `/devices/analytics`
* Provides real-time system statistics
* Cached for performance with manual invalidation option

---

## 📌 Key Assumptions Made

- Device `status` defaults to "inactive" when registering new devices
- Only authenticated users can manage their own devices
- Logs are tied to devices via `deviceId` and user ownership
- Heartbeat updates device `last_active_at` timestamp
- Export jobs are processed asynchronously and cleaned up after 24 hours
- WebSocket connections are authenticated using JWT tokens
- Cache TTL is set to 5 minutes for analytics data

---


## 🚀 Future Enhancements

- Device firmware update management
- Advanced analytics with ML predictions
- Multi-tenant architecture support
- Webhook notifications for external systems
- Mobile app integration with push notifications
- Advanced device grouping and bulk operations