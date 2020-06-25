import {
    Controller,
    Get,
    Param,
    Post,
    Put,
    Body,
    Delete,
} from '@nestjs/common';
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

  @Get()
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Post()
  async addUser(@Body() user: CreateUserDto) {
    return await this.userService.addUser(user);
  }

  @Put()
  async updateUser(@Body() user: UpdateUserDto) {
    return await this.userService.updateUser(user);
  }

  @Delete(':rid')
  async deleteUser(@Param('rid') rid) {
    return await this.userService.deleteUser(rid);
  }
}
