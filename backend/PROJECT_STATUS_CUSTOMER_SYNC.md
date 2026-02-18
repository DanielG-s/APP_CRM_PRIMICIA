# Status do Projeto: Sincronização de Clientes (Fase 2)

**Data:** 16/02/2026
**Responsável:** Antigravity / Deepmind

## Resumo
Estamos na reta final da implementação da **Sincronização Completa de Clientes** (`Customer Sync`).
O objetivo é importar 160k clientes do Millennium ERP para o CRM.

## Conquistas Recentes
1.  **Paginação via Keyset (`trans_id`)**:
    *   Superamos as limitações da API do Millennium (que ignora `$skip`) usando o `trans_id` como cursor.
    *   Confirmamos que permite baixar a base inteira em blocos sequenciais.
2.  **Schema do Banco de Dados**:
    *   Removemos a restrição `@unique` do campo `email` na tabela `Customer`.
    *   Isso permite que "Contas Compartilhadas" (ex: Mãe e Filha com mesmo email) sejam salvas como clientes distintos.
3.  **Lógica de Detecção de Duplicidade**:
    *   Implementamos lógica para detectar "Duplicidade Real" (Mesmo Nome + Mesmo Email).
    *   Nesses casos, o sistema **pula** o cadastro do segundo ID e gera um aviso (`dataQualityIssues`) no cadastro original.
4.  **Refatoração de Tipagem**:
    *   Ajustamos `SalesService` e `SyncService` para usar `findFirst` em vez de `findUnique` para buscas por email, compatibilizando com a mudança de schema.

## Estado Atual (Onde Paramos)
O processo de sincronização (`scripts/manual-customer-sync.ts`) foi iniciado para validação final, mas apresentou erros.

### O Erro Encontrado
```
Error: Argument `store` is missing.
Invalid `this.prisma.customer.create()` invocation in customer-sync.service.ts
```

### Causa Identificada (Diagnóstico)
Durante a implementação da lógica de duplicidade, **apagamos acidentalmente** o bloco de código que atribuía a `storeId` (Loja Padrão) para novos clientes.

**Código Faltante:**
```typescript
if (!existing) {
    const defaultStore = await this.prisma.store.findFirst();
    if (defaultStore) {
        customerData.storeId = defaultStore.id;
    } else {
        return; // Pula se não tiver loja configurada
    }
}
```
Como esse bloco foi removido, `customerData.storeId` está `undefined` para novos clientes, causando falha no Prisma ao tentar criar o registro (pois `store` é obrigatório).

## Próximos Passos (Pendências)
1.  **Restaurar a Lógica de Store**: Reinserir o bloco de código acima em `src/modules/erp/sync/customer-sync.service.ts` antes da verificação de duplicidade.
2.  **Validar Sync**: Rodar novamente o `manual-customer-sync.ts` e confirmar que processa os 160k clientes sem erro.
3.  **Verificar Logs**: Confirmar que os avisos de duplicidade ("Skipping Duplicate Customer") estão aparecendo corretamente.

## Arquivos Modificados Recentemente
*   `src/modules/erp/sync/customer-sync.service.ts`: Implementação principal (precisa de correção).
*   `src/modules/erp/sale/sales.service.ts`: Ajuste para `findFirst`.
*   `src/modules/erp/sync/sync.service.ts`: Ajuste para `findFirst`.
*   `prisma/schema.prisma`: Remoção de unique em email.
*   `scripts/analyze-email-dupes.ts`: Script de diagnóstico (pode ser mantido ou descartado).
