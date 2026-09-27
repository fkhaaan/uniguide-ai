import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { jwtConfig } from './jwt.config.js';

@Module({
  imports: [JwtModule.registerAsync({ useFactory: jwtConfig })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
