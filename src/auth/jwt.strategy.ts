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
        var token = request?.headers?.authorization;
        if (token.startsWith('Bearer '))
          token = token.slice(7, token.length);

        return token;
      }]),
      secretOrKey: config.get('JWT_SECRET')
    });
  }
 
  async validate(payload: TokenPayload) {
    return this.userService.getUserById(payload.id);
  }
}