import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Trust Proxy (Para o Rate Limiting funcionar atrás de Nginx/AWS/Cloudflare)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // 2. Helmet (Headers de Segurança)
  app.use(helmet());

  // 3. CORS Dinâmico (Restrito a origens conhecidas)
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.ADMIN_URL || 'http://localhost:3000',
    // Permitir origens de preview do Vercel caso aplicável, etc.
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Liberar sem origin (ex: chamadas de S2S ou Postman em ambiente de dev local) 
      // Em produção estrita, pode ser interessante bloquear calls sem origin, mas isso pode quebrar webhooks.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // NestJS converte ForbiddenException adequadamente em 403 em vez de 500
        const { ForbiddenException } = require('@nestjs/common');
        callback(new ForbiddenException('Origin not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // 4. Ativa a Validação Global Estrita (para o DTO funcionar, barrar dados errados e evitar Mass Assignment)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Proteção do BullBoard com Basic Auth (se habilitado)
  if (process.env.ENABLE_BULLBOARD === 'true') {
    app.use(
      '/admin/queues',
      basicAuth({
        users: {
          [process.env.BULLBOARD_USER || 'admin']:
            process.env.BULLBOARD_PASS || 'merxios-secret',
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

  // 3. Liga o servidor na porta 3333 (para não conflitar com o frontend Next.js)
  await app.listen(process.env.PORT || 3333);
}
bootstrap();
