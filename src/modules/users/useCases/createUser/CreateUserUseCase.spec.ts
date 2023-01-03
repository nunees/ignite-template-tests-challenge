import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a new user", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "senhasecreta"
    })

    const userRegister = await userRepositoryInMemory.findByEmail(user.email);

    expect(userRegister).toHaveProperty("id");
  });

  it("Should not be able to create a new user with an email that already exists", async () =>{
    expect(async () => {
      await createUserUseCase.execute({
        name: "test2",
        email: "test2@test.com",
        password: "senhasecreta"
      })

      await createUserUseCase.execute({
        name: "test2",
        email: "test2@test.com",
        password: "senhasecreta"
      })

    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
