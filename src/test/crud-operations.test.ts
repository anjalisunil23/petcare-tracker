import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = 'http://127.0.0.1:8000/api';
const API_BASE = 'http://127.0.0.1:8000';

// Test data
let authToken: string | null = null;
let testUserId: number | null = null;
let managedUserId: number | null = null;
let testPetId: number | null = null;
let testAppointmentId: number | null = null;
let testMedicalRecordId: number | null = null;

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_NAME = 'CRUD Test User';

describe('PetCare CRUD Operations', () => {
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          name: TEST_NAME,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          role: 'owner'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user.email).toBe(TEST_EMAIL);

      authToken = data.token;
      testUserId = data.user.id;
    });

    it('should login with created account', async () => {
      const response = await fetch(`${BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          role: 'owner'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data.token).toBe(authToken);
    });

    it('should get current user info (me endpoint)', async () => {
      const response = await fetch(`${BASE_URL}/auth/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.email).toBe(TEST_EMAIL);
      expect(data.name).toBe(TEST_NAME);
    });
  });

  describe('Pet CRUD Operations', () => {
    it('should create a pet', async () => {
      const response = await fetch(`${BASE_URL}/pets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          name: 'Fluffy',
          species: 'cat',
          breed: 'Persian',
          age: 3,
          weight: 4.5,
          owner_name: TEST_NAME,
          notes: 'Test pet for CRUD testing'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Fluffy');
      expect(data.owner_name).toBe(TEST_NAME);
      testPetId = data.id;
    });

    it('should list pets', async () => {
      const response = await fetch(`${BASE_URL}/pets/?owner_name=${encodeURIComponent(TEST_NAME)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].owner_name).toBe(TEST_NAME);
    });

    it('should retrieve a specific pet', async () => {
      const response = await fetch(`${BASE_URL}/pets/${testPetId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(testPetId);
      expect(data.name).toBe('Fluffy');
    });

    it('should update a pet', async () => {
      const response = await fetch(`${BASE_URL}/pets/${testPetId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          name: 'Fluffier',
          species: 'cat',
          breed: 'Persian',
          age: 4,
          weight: 5.0,
          owner_name: TEST_NAME,
          notes: 'Updated pet for CRUD testing'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Fluffier');
      expect(data.age).toBe(4);
    });
  });

  describe('Appointment CRUD Operations', () => {
    it('should create an appointment', async () => {
      // First get the vet list if available
      const response = await fetch(`${BASE_URL}/appointments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          pet: testPetId,
          owner_name: TEST_NAME,
          vet_name: 'Dr. Smith',
          date: '2026-04-15',
          time: '10:00',
          reason: 'Regular checkup',
          status: 'scheduled'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.reason).toBe('Regular checkup');
      expect(data.vet_name).toBe('Dr. Smith');
      testAppointmentId = data.id;
    });

    it('should list appointments', async () => {
      const response = await fetch(`${BASE_URL}/appointments/?owner_name=${encodeURIComponent(TEST_NAME)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should retrieve a specific appointment', async () => {
      const response = await fetch(`${BASE_URL}/appointments/${testAppointmentId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(testAppointmentId);
      expect(data.reason).toBe('Regular checkup');
    });

    it('should update an appointment', async () => {
      const response = await fetch(`${BASE_URL}/appointments/${testAppointmentId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          pet: testPetId,
          owner_name: TEST_NAME,
          vet_name: 'Dr. Johnson',
          date: '2026-04-20',
          time: '14:00',
          reason: 'Follow-up checkup',
          status: 'scheduled'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.vet_name).toBe('Dr. Johnson');
      expect(data.reason).toBe('Follow-up checkup');
    });
  });

  describe('Medical Record CRUD Operations', () => {
    it('should create a medical record', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          pet: testPetId,
          date: '2026-04-08',
          diagnosis: 'Healthy',
          treatment: 'Preventative care',
          vet_name: 'Dr. Smith',
          notes: 'Regular annual checkup'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.diagnosis).toBe('Healthy');
      testMedicalRecordId = data.id;
    });

    it('should list medical records', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/?vet_name=Dr. Smith`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should retrieve a specific medical record', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/${testMedicalRecordId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(testMedicalRecordId);
      expect(data.diagnosis).toBe('Healthy');
    });

    it('should update a medical record', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/${testMedicalRecordId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          pet: testPetId,
          date: '2026-04-08',
          diagnosis: 'Excellent health',
          treatment: 'Preventative care with vitamin supplement',
          vet_name: 'Dr. Smith',
          notes: 'Updated annual checkup notes'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.diagnosis).toBe('Excellent health');
    });
  });

  describe('User CRUD Operations', () => {
    const MANAGED_EMAIL = `managed_${Date.now()}@example.com`;

    it('should create a managed user from users endpoint', async () => {
      const response = await fetch(`${BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          name: 'Managed User',
          email: MANAGED_EMAIL,
          role: 'vet',
          phone: '9999999999',
          password: 'ManagedPass123!'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.email).toBe(MANAGED_EMAIL);
      expect(data.role).toBe('vet');
      expect(typeof data.join_date).toBe('string');
      managedUserId = data.id;
    });

    it('should list users without serialization errors', async () => {
      const response = await fetch(`${BASE_URL}/users/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((u: { id: number }) => u.id === managedUserId)).toBe(true);
    });

    it('should retrieve a specific user', async () => {
      const response = await fetch(`${BASE_URL}/users/${managedUserId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(managedUserId);
      expect(data.email).toBe(MANAGED_EMAIL);
    });

    it('should update a specific user', async () => {
      const response = await fetch(`${BASE_URL}/users/${managedUserId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8081'
        },
        body: JSON.stringify({
          name: 'Managed User Updated',
          email: MANAGED_EMAIL,
          role: 'admin',
          phone: '1111111111'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Managed User Updated');
      expect(data.role).toBe('admin');
      expect(data.phone).toBe('1111111111');
    });

    it('should delete a specific user', async () => {
      const response = await fetch(`${BASE_URL}/users/${managedUserId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(204);
    });

    it('should confirm deleted user is not found', async () => {
      const response = await fetch(`${BASE_URL}/users/${managedUserId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Delete Operations', () => {
    it('should delete a medical record', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/${testMedicalRecordId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(204);
    });

    it('should verify medical record is deleted', async () => {
      const response = await fetch(`${BASE_URL}/medical-records/${testMedicalRecordId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(404);
    });

    it('should delete an appointment', async () => {
      const response = await fetch(`${BASE_URL}/appointments/${testAppointmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(204);
    });

    it('should delete a pet', async () => {
      const response = await fetch(`${BASE_URL}/pets/${testPetId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(204);
    });
  });

  describe('Auth Logout', () => {
    it('should logout user', async () => {
      const response = await fetch(`${BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(204);
    });

    it('should fail to access protected endpoint after logout', async () => {
      const response = await fetch(`${BASE_URL}/auth/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Origin': 'http://localhost:8081'
        }
      });

      expect(response.status).toBe(401);
    });
  });
});
