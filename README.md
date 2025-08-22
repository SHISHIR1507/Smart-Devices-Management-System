# Smart-Devices-Management-System

A scalable backend service for managing IoT-enabled smart devices, users, and activity logs.

The system provides secure authentication (JWT-based), role-based access control, and APIs for device lifecycle management, including registration, status updates, heartbeat monitoring, and usage analytics.

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
│── socket-test.html              
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
* JWT-based authentication with cookies.
* Users must signup → login → get token before accessing device APIs.
* All /devices routes are protected.

---

## 📌 API Documentation
1. **Auth Routes**
#### Signup
* POST /auth/signup
* Body:
   ```
   {
     "username": "john",
     "password": "secret123"
   }
   ```
* Response:
    ```
       {
         "success": true,
         "message": "User registered successfully"
       }
    ```

#### Login
* POST /auth/login
* Body:
    ```
       {
         "username": "john",
         "password": "secret123"
       }
    ```
* Response:
    ```
       {
          "success": true,
          "message": "Login successful"
       }
    ```
    
#### Logout
* POST /auth/logout
---
2. **Device Routes (Protected)**

#### <u>Register Device</u>
* POST /devices
* Body:
    ```
       {
          "name": "AC Unit",
          "type": "AC",
          "status": "inactive"
       }
    ```
* Response:
    ```
       {
          "success": true,
          "message": "Device registered successfully",
          "data": { ...device }
       }
    ```
  

#### List Devices
* GET /devices?type=AC&status=active
* Response:
    ```
       {
          "success": true,
          "message": "Devices fetched successfully",
          "data": [ ... ]
       }
    ```


#### Update Device
* PATCH /devices/:id
* Body:
    ```
       {
          "status": "active"
       }
    ```


#### Remove Device
* DELETE /devices/:id


#### Heartbeat Device
* POST /devices/:id/heartbeat
* Body:
    ```
       {
          "status": "active"
       }
    ```
    

* Response:
    ```
       {
          "success": true,
          "message": "Device heartbeat recorded",
          "last_active_at": "2025-08-20T12:30:00.000Z"
       }
    ```
---
  
3. **Log Routes**
#### Create Log
* POST /devices/:id/logs
* Body:
    ```
       {
          "action": "ON"
       }
    ```

#### Get Logs
* GET /devices/:id/logs

#### Usage Stats
* GET /devices/:id/usage

---

## 🎯 Bonus Features Implemented
1. **Rate Limiting**
* Each user can only make 100 requests per minute.
* Implemented using express-rate-limit.
* If exceeded:
    ```
       {
          "success": false,
          "message": "Too many requests, please try again later."
       }
    ```

2. **Background Job – Auto Device Deactivation**
* Devices inactive for more than 24 hours are automatically marked as "inactive".
* Implemented via ```deactivateInactiveDevices()``` in lib/deviceJobs.js.

3. **Docker Containerization**
* Multi-container setup with Node.js API and Redis cache
* Container orchestration with docker-compose
* Development-ready with hot reload
* Production patterns with restart policies

---

## 📌 Assumptions Made
* status defaults to "inactive" when registering a new device.
* Only authenticated users can manage their own devices.
* Logs are tied to devices via deviceId.
* Heartbeat updates device last_active_at timestamp.

---