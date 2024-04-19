import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './services/app.service';
import { CacheService } from './services/cache.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { HttpModule } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
          load: [configuration],
        }),
        HttpModule,
      ],
      controllers: [AppController],
      providers: [AppService, CacheService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "proxy service works"', () => {
      expect(appController.main()).toBe('proxy service works');
    });
  });
});
