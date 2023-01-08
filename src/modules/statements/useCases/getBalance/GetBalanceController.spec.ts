import request from 'supertest';
import {app} from '../../../../app';
import { Connection } from "typeorm"
import createConnection from '../../../../database';

let connection: Connection;

let user: {
  name: string;
  email: string;
  password: string;
}
let token: string;

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "User test",
      email: "email@test.com",
      password: "senhasecreta"
    }

   await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to get user balance", async () => {
    const authenticatedUser =
      await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      });

      token = authenticatedUser.body.token;

      expect(authenticatedUser.statusCode).toBe(200);;
      expect(authenticatedUser.body.user).toHaveProperty("id");

    const depositStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: "some money i owned"
      })
      .set({
        Authorization: `Bearer ${token}`
      });

      expect(depositStatement.statusCode).toBe(201);

    const userBalance = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`
      });

    console.log(userBalance.body);
    expect(userBalance.statusCode).toBe(200);
    expect(userBalance.body.statement[0]).toHaveProperty("id")
    expect(userBalance.body).toHaveProperty("balance");
    expect(userBalance.body.balance).toEqual(100);
  });

  it("Should not be able to get balance of a non-existing user", async () => {
    const authenticatedUser =
    await request(app)
    .post('/api/v1/sessions')
    .send({
      email: "fake@email.com",
      password: "senhaerrada"
    });

    expect(authenticatedUser.statusCode).toBe(401);
    expect(authenticatedUser.body.message).toEqual('Incorrect email or password')
    expect(authenticatedUser.body.token).toBe(undefined)

    token = authenticatedUser.body.token;

    const userBalance = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(userBalance.status).toBe(401);
    expect(userBalance.body.message).toEqual('JWT invalid token!');
  })
})
