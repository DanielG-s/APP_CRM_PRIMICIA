import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import { createClerkClient } from '@clerk/clerk-sdk-node';

async function bootstrapFirstUser() {
    console.log('--- BOOTSTRAP INITIAL USER + CLERK ORG ---');

    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    try {
        // 1. Fetch users from Clerk
        const clerkResponse = await clerkClient.users.getUserList() as any;
        const clerkUsers: any[] = Array.isArray(clerkResponse) ? clerkResponse : (clerkResponse.data || []);

        if (clerkUsers.length === 0) {
            console.log('Nenhum usuário encontrado no Clerk. Crie uma conta no portal do Clerk primeiro.');
            await app.close();
            return;
        }

        // 2. Create/find Organization locally
        let org = await prisma.organization.findFirst() as any;
        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: 'Organização Principal (Primicia)',
                }
            });
            console.log(`Criada Organização Local: ${org.id}`);
        } else {
            console.log(`Organização Local existente: ${org.id} (clerkOrgId: ${org.clerkOrgId || 'nenhum'})`);
        }

        // 3. Create/find Clerk Organization and link it
        const firstClerkUser = clerkUsers[0];
        if (!org.clerkOrgId) {
            const clerkOrg = await clerkClient.organizations.createOrganization({
                name: org.name,
                createdBy: firstClerkUser.id,
            });

            await prisma.organization.update({
                where: { id: org.id },
                data: { clerkOrgId: clerkOrg.id } as any,
            });
            org.clerkOrgId = clerkOrg.id;
            console.log(`Criada Clerk Organization: ${clerkOrg.id} (${clerkOrg.name})`);
        } else {
            console.log(`Clerk Organization já vinculada: ${org.clerkOrgId}`);
        }

        // 4. Sync Clerk Users to Database
        for (const cUser of clerkUsers) {
            const email = cUser.emailAddresses[0]?.emailAddress;
            if (!email) continue;

            const existingUser = await prisma.user.findFirst({ where: { email } });

            if (!existingUser) {
                const name = cUser.firstName ? `${cUser.firstName} ${cUser.lastName || ''}`.trim() : 'Admin User';
                // @ts-ignore
                await prisma.user.create({
                    data: {
                        clerkId: cUser.id,
                        email: email,
                        name: name,
                        role: 'SUPER_ADMIN',
                        status: 'ACTIVE',
                        organizationId: org.id
                    } as any
                });
                console.log(`Usuário criado: ${email} (SUPER_ADMIN)`);
            } else {
                console.log(`Usuário já existe: ${email}`);
                if (!existingUser.clerkId) {
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { clerkId: cUser.id, status: 'ACTIVE' } as any
                    });
                    console.log(`  → clerkId vinculado.`);
                }
            }

            // 5. Ensure user is member of Clerk Org
            try {
                await clerkClient.organizations.createOrganizationMembership({
                    organizationId: org.clerkOrgId,
                    userId: cUser.id,
                    role: 'org:admin',
                });
                console.log(`  → Adicionado como admin na Clerk Org.`);
            } catch (e: any) {
                if (e.message?.includes('already') || e.status === 422) {
                    console.log(`  → Já é membro da Clerk Org.`);
                } else {
                    console.warn(`  → Falha ao adicionar à Clerk Org: ${e.message}`);
                }
            }
        }

        console.log('\n✅ Bootstrap concluído! Organização local + Clerk Organization sincronizadas.');
    } catch (err: any) {
        console.error('Erro durante o bootstrap:', err.message || err);
    } finally {
        await app.close();
    }
}

bootstrapFirstUser().catch(console.error);
