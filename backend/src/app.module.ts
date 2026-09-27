import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          validationError: { target: false, value: false },
        }),
    },
  ],
})
export class AppModule {}
