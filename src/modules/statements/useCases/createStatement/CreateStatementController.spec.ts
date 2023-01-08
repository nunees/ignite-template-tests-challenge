import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database";
import { OperationType } from "../../entities/Statement";
import { v4 as uuid } from "uuid";

let connection: Connection;

let user: {
  name: string;
  email: string;
  password: string;
};

describe("Create statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: "User test",
      email: "teste@email.com",
      password: "senhasecreta",
    };

    await request(app).post("/api/v1/users").send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to create a new deposit statement", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(authenticatedUser.body.user).toHaveProperty("id");
    expect(authenticatedUser.body.token).not.toBe(undefined);

    const createDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Some description",
      })
      .set({
        Authorization: `Bearer ${authenticatedUser.body.token}`,
      });

    expect(createDeposit.status).toBe(201);
    expect(createDeposit.body).toHaveProperty("id");
    expect(createDeposit.body.user_id).toEqual(authenticatedUser.body.user.id);
    expect(createDeposit.body.amount).toBe(100);
  });

  it("Should be able to create a new withdraw statement", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(authenticatedUser.body.user).toHaveProperty("id");
    expect(authenticatedUser.body.token).not.toBe(undefined);

    const createDeposit = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Some description",
      })
      .set({
        Authorization: `Bearer ${authenticatedUser.body.token}`,
      });

    expect(createDeposit.status).toBe(201);
    expect(createDeposit.body).toHaveProperty("id");
    expect(createDeposit.body.user_id).toEqual(authenticatedUser.body.user.id);
    expect(createDeposit.body.amount).toBe(100);
  });

  it("Should not be able to make a deposit or withdraw with a non-existing user", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email:"fake@email.com",
      password: "senhaerrada",
    });

    expect(authenticatedUser.statusCode).toBe(401);
    expect(authenticatedUser.body.message).toEqual('Incorrect email or password')
    expect(authenticatedUser.body.token).toBe(undefined)

    const createDeposit = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "Some description",
      })
      .set({
        Authorization: `Bearer ${authenticatedUser.body.token}`,
      });

      expect(createDeposit.status).toBe(401);
      expect(createDeposit.body.message).toEqual('JWT invalid token!')
  });

  it("should not be able to withdraw without money", async () => {
    const authenticatedUser = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    expect(authenticatedUser.body.user).toHaveProperty("id");
    expect(authenticatedUser.body.token).not.toBe(undefined);

    const createDeposit = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100.00,
        description: "Some description",
      })
      .set({
        Authorization: `Bearer ${authenticatedUser.body.token}`,
      });

      expect(createDeposit.statusCode).toBe(400);
      expect(createDeposit.body.message).toEqual('Insufficient funds')
  })
});
