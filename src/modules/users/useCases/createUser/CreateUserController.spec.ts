import { Connection } from "typeorm";
import request  from "supertest";

import {app} from '../../../../app';
import createConnection from '../../../../database';


let connection: Connection;

describe("Create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new user", async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: "User test",
        email: "user@email.com",
        password: "senhasecreta"
      });

      expect(response.status).toBe(201);
  });

  it("Should not be able to create a new user with same email", async() => {
      await request(app)
      .post('/api/v1/users')
      .send({
        name: "User test",
        email: "user@email.com",
        password: "senhasecreta"
      });

      const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: "User test",
        email: "user@email.com",
        password: "senhasecreta"
      });


      expect(response.status).toBe(400);
      expect(response.body.message).toEqual("User already exists");
  })
});
