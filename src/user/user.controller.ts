import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Body,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import { LocalAuthenticationGuard } from 'src/auth/localAuthentication.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

  @UseGuards(JwtAuthenticationGuard)
  @Get()
  async getUsers() {
    return await this.userService.getUsers();
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post()
  async addUser(@Body() user: CreateUserDto) {
    return await this.userService.addUser(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Put()
  async updateUser(@Body() user: UpdateUserDto) {
    return await this.userService.updateUser(user);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Delete(':rid')
  async deleteUser(@Param('rid') rid) {
    return await this.userService.deleteUser(rid);
  }
}
