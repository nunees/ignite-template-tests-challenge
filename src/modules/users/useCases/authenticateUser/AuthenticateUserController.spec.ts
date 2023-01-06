import { Connection } from "typeorm";
import request  from "supertest";

import {app} from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let user: {
  name: string;
  email: String;
  password: string;
};

describe("Authenticate user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "User test",
      email: "user@email.com",
      password: "senhasecreta"
    }

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate user", async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
          email: user.email,
          password: user.password
        });

        expect(response.status).toBe(200);
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toEqual(user.email);
        expect(response.body.token).not.toBe(undefined);
  });

  it("Should not be possible to authenticate user with invalid password", async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: "senhaincorreta"
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Incorrect email or password');
  });

  it("Should not be possible to authenticate with a non-existent user", async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: "nonexistentuser@email.com",
      password: user.password
    });

    console.log(response.body);

    expect(response.status).toBe(401);
    expect(response.body.message).toEqual('Incorrect email or password');
  })
});
