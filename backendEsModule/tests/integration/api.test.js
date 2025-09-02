import request from 'supertest';
import { app } from '../../index.js';
import { db } from '../../models/db.js';

describe('API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testProjectId;

  beforeAll(async () => {
    // Setup test database connection
    await db.connect();
  });

  afterAll(async () => {
    // Cleanup test database
    await db.end();
  });

  beforeEach(async () => {
    // Clear test data before each test
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    await db.query('DELETE FROM projects WHERE title LIKE $1', ['%test%']);
  });

  describe('Authentication Endpoints', () => {
    describe('POST /users/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          first_name: 'Test',
          last_name: 'User',
          email: 'testuser@example.com',
          password: 'TestPassword123!',
          phone_number: '+1234567890',
          role_id: 1
        };

        const response = await request(app)
          .post('/users/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.first_name).toBe(userData.first_name);
        expect(response.body.user.last_name).toBe(userData.last_name);
        expect(response.body.user).not.toHaveProperty('password');
      });

      it('should return 400 for invalid user data', async () => {
        const invalidUserData = {
          first_name: '',
          email: 'invalid-email',
          password: '123'
        };

        const response = await request(app)
          .post('/users/register')
          .send(invalidUserData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 409 for duplicate email', async () => {
        const userData = {
          first_name: 'Test',
          last_name: 'User',
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          phone_number: '+1234567890',
          role_id: 1
        };

        // Register first user
        await request(app)
          .post('/users/register')
          .send(userData)
          .expect(201);

        // Try to register with same email
        const response = await request(app)
          .post('/users/register')
          .send(userData)
          .expect(409);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('POST /users/login', () => {
      beforeEach(async () => {
        // Create test user
        const userData = {
          first_name: 'Test',
          last_name: 'User',
          email: 'logintest@example.com',
          password: 'TestPassword123!',
          phone_number: '+1234567890',
          role_id: 1
        };

        await request(app)
          .post('/users/register')
          .send(userData);
      });

      it('should login successfully with valid credentials', async () => {
        const credentials = {
          email: 'logintest@example.com',
          password: 'TestPassword123!'
        };

        const response = await request(app)
          .post('/users/login')
          .send(credentials)
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(credentials.email);

        // Store token for other tests
        authToken = response.body.token;
        testUserId = response.body.user.id;
      });

      it('should return 401 for invalid credentials', async () => {
        const invalidCredentials = {
          email: 'logintest@example.com',
          password: 'WrongPassword123!'
        };

        const response = await request(app)
          .post('/users/login')
          .send(invalidCredentials)
          .expect(401);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for missing credentials', async () => {
        const response = await request(app)
          .post('/users/login')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('Project Endpoints', () => {
    beforeEach(async () => {
      // Ensure we have auth token
      if (!authToken) {
        const credentials = {
          email: 'logintest@example.com',
          password: 'TestPassword123!'
        };

        const response = await request(app)
          .post('/users/login')
          .send(credentials);
        
        authToken = response.body.token;
        testUserId = response.body.user.id;
      }
    });

    describe('POST /projects', () => {
      it('should create a new project successfully', async () => {
        const projectData = {
          title: 'Test Project',
          description: 'This is a test project description',
          budget_min: 1000,
          budget_max: 5000,
          duration: '1 to 3 months',
          location: 'Remote',
          category_id: 1,
          sub_category_id: 1
        };

        const response = await request(app)
          .post('/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send(projectData)
          .expect(201);

        expect(response.body).toHaveProperty('project');
        expect(response.body.project.title).toBe(projectData.title);
        expect(response.body.project.user_id).toBe(testUserId);

        // Store project ID for other tests
        testProjectId = response.body.project.id;
      });

      it('should return 400 for invalid project data', async () => {
        const invalidProjectData = {
          title: '',
          description: 'Too short',
          budget_min: -100
        };

        const response = await request(app)
          .post('/projects')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidProjectData)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 401 without authentication', async () => {
        const projectData = {
          title: 'Test Project',
          description: 'This is a test project description',
          budget_min: 1000,
          budget_max: 5000
        };

        const response = await request(app)
          .post('/projects')
          .send(projectData)
          .expect(401);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('GET /projects/:id', () => {
      beforeEach(async () => {
        // Ensure we have a test project
        if (!testProjectId) {
          const projectData = {
            title: 'Test Project for Get',
            description: 'This is a test project for get endpoint',
            budget_min: 1000,
            budget_max: 5000,
            duration: '1 to 3 months',
            location: 'Remote',
            category_id: 1,
            sub_category_id: 1
          };

          const response = await request(app)
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send(projectData);
          
          testProjectId = response.body.project.id;
        }
      });

      it('should get project details successfully', async () => {
        const response = await request(app)
          .get(`/projects/${testProjectId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('project');
        expect(response.body.project.id).toBe(testProjectId);
        expect(response.body.project.title).toBe('Test Project for Get');
      });

      it('should return 404 for non-existent project', async () => {
        const response = await request(app)
          .get('/projects/99999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body).toHaveProperty('message');
      });
    });

    describe('GET /projects/mine', () => {
      it('should get user projects successfully', async () => {
        const response = await request(app)
          .get('/projects/mine')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('projects');
        expect(Array.isArray(response.body.projects)).toBe(true);
      });

      it('should return 401 without authentication', async () => {
        const response = await request(app)
          .get('/projects/mine')
          .expect(401);

        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('Course Endpoints', () => {
    describe('GET /courses', () => {
      it('should get courses list successfully', async () => {
        const response = await request(app)
          .get('/courses')
          .expect(200);

        expect(response.body).toHaveProperty('courses');
        expect(Array.isArray(response.body.courses)).toBe(true);
      });
    });
  });

  describe('News Endpoints', () => {
    describe('GET /news', () => {
      it('should get news list successfully', async () => {
        const response = await request(app)
          .get('/news')
          .expect(200);

        expect(response.body).toHaveProperty('news');
        expect(Array.isArray(response.body.news)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/users/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
