import { Module } from '@nestjs/common';
import { EasyconfigService, EasyconfigModule } from 'nestjs-easyconfig';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    EasyconfigModule.register({ path: './config/.env', safe: true }),
    JwtModule.registerAsync({
      imports: [
        EasyconfigModule.register({ path: './config/.env', safe: true }),
        UserModule,
        PassportModule
      ],
      useFactory: async (config: EasyconfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${config.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
      inject: [EasyconfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
