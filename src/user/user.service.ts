import { Injectable } from '@nestjs/common';
import { UserRepository } from "./user.repository";
import { User } from "./user";
import { CreateUserDto } from "./dto/createUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) { }

    public async getUsers(): Promise<User[]> {
        return this.userRepository.getUsers();
    }

    public async getUserByEmail(email: string) {
        return this.userRepository.getUserByEmail(email);
    }

    public async getUserById(id: string) {
        return this.userRepository.getUserById(id);
    }

    public async addUser(data: CreateUserDto): Promise<any> {
        const user = new User(data);
        return this.userRepository.addUser(user);
    }

    public async updateUser(data: UpdateUserDto): Promise<any> {
        const user = new User(data);
        return this.userRepository.updateUser(user);
    }

    public async deleteUser(rid: string): Promise<any> {
        return this.userRepository.deleteUser(rid);
    }
}
