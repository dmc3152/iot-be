import { Body, Req, Controller, HttpCode, Post, UseGuards, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import RegistrationDataDto from './dto/registrationData.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registrationData: RegistrationDataDto) {
        return this.authService.register(registrationData);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('logIn')
    async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
        const { user } = request;
        const jwtToken = this.authService.getJwtToken(user.id);
        // const cookie = this.authService.getCookieWithJwtToken(user.id);
        // response.setHeader('Set-Cookie', cookie);
        // user.password = undefined;
        return response.send(jwtToken);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('logOut')
    async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
        response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
        return response.sendStatus(200);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }
}
