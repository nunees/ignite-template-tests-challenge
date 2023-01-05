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
  })
});
