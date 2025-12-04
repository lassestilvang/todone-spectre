# Todone API Documentation

## 📚 Overview
Comprehensive API documentation for all Todone services with detailed endpoints, request/response formats, and usage examples.

## 🔧 Services

### Authentication Service
**Base Path**: `/api/auth`

#### Endpoints
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /me` - Get current user

#### Request/Response Examples

**Login Request**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Login Response**
```json
{
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Task Service
**Base Path**: `/api/tasks`

#### Endpoints
- `GET /` - Get all tasks
- `POST /` - Create new task
- `GET /:id` - Get task by ID
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task

#### Task Object
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}
```

### Project Service
**Base Path**: `/api/projects`

#### Endpoints
- `GET /` - Get all projects
- `POST /` - Create new project
- `GET /:id` - Get project by ID
- `PUT /:id` - Update project
- `DELETE /:id` - Delete project

## 🚀 Usage Examples

### JavaScript Client
```javascript
const API_URL = 'http://localhost:3000/api';

async function getTasks() {
  const response = await fetch(`${API_URL}/tasks`);
  return await response.json();
}

async function createTask(taskData) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(taskData)
  });
  return await response.json();
}
```

### TypeScript Client
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

async function login(email: string, password: string): Promise<ApiResponse<{ user: User, token: string }>> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
}
```

## 🔒 Authentication
All API endpoints require JWT authentication except for `/auth/login` and `/auth/register`.

## 📊 Error Handling
Standard error response format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 🧪 Testing
API endpoints can be tested using the provided mock services and test utilities.