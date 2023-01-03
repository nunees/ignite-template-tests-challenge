import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to auhenticate an user", async () => {
    const user = {
      name: "test3",
      email: "test3@test.com",
      password: "senhasecreta"
    }

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    })

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate a non-existent user", async () =>{
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "fakeemail@test.com",
        password: "fakepassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user with invalid password", async () => {
    expect(async () =>{
      const user = {
        name: "test4",
        email: "test4@test.com",
        password: "senhasecreta"
      }

      await createUserUseCase.execute(user)

      await authenticateUserUseCase.execute({
        email: "fakeemail@test.com",
        password: "senhasecreta",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
