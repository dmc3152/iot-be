import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { hash, compare } from "bcryptjs";
import RegistrationDataDto from './dto/registrationData.dto';
import { EasyconfigService } from 'nestjs-easyconfig';
import TokenPayload from './tokenPayload.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly config: EasyconfigService
    ) { }

    public getCookieWithJwtToken(id: string) {
        const payload: TokenPayload = { id };
        const token = this.jwtService.sign(payload);
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.config.get('JWT_EXPIRATION_TIME')}`;
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    public getJwtToken(id: string) {
        const payload: TokenPayload = { id };
        const token = this.jwtService.sign(payload);
        return {
            authToken: token,
            expiresIn: this.config.get('JWT_EXPIRATION_TIME')
        };
    }

    public async register(registrationData: RegistrationDataDto) {
        const hashedPassword = await hash(registrationData.password, 10);

        try {
            const createdUser = await this.userService.addUser({
                ...registrationData,
                password: hashedPassword
            });
            createdUser.password = undefined;
            return createdUser;
        } catch (error) {
            throw error;
        }
    }

    public async getAuthenticatedUser(email: string, plainTextPassword: string) {
        try {
            const user = await this.userService.getUserByEmail(email);
            await this.verifyPassword(plainTextPassword, user.password);
            user.password = undefined;
            return user;
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await compare(plainTextPassword, hashedPassword);

        if (!isPasswordMatching)
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
}
