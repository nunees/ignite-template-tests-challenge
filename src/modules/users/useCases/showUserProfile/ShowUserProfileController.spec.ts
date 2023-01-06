import request from 'supertest';
import {Connection} from 'typeorm';
import createConnection from '../../../../database';
import {app} from '../../../../app';

let connection: Connection;

describe("Show user profile", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to list user's profile", async() => {
    await request(app).post('/api/v1/users')
    .send({
      name: "User test",
      email: "user@email.com",
      password: "senhasecreta"
    });

    const getToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "user@email.com",
        password: "senhasecreta"
      });

    expect(getToken.body).toHaveProperty('token');

    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${getToken.body.token}`,
      })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should not be able to list a non-existing user's profile", async() => {
    const getToken = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: "fakeuser@email.com",
        password: "senhasecreta"
      });

    expect(getToken.status).toBe(401);
    expect(getToken.body.message).toEqual("Incorrect email or password");

    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${getToken.body.token}`,
      })

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('JWT invalid token!');
  });
});
