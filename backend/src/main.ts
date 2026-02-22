import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 1. Ativa a Validação Global (para o DTO funcionar e barrar dados errados)
  app.useGlobalPipes(new ValidationPipe());

  // 3. Proteção do BullBoard com Basic Auth (se habilitado)
  if (process.env.ENABLE_BULLBOARD === 'true') {
    app.use(
      '/admin/queues',
      basicAuth({
        users: {
          [process.env.BULLBOARD_USER || 'admin']: process.env.BULLBOARD_PASS || 'merxios-secret',
        },
        challenge: true,
      }),
    );
  }

  // 2. Configuração do Swagger (A Documentação)
  const config = new DocumentBuilder()
    .setTitle('CRM Merxios API')
    .setDescription('Documentação oficial da API do CRM/ERP')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Essa linha aqui cria a rota /api
  SwaggerModule.setup('api', app, document);

  // 3. Liga o servidor na porta 3000
  await app.listen(3000);
}
bootstrap();
