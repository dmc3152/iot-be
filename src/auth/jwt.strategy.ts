import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { EasyconfigService } from "nestjs-easyconfig";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import TokenPayload from "./tokenPayload.interface";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: EasyconfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.headers?.authorization;
      }]),
      secretOrKey: config.get('JWT_SECRET')
    });
  }
 
  async validate(payload: TokenPayload) {
    return this.userService.getUserById(payload.id);
  }
}