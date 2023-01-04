import { OperationType } from './../../entities/Statement';
import { CreateUserUseCase } from './../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceError } from './GetBalanceError';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';

let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Get Balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
  })

  it("should be able to get balance", async () => {
    const user: ICreateUserDTO = {
      email: "email@email.com",
      password: "senha",
      name: "user",
    };

    const userCreated = await createUserUseCase.execute(user);

    expect(userCreated).toHaveProperty("id");
    const user_id = userCreated.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "deposit",
    });

    const balance = await getBalanceUseCase.execute({user_id});

    expect(balance.statement[0]).toHaveProperty("id");
    expect(balance.statement.length).toBe(1);
    expect(balance.balance).toEqual(100);
  })

  it("should not be able to get balance from non-existing user", async () => {
    expect(async () => {
      const user_id = "a86970f0798a076b"
      await getBalanceUseCase.execute({user_id});
    }).rejects.toBeInstanceOf(GetBalanceError)
  });
});
