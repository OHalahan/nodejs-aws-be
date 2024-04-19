import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  await app.listen(port, () => {
    console.log(`Bff service is running: http://localhost:${port}`);
  });
}
bootstrap();
