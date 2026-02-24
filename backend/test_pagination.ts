import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { MilleniumService } from 'src/modules/erp/millenium/millenium.service';
import { lastValueFrom } from 'rxjs';

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const m = app.get(MilleniumService);

    console.log('--- TESTANDO PAGINACAO CLIENTES POR PULAR ---');
    const r1 = await lastValueFrom(m['httpService'].get(m['apiUrl'] + '/clientes/lista', {
        params: { $format: 'json', $top: 5, $skip: 0 },
        auth: { username: m['username'], password: m['pass'] }
    }));

    const r2 = await lastValueFrom(m['httpService'].get(m['apiUrl'] + '/clientes/lista', {
        params: { $format: 'json', $top: 5, $skip: 5 },
        auth: { username: m['username'], password: m['pass'] }
    }));

    console.log('R1 (0-5):', r1.data.value.map((x: any) => ({ t: x.trans_id, n: x.cliente })));
    console.log('R2 (5-10):', r2.data.value.map((x: any) => ({ t: x.trans_id, n: x.cliente })));

    let hasSame = false;
    // test keyset trans_id
    console.log('--- TESTANDO PAGINACAO CLIENTES POR TRANS_ID ---');
    const lastId = r1.data.value[4].trans_id;
    const r3 = await lastValueFrom(m['httpService'].get(m['apiUrl'] + '/clientes/lista', {
        params: { $format: 'json', $top: 5, trans_id: lastId, $orderby: 'trans_id' },
        auth: { username: m['username'], password: m['pass'] }
    }));
    console.log(`R3 (trans_id=${lastId}):`, r3.data.value.map((x: any) => ({ t: x.trans_id, n: x.cliente })));

    await app.close();
})();
