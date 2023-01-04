import {InMemoryUsersRepository} from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import {InMemoryStatementsRepository} from '../../repositories/in-memory/InMemoryStatementsRepository';
import {CreateUserUseCase} from '../../../users/useCases/createUser/CreateUserUseCase';
import {CreateStatementUseCase} from '../../useCases/createStatement/CreateStatementUseCase';
import {OperationType, Statement} from '../../entities/Statement';
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { CreateStatementError } from './CreateStatementError';
import {v4 as uuidv4} from 'uuid';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create a statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  });

  it("Should be able to create a new statement", async () => {
    const user = {
      name: "teste",
      email: "teste@email.com",
      password: "password"
    }

    const userCreated = await createUserUseCase.execute(user);
    expect(userCreated).toHaveProperty("id");

    const newStatement: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      type: "deposit" as OperationType,
      amount: 500,
      description: "Payment"
    }

    const result = await createStatementUseCase.execute(newStatement);

    expect(result).toHaveProperty("id");
    expect(result.user_id).toEqual(userCreated.id);
    expect(result.type).toEqual(newStatement.type);
    expect(result.amount).toEqual(newStatement.amount);

  });

  it("Should be able to make withdraw", async () => {
    const user = {
      name: "teste",
      email: "teste@email.com",
      password: "password"
    }

    const userCreated = await createUserUseCase.execute(user);
    expect(userCreated).toHaveProperty("id");

    const deposit: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      type: "deposit" as OperationType,
      amount: 500,
      description: "Payment"
    }

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      type: "withdraw" as OperationType,
      amount: 100,
      description: "Pay some bill"
    }

    const withdrawResult = await createStatementUseCase.execute(withdraw);

    expect(withdrawResult).toHaveProperty("id");
    expect(withdrawResult).toBeInstanceOf(Statement);
    expect(withdrawResult.user_id).toEqual(userCreated.id);
    expect(withdrawResult.type).toEqual(withdraw.type)
    expect(withdrawResult.amount).toEqual(withdraw.amount)
  });

  it("Should not be able to deposit or make withdraw with a non-existing user", async() => {
    expect(async () => {
      const user_id = uuidv4();
      const deposit: ICreateStatementDTO = {
        user_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "Some payment",
      }

      await createStatementUseCase.execute(deposit)
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw without money", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "teste",
        email: "email@email.com",
        password: "1234",
      };

      const userCreated = await createUserUseCase.execute(user);

      expect(userCreated).toHaveProperty("id");

      const withdraw: ICreateStatementDTO = {
        user_id: userCreated.id as string,
        type: "withdraw" as OperationType,
        amount: 800,
        description: "I want money",
      }

      await createStatementUseCase.execute(withdraw)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })
});
