import { Injectable } from '@nestjs/common';
import { UsersRepository } from "./user.repository";
import { User } from "./user";
import { CreateUserDto } from "./dto/createUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Injectable()
export class UserService {
    constructor(private usersRepository: UsersRepository) { }

    public async getUsers(): Promise<User[]> {
        return this.usersRepository.getUsers();
    }

    public async getUserByEmail(email: string) {
        return this.usersRepository.getUserByEmail(email);
    }

    public async getUserById(id: string) {
        return this.usersRepository.getUserById(id);
    }

    public async addUser(data: CreateUserDto): Promise<any> {
        const user = new User(data);
        return this.usersRepository.addUser(user);
    }

    public async updateUser(data: UpdateUserDto): Promise<any> {
        const user = new User(data);
        return this.usersRepository.updateUser(user);
    }

    public async deleteUser(rid: string): Promise<any> {
        return this.usersRepository.deleteUser(rid);
    }
}
