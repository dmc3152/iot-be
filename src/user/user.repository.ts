import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { User } from "./user";
import { constants } from "../constants";

@Injectable()
export class UsersRepository {

  constructor(@Inject(constants.DATABASE_CLIENT) private pool: any) { }

  async getUsers(): Promise<any> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    // make request
    try {
      const result = await session.query('SELECT @rid, name, email FROM User').all();
      const users = result.map(user => {
          return new User(user);
      });

      await session.close();
      return users;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = { email: email };

    // make request
    try {
      const result = await session.query('SELECT @rid, name, email FROM User WHERE email = :email', {params: params}).one();

      await session.close();
      return result ? new User(result) : null;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(id: string): Promise<any> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = { id: id };

    // make request
    try {
      const result = await session.query('SELECT @rid, name, email FROM User WHERE @rid = :id', {params: params}).one();

      await session.close();
      return result ? new User(result) : null;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addUser(user: User): Promise<any> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = {
        name: user.name,
        email: user.email,
        password: user.password
    }

    try {
      result = await session.command("INSERT INTO User SET name = :name, email = :email, password = :password", { params: params }).all();
    } catch (error) {
      exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await session.close();

    if (exception)
      throw exception;

    return result;
  }

  async updateUser(user: User): Promise<any> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    if (!user.id)
      throw new BadRequestException();

    const params = Object.keys(user).reduce((params, key) => {
        if (user[key] !== null && key !== 'id')
            params[key] = user[key];

        return params;
    }, {});

    try {
      result = await session.update(user.id)
        .set(params)
        .one();
      await session.close();
    } catch (error) {
      exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await session.close();

    if (exception)
      throw exception;

    return result;
  }

  async deleteUser(rid): Promise<any> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    if (!rid)
      throw new BadRequestException();

    try {
      result = session.delete("VERTEX", 'User')
        .where('@rid = ' + rid)
        .one();
      await session.close();
    } catch (error) {
      exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await session.close();

    if (exception)
      throw exception;

    return result;
  }
}
