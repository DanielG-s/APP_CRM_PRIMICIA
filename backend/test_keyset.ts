import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { MilleniumService } from 'src/modules/erp/millenium/millenium.service';
import { lastValueFrom } from 'rxjs';

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);
    const m = app.get(MilleniumService);
    let c = 0;
    let loops = 0;
    let currentId = 0;
    console.log('INICIANDO SYNC TEST...');
    while (true) {
        console.log(`Buscando a partir de trans_id=${currentId}...`);
        let r = await lastValueFrom(m['httpService'].get(m['apiUrl'] + '/clientes/lista', {
            params: { $format: 'json', $top: 1000, trans_id: currentId, $orderby: 'trans_id' },
            auth: { username: m['username'], password: m['pass'] }
        }));
        let batch = r.data.value || [];
        if (batch.length === 0) {
            console.log(`Lote vazio obtido. Fim com count=${c}`);
            break;
        }
        c += batch.length;
        let last = batch[batch.length - 1];
        console.log(`  Lote de ${batch.length} recebido (Total: ${c}). Último trans_id: ${last.trans_id}`);
        if (last.trans_id <= currentId) {
            console.log(`  Loop infinito detectado! last.trans_id (${last.trans_id}) <= currentId (${currentId}). Abortando.`);
            break;
        }
        currentId = last.trans_id;
        loops++;
        if (loops > 20) {
            console.log('Segurança: mais de 20 loops (20k registros). Parando o teste.');
            break;
        }
    }
    console.log('Contagem Final:', c);
    await app.close();
})();
