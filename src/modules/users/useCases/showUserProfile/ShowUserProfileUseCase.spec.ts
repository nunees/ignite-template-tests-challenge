import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Return user profile", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepositoryInMemory);
  });

  it("Should be able to return user profile", async () => {
    const user =await createUserUseCase.execute({
      name: "test",
      email: "sameemail@test.com",
      password: "senha"
    });

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile).toHaveProperty("id");
    expect(profile.email).toEqual(user.email);
    expect(profile.name).toEqual(user.name);  
  })
});
