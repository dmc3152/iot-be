import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { EasyconfigService } from "nestjs-easyconfig";
import { ExtractJwt } from "passport-jwt";
import { UserService } from "src/user/user.service";
import TokenPayload from "./tokenPayload.interface";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: EasyconfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
      secretOrKey: config.get('JWT_SECRET')
    });
  }
 
  async validate(payload: TokenPayload) {
    return this.userService.getUserById(payload.id);
  }
}