import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { User } from "./user";
import { constants } from "../constants";

@Injectable()
export class UserRepository {

  constructor(@Inject(constants.DATABASE_CLIENT) private db: any) { }

  async getUsers(): Promise<any> {
    try {
      const result = await this.db.select('@rid, name, email').from('User').all();
      const users = result.map(user => {
          return new User(user);
      });

      return users;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const result = await this.db.select('@rid, name, email, password').from('User').where({email: email}).one();
      return result ? new User(result) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(id: string): Promise<any> {
    try {
      const result = await this.db.select('@rid, name, email, password').from('User').where({"@rid": id}).one();
      return result ? new User(result) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addUser(user: User): Promise<any> {
    const params = {
        name: user.name,
        email: user.email,
        password: user.password
    }

    try {
      return await this.db.create('VERTEX', 'User').set(params).one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(user: User): Promise<any> {
    if (!user.id)
      throw new BadRequestException();

    const params = Object.keys(user).reduce((params, key) => {
        if (user[key] !== null && key !== 'id')
            params[key] = user[key];

        return params;
    }, {});

    try {
      return await this.db.update(user.id)
        .set(params)
        .one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(rid): Promise<any> {
    if (!rid)
      throw new BadRequestException();

    try {
      return this.db.delete("VERTEX", 'User')
        .where('@rid = ' + rid)
        .one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
