const request = require('supertest');
const app = require('../src/app');

describe('Health API', () => {
  it('should return ok: true on GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('timestamp');
  });
});
