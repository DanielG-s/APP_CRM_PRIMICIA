# Millennium API Documentation

## GENERAL

###  ACTIVE

**Endpoint:** `GET /api/general/ active`

---

## /API/MILLENIUM_ECO/$HELP?PROFILE=&OBJECT=ACTIVEACTIVE

### atualizaid_estoque

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=activeactive/atualizaid_estoque`

---

### atualizaid_produto

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=activeactive/atualizaid_produto`

---

### atualizaid_produto_desagrupado

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=activeactive/atualizaid_produto_desagrupado`

---

### atualizaid_sku

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=activeactive/atualizaid_sku`

---

### importimagens

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=activeactive/importimagens`

---

## /API/MILLENIUM_ECO/$HELP?PROFILE=&OBJECT=ACTIVE

### PEDIDOS_PLATAFORMA#active

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=active/pedidos_plataforma#active`

---

## GENERAL

###  CAMPANHAS_VENDA

**Endpoint:** `GET /api/general/ campanhas_venda`

---

###  CLIENTES

**Endpoint:** `GET /api/general/ clientes`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do cliente. |
| cod_cliente | string (max 15) | Campo correspondente ao código do cliente. |
| cpf | string (max 20) | Campo correspondente ao CPF do cliente. |
| email | string (max 250) | Campo correspondente ao e-mail do cliente. |
| nome | string (max 250) | Campo correspondente ao nome do cliente. |
| rg | string (max 20) | Campo correspondente ao RG do cliente. |
| cel | string (max 20) | Celular do cliente |
| cnpj | string (max 20) | CNPJ do cliente |
| cod_cliente | string (max 12) | Código que identifica o cliente, caso este código não seja informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail, se for informado, o sistema irá atualizar o cliente com o código especificado. |
| cpf | string (max 14) | Cpf do cliente |
| dados_adicionais | string (max 30) | Informações adicionais do cliente |
| data_aniversario | date | Data de aniversário do cliente |
| e_mail | string (max 250) | Email do cliente |
| fantasia | string (max 60) | Nome fantasia do cliente |
| ie | string (max 15) | Inscrição Estadual do cliente |
| maladireta | boolean | Quando marcado indica que o cliente deseja receber Mala Direta |
| nome | string (max 60) | Nome do cliente |
| obs | string | Observação referente ao Cliente |
| parentesco | integer | Tipo de Parentesco do cliente(0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó) |
| pf_pj | string (max 2) | Tipo de cliente(PF = Pessoa Física, PJ = Pessoa Jurídica) |
| rg | string (max 12) | Rg do cliente |
| tipo_sexo | string (max 1) | Sexo do cliente(M = Masculino, F = Feminino, U = Não Aplicável) |
| tratamento | string (max 20) | Tratamento dado ao cliente(0 = Sr. , 1 = Sra. , 2 = Dr. , 3 = Dra. , 4 = Srta) |
| vitrine | integer | Id da vitrine |
| categorias | integer array | Registro de id(campo categoria) de categorias obtidas através do método "categorias.lista" |
| endereco_entrega | object array | Endereço do cliente |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| enderecos | object array | Endereço do cliente |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| aplicar_icms_st | boolean | Campo que identifica se deve ser aplicado ICMS ST para o cliente. |
| cel | string (max 20) | Celular do cliente / contato. |
| cnpj | string (max 20) | CNPJ do cliente. |
| cod_cliente | string (max 12) | Código do cliente Comportamentos É utilizado somente para atualização de cliente. Quando não encontrado um cliente correspondente é retornado erro. |
| cpf | string (max 14) | CPF do cliente. |
| dados_adicionais | string (max 30) | Informações adicionais do cliente. |
| data_aniversario | date | Data de aniversário do cliente. |
| ddd_cel | string (max 3) | DDD do celular do cliente / contato. |
| e_mail | string (max 100) | E-mail do cliente. |
| e_mail_nfe | string (max 250) | E-mail do cliente para emissão da nota fiscal eletrônica. |
| fantasia | string (max 120) | Nome fantasia do cliente. |
| id_externo | string (max 255) | ID externo do cliente associado a vitrine. Comportamentos O envio de Id_externo torna obrigatório o envio do Id da Vitrine |
| ie | string (max 20) | Inscrição estadual do cliente. |
| nao_considera_todos_entrega | boolean |  |
| nome | string (max 120) | Nome do cliente. |
| origem_cliente | string (max 10) | Origem do cadastro do cliente. |
| parentesco | integer | Tipo de parentesco do cliente. (0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó). |
| permite_enviar_newsletter | string (max 1) | Permite enviar NewsLetter - Informar T ou F |
| permite_enviar_sms | string (max 1) | Permite enviar SMS - Informar T ou F |
| pf_pj | string (max 2) | Tipo de cliente. (PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | RG do Cliente. |
| tipo_cli | string (max 1) | 0-Atacado 1-Varejo 3-Franquia 4-Representante 5-Funcionário 6-Catálogo 2-Todos 7-Grupo |
| tipo_empresa_descricao | string (max 60) | Descrição do tipo da empresa |
| tipo_sexo | string (max 1) | Sexo do cliente. (M = Masculino, F = Feminino, U = Não Aplicável). |
| tratamento | string (max 20) | Tratamento dado ao cliente. (0 = Sr. , 1 = Sra. , 2 = Dr. , 3 = Dra. , 4 = Srta). |
| ufie | string (max 3) | Estado da inscrição estadual do cliente. |
| vitrine | integer | ID da vitrine. |
| contatos | object array |  |
| bip | string (max 20) | Número do BIP |
| cargo | string (max 30) | Cargo |
| celular | string (max 20) | Número do celular |
| cod_bip | string (max 10) | Código do BIP |
| cpf | string (max 14) | Número do CPF |
| data_aniversario | date | Data de aniversário |
| ddd_celular | string (max 4) | DDD do celular |
| departamento | string (max 50) | Descrição do departamento |
| e_mail | string (max 100) | Endereço de email |
| gerador_contato | integer |  |
| nome | string (max 60) | Nome do contato |
| endereco | object array | Endereço do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_cobranca | object array | Endereço de cobrança do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_entrega | object array | Endereço de entrega do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| cliente | integer |  |
| cod_endereco | integer |  |
| cliente | integer | Campo correspondente ao cliente. |
| origem_cliente | string (max 10) | Campo correspondente a origem do cliente. |
| trans_id | integer | Campo correspondente ao trans_id do cliente. |
| vitrine | integer | Campo correspondente ao ID da vitrine. |
| cel | string (max 20) | Celular do cliente |
| cnpj | string (max 20) | CNPJ do cliente |
| cod_cliente | string (max 12) | Código identificando o cliente. Se este código não for informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail. Se for informado, o sistema irá atualizar o cliente com o código especificado. |
| cpf | string (max 14) | Cpf do cliente |
| data_aniversario | date | Data de aniversário do cliente |
| data_atualizacao | date | Data da Última Atualização do cadastro do Cliente |
| data_cadastro | date | Data de cadastro do Cliente |
| ddd_celular | string (max 4) |  |
| e_mail | string (max 250) | Email do cliente |
| fantasia | string (max 120) | Nome fantasia do cliente |
| id_externo | string (max 255) | Id Externo do cliente |
| ie | string (max 15) | Inscrição Estadual do cliente |
| maladireta | boolean | Indica que o cliente deseja receber Mala Direta |
| nome | string (max 120) | Nome do cliente |
| obs | string | Observação referente ao Cliente |
| origem_cliente | string (max 10) | Origem de Cadastro do Cliente |
| parentesco | integer | Tipo de Parentesco do cliente(0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó) |
| permite_enviar_newsletter | boolean |  |
| permite_enviar_sms | boolean |  |
| pf_pj | string (max 2) | Tipo da pessoa do cliente(PF = Pessoa Física, PJ = Pessoa Jurídica) |
| rg | string (max 12) | Rg do cliente |
| tipo_sexo | string (max 1) | Sexo do cliente(M = Masculino, F = Feminino, U = Não Aplicável) |
| trans_id | integer | Trans_id obtido através do método clientes.lista |
| tratamento | string (max 20) | Tratamento dado ao cliente(0 = Sr., 1 = Sra, 2 = Dr., 3 = Dra, 4 = Srta) |
| ufie | string (max 3) | Estado da Inscrição Estadual do cliente |
| vitrine | integer | Id da vitrine |
| categorias | integer array | Registro de ids(campo categoria) de categorias obtidos através do método "categorias.lista" |
| contato | object array |  |
| bip | string (max 20) | Número do BIP |
| cargo | string (max 30) | Cargo |
| celular | string (max 20) | Número do celular |
| cod_bip | string (max 10) | Código do BIP |
| cpf | string (max 14) | Número do CPF |
| data_aniversario | date | Data de aniversário |
| ddd_celular | string (max 4) | DDD do celular |
| departamento | string (max 50) | Descrição do departamento |
| e_mail | string (max 100) | Endereço de email |
| gerador_contato | integer |  |
| nome | string (max 60) | Nome do contato |
| enderecos | object array | Endereço do cliente |
| bairro | string (max 200) | Campo correspondente ao bairro do endereço do cliente. |
| cep | string (max 9) | Campo correspondente ao cep do endereço do cliente. |
| cidade | string (max 60) | Campo correspondente a cidade do cliente. (Como na tabela do IBGE). |
| cod_endereco | integer | Campo correspondente ao código do endereço do cliente |
| cod_mun_ibge | string (max 6) | Campo correspondente ao código do município do IBGE. |
| complemento | string (max 200) | Campo correspondente ao complemento do endereço do cliente. |
| contato | string (max 60) | Campo correspondente ao nome do contato que estará no endereço informado. |
| ddd | string (max 4) | Campo correspondente ao DDD do telefone do cliente. |
| ddd_cel | string (max 5) | Campo correspondente ao DDD do celular do cliente. |
| desc_tipo_endereco | string (max 20) | Campo correspondente a descrição do tipo do endereço. |
| dicas_endereco | string (max 30) | Campo correspondente as instruções de direção ou ponto de referência do endereço. |
| estado | string (max 3) | Campo correspondente ao estado do cliente. (Como na tabela do IBGE). |
| fax | string (max 20) | Campo correspondente ao fax do cliente. |
| fone | string (max 20) | Campo correspondente ao telefone do cliente. |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento com o cliente. |
| logradouro | string (max 200) | Logradouro do endereço do contato |
| nome_pais | string (max 50) | Campo correspondente ao nome do país em que o cliente reside. |
| numero | string (max 15) | Campo correspondente ao número da residência do endereço do cliente. |
| pais_dest | string (max 20) | Campo correspondente ao país do cliente. |
| ramal | string (max 10) | Campo correspondente ao ramal do cliente. |
| tipo_sexo | string (max 1) | Campo correspondente ao tipo do sexo do cliente. ('M'='Masculino';'F'='Feminino';'U'='Não Aplicável'). |
| filiais | object array |  |
| cod_filial | string (max 10) |  |
| desc_filial | string (max 120) |  |

---

###  COTAS

**Endpoint:** `GET /api/general/ cotas`

---

## /API/MILLENIUM_ECO/$HELP?PROFILE=&OBJECT=CRM

### CHAMADOS#crm

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=crm/chamados#crm`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| protocolo | string (max 30) | Campo correspondente ao protocolo do chamado. |
| protocolo_externo | string (max 30) | Campo correspondente ao protocolo externo do chamado. |
| trans_id | integer | Campo correspondente ao trans ID da tabela chamado. |
| acao_divergencia | string (max 1) | 0 - Cliente desistiu de todo o pedido – PEDIDO CANCELADO 1 - Cliente desistiu somente do produto com divergência – PEDIDO PARCIAL 2 - Cliente irá aguardar chegada do produto com divergência – PEDIDO FICARÁ PARADO |
| assunto | string (max 100) | Assunto do chamado |
| chamado | integer |  |
| cliente_contatado | boolean | Identifica se o cliente foi contatado |
| cod_motivo | string (max 10) | Código do Motivo de Chamado: |
| cod_origem | string (max 10) | Código da Origem de Chamado |
| cod_submotivo | string (max 10) | Código do Sub Motivo de Chamado |
| cod_tipo | string (max 10) | Código do tipo de Chamado |
| cpf | string (max 14) | CPF do cliente que está devolvendo a mercadoria |
| data_abertura | timestamp | Data de abrtura do chamado |
| data_cancelamento_pedido | timestamp | Quando o pedido é cancelado, e chamado está vinculado ao pedido |
| data_fechamento | timestamp | Data de fechamento do chamado |
| data_solucao | timestamp | Data de solução previsão calculada de acordo com o SLA e o calendário |
| data_status_workflow | timestamp | Data em que o Chamado entrou no status do workflow |
| desc_cond_pgto | string (max 50) | Descrição da Condição de Pagamento do Pedido |
| desc_motivo | string (max 50) | Descrição do Motivo de Chamado: |
| desc_origem | string (max 100) | Descrição da Origem de Chamado |
| desc_submotivo | string (max 50) | Descrição do Sub Motivo de Chamado |
| desc_tipo | string (max 100) | Descrição do Tipo de Chamado |
| descricao | string (max 255) | Descrição do Chamado |
| e_mail | string (max 120) | e mail do cliente que está devolvendo a mercadoria |
| forma_devolucao | string (max 50) | Forma de devolução |
| motivo | integer | ID do Motivo de Chamado: |
| operacao | string (max 1) | 1 Pré-Chamado transformado em chamado; 2 Alteração do Chamado; 3 Fechamento de Chamado; 4 Alteração de Status de Workflow; 5 Exclusão de Chamado |
| origem | integer | Id da Origem de Chamado |
| pedido | string (max 20) | Número do pedido de venda: quando este número é preenchido, o programa cria o chamado já vinculando esse documento. |
| protocolo | string (max 30) | Id do protocolo |
| protocolo_externo | string (max 30) | Protocolo externo |
| protocolo_rastreio | string (max 50) | Código da Postagem |
| responsavel | string (max 200) | Nome do usuário ou grupo Responsável do Chamado |
| situacao | integer | 0 Aberto; 1 Fechado; 2 Pré Chamado |
| status_pedido | string (max 20) | Status Conforme Consulta de Pedido: FATURADO, SEPARACAO, EMBALADO, SEPARADO, ESTOQUE, RESERVADO |
| status_pedido_wf | string (max 50) | Status Conforme Consulta de Pedido: FATURADO, SEPARACAO, EMBALADO, SEPARADO, ESTOQUE, RESERVADO |
| status_workflow | string (max 50) | Status do workflow do chamado |
| submotivo | integer | ID do Sub Motivo de Chamado |
| tipo | integer | Id do Tipo de Chamado |
| trans_id | integer | Trans id da tabela chamado |
| valor_pedido | float | Valor do pedido de Venda |
| comentario_chamados | object array |  |
| comentario | string (max 200) | Campo correspondente ao comentário. |
| data | date | Campo correspondente a data do comentario. |
| usuario | string (max 50) | Campo correspondente ao usuário que realizou o comentario. |
| lancamentos | object array |  |
| data_emissao | date | Campo correspondente a data de emissão do lançameto. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_tipo_pagamento | string (max 30) | Campo correspondente a descrição do tipo de pagamento do lançamento. |
| efetuado | boolean | Campo que indica se o lançamento foi efetuado. (T = Pago,F = em aberto). |
| n_documento | string (max 35) | Campo correspondente ao número do documento do lançamento. |
| natureza | string (max 20) | Campo correspondente a natureza do lançamento. |
| obs_baixa | string (max 255) | Campo correspondente a observação do lançamento |
| tipo_pgto | integer | Campo correspondente ao código interno do tipo de pagamento. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_pago | float | Campo correspondente ao valor do lançamento pago. |
| pedido_venda | object array |  |
| lancamentos_pedidov | object array | Campo correspondente aos lançamentos do pedido de venda. |
| desc_tipo | string (max 40) | Campo correspondente a descrição do tipo de pagamento do pedido. |
| tipo_pgto | integer | Campo correspondente ao tipo de pagamento do pedido. |
| valor | float | Campo correspondente ao valor do pedido. |
| produtos_chamados | object array |  |
| barra | string (max 20) | Campo correspondente ao código de barra. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto. |
| desc_cor | string (max 60) | Campo correspondente a descrição da cor. |
| desc_estama | string (max 50) | Campo correspondente a descrição da estampa. |
| desc_produto | string (max 255) | Campo correspondente a descrição do produto. |
| obs | string (max 200) | Campo correspondente a observação. |
| tamanho | string (max 5) | Campo correspondente ao tamanho. |
| retiradas_autorizadas | object array |  |
| cpf | string (max 14) | Campo correspondente ao CPF da pessoa autorizada. |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento da pessoa autorizada. |
| nome | string (max 100) | Campo correspondente ao nome da pessoa autorizada. |
| tarefas_chamados | object array |  |
| data_limite | date | Campo correspondente a data limite da tarefa. |
| desc_tarefa | string (max 200) | Campo correspondente a descrição da tarefa. |
| responsavel | string (max 100) | Campo correspondente ao responsável da tarefa. |
| situacao | string (max 50) | Campo correspondente a situação da terafa. ("Aberto","Fechado") |
| troca_devolucao | object array |  |
| data | date | Campo correspondente a data da troca ou devolução. |
| nota | integer | Campo correspondente ao número da nota. |
| novo_pedido | string (max 20) | Campo correspondente a criação de um novo pedido através do Millennium em um processo de troca. |
| protocolo_troca | string (max 20) | Campo correspondente ao ID da troca ou devolução. |
| status_workflow_novopedido | string (max 50) | Campo correspondente ao status do work flow do novo pedido. |
| valor_novo_pedido | float | Campo correspondente ao valor do novo pedido em processo de troca. |

---

### CHAMADOS

**Endpoint:** `GET /api//api/millenium_eco/$help?profile=&object=crm/chamados`

---

## GENERAL

###  CRM

**Endpoint:** `GET /api/general/ crm`

---

###  FILIAIS

**Endpoint:** `GET /api/general/ filiais`

---

###  FORNECEDORES

**Endpoint:** `GET /api/general/ fornecedores`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| cel | string (max 20) | Campo correspondente ao celular do fornecedor. |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do fornecedor. |
| cod_fornecedor | string (max 10) | Campo correspondente ao código do fornecedor. Comportamento - Se este código não for informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail. - Se for informado, o sistema irá atualizar o fornecedor com o código especificado. |
| cpf | string (max 14) | Campo correspondente ao CPF do fornecedor. |
| data_aniversario | date | Campo correspondente a data de aniversário do fornecedor. |
| e_mail | string (max 250) | Campo correspondente ao email do fornecedor. |
| fantasia | string (max 60) | Campo correspondente a fantasia do fornecedor. |
| gerador_origem | integer | Campo correspondente ao gerador origem do fornecedor. |
| ie | string (max 15) | Campo correspondente a inscrição estadual do fornecedor. |
| maladireta | boolean | Campo que indica se o fornecedor deseja receber mala direta. |
| nome | string (max 60) | Campo correspondente ao nome do fornecedor. |
| obs | string | Campo correspondente a observação do fornecedor. |
| pf_pj | string (max 2) | Campo correspondente o tipo da pessoa do fornecedor(PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | Campo correspondente ao rg do fornecedor. |
| tipo_sexo | string (max 1) | Campo correspondente ao sexo do fornecedor(M = Masculino, F = Feminino, U = Não Aplicável). |
| vitrine | integer | Campo correspondente id da vitrine. |
| endereco | object array | Campo correspondente a lista de endereços do fornecedor. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| cod_fornecedor | string (max 10) |  |
| fornecedor | integer |  |

---

###  FUNCIONARIOS

**Endpoint:** `GET /api/general/ funcionarios`

---

###  LANCAMENTOS

**Endpoint:** `GET /api/general/ lancamentos`

---

###  MODULE

**Endpoint:** `GET /api/general/ module`

---

###  NFE

**Endpoint:** `GET /api/general/ nfe`

---

###  PEDIDO_VENDA

**Endpoint:** `GET /api/general/ pedido_venda`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| acerto | float | Valor em percentual de acerto (Acréscimo ou desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará sobre o valor do campo "TOTAL" do objeto principal |
| acessa_presente | boolean | Campo que indica que o pedido de venda acessa o presente. |
| analisador_risco | integer | Campo correspondente ao análisador de risco. |
| aprovado | boolean | Campo que indica que o pedido de venda está aprovado |
| autorizacao_cartao | string (max 10) | Campo utilizado quando não há adiantamento financeiro |
| cif_fob | string (max 1) | Campo que indica quem paga o frete. São eles: - C = CIF(empresa paga frete) - F = FOB(cliente paga frete) |
| cliente | integer | Código do cliente dentro do Millennium. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.CLIENTES.INCLUIROUALTERAR. Comportamentos - É obrigatório quando não há dados no objeto "DADOS_CLIENTE"; - Se o código do cliente não existir no Millennium à API irá retornar mensagem de erro; |
| cnpj_fornecedor | string (max 19) | Campo que informa o Fornecedor de Devolução através do CNPJ |
| cnpj_transportadora | string (max 19) | Campo correspondente ao CNPJ da transportadora. Comportamento - Será usado para buscar à transportadora, se o mesmo não for encontrado, buscará pelo “NOME_TRANSPORTADORA” |
| cod_colecao | string (max 15) | Código da coleção |
| cod_endereco | integer | Código do endereço do Cliente. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.CLIENTES.INCLUIROUALTERAR. Comportamento - Se houver informação, o código do endereço deve corresponder ao cliente informado no campo "CLIENTE" |
| cod_evento | string (max 15) |  |
| cod_filial | string (max 10) | Código Esterno da Filial Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| cod_pedido_mkt_place | string (max 150) | Código do pedido no marketplace |
| cod_pedidov | string (max 12) | Código do pedido. Comportamentos - Se for omitido, à API irá gerar automaticamente um código válido. - Se for enviado vazio ou null, à API irá retornar mensagem de erro. - Se o código já existir no Millennium e o pedido corresponder a um pedido em análise (pedido incluído na API com o campo "PRE_PEDIDO" = true),a integração substituirá esse pedido, senão retornará mensagem de erro. |
| cod_prazo_entrega | string (max 3) | Campo correspondente ao código do prazo de entrega. Comportamento - Se houver informação, à API verifica se o código do prazo está cadastrado, caso não esteja, à API retornará uma mensagem de erro. |
| cod_tabela_preco_venda | string (max 8) | Código da tabela de preço de venda |
| cod_usuario_na_plataforma | string (max 60) |  |
| cod_vendedor | string (max 7) | Codigo do vendedor (Funcionario) do millennium |
| comissao_f | float | Percentual de comissão do funcionário do pedido de venda |
| comissao_r | float | Percentual de comissão do representante do pedido de venda |
| cortesia | float | valor absoluto de cortesia (Acréscimo ou desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará no valor enviado para o campo "TOTAL" do objeto principal e "VALOR_INICIAL" do objeto de "LANCAMENTOS" |
| cpnj_plataforma | string (max 19) |  |
| dados_adicionais | string (max 100) | Campo correspondente aos dados adicionais do pedido de venda |
| data_emissao | date | Data de emissão do pedido Comportamento - Se for omitido, à API irá gerar automaticamente a data atual. |
| data_emissao_nf | date | Quando preenchido junto com os dados da nota, será a Data de Emissão da NF |
| data_entrega | date | Data de entrega do pedido de venda |
| data_entrega_final | date | Campo correspondente a data final de entrega do pedido |
| datahora_agendamento | timestamp | Campo correspondente a data e hora do agendamento para entrega do pedido |
| datahora_expedicao | timestamp | data e hora de expedição do pedido |
| dispositivo_compra | string (max 40) | Campo correspondente ao dispositivo de compra |
| email_vendedor | string (max 100) | Campo correspondente ao e-mail do vendedor. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| encomenda | boolean | Campo que indica que este é um pedido encomenda filho. Comportamento - Se ele for true, o campo “ENCOMENDA” do objeto produtos, não poderá ser true, senão à API retornará mensagem de erro |
| endereco_presente | integer | Campo correspondente ao endereço do presente. Comportamento - Se o campo “ACESSA_PRESENTE” for true e se Endereço do Presente igual a vazio, então “ENDERECO_PRESENTE” será igual ao “COD_ENDERECO”. |
| endereco_retirada | integer | Código do endereço de retirada do ponto de retirada. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.PONTOS_RETIRADA.INCLUIROUALTERAR. Comportamento - Se houver informação, o código do endereço de retirada deve corresponder ao ponto de retirada informado no campo "PONTO_RETIRADA" |
| enviado | boolean | Campo que deixa o saldo de reserva para os itens do pedido, visível na API |
| faturar | string (max 1) | Campo que indica como o pedido de venda deverá ser faturado. São eles: 'N'='Não Faturar', 'I'='Importar documento XML', 'F'='Faturar - Indisponível por enquanto' |
| id_carrinho | string (max 50) | Id do carrinho na plataforma |
| idnfe | string (max 50) | Campo correspondente ao ID da nota fiscal. Comportamento - É necessário informar quando “MODELO” for diferente de 'ECF' e “FATURAR” for igual 'I' |
| ignorar_analise_risco | boolean | Indica que a analise de risco será ignorada |
| manter_filial_transferencia | boolean |  |
| modalidade_frete | string (max 1) | Campo que indica modalidade de frete e quem irá pagar pelo mesmo. São eles: 0 = (Emitente - quem compra paga, o valor não é incluído no pedido), 1 = ( Dest/Rem), 2 = (Terceiros), 9 = ( Sem Frete), 5 = ( Emitente (soma Frete) - valor não é incluído no pedido). Comportamentos - Se o campo “ENCOMENDA” do objeto principal for true, modalidade será 9. - Se o modalidade for diferente de 0 e 9, o “V_FRETE” será somado ao valor líquido da venda. |
| modelo | string (max 3) | Campo correspondente ao modelo. São eles 'ECF','55','59','65' (“ECF” – Emissor de cupom fiscal , "55" NFe, "59" Sat-cfe , "65" NFCe') Comportamento - Se “FATURAR” for igual a “I” ou “F” e o “MODELO” diferente de um dos anteriores, à API retornará uma mensagem de erro. |
| n_pedido_cliente | string (max 50) | Número do pedido do cliente, não é obrigatório |
| n_serie | string (max 20) | Campo correspondente ao número de fabricação. Comportamento - É necessário informar quando “MODELO” for igual a 'ECF' ou '59' |
| nf_saida | integer | Nota fiscal de saída para troca ou devolução. Comportamento - Se possuir um valor, à API verifica se há “PROTOCOLO_TROCA_DEV”, caso não tenha ele assume que a informação é um código de uma nota fiscal de um pedido original/anterior, utilizado para efetuar à troca ou a devolução |
| nfce_server | string (max 5) |  |
| nome_contato_cliente | string (max 60) | Nome do contato do cliente |
| nome_mkt_place | string (max 100) |  |
| nome_representante | string (max 60) | Campo correspondente ao nome do representante. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome do representante e se não for encontrado retornará mensagem de erro. |
| nome_transportadora | string (max 250) | Nome da transportadora cadastrada no sistema. Comportamento - A integração irá tentar buscar uma transportadora que corresponda a ao valor enviado para esse campo dentro dos cadastros do Millennium, primeiro |
| nome_vendedor | string (max 60) | Campo correspondente ao nome do vendedor. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| nota | string (max 10) | Campo correspondente a nota fiscal ou cupom. Comportamento - É necessário informar quando “FATURAR” for igual 'I' ou 'F' |
| nsu_cartao | string (max 40) | Campo utilizado quando não há adiantamento financeiro |
| numecf | integer | Campo correspondente ao número da ECF - Emissor de cupom fiscal. Comportamento - É necessário informar quando “MODELO” for igual 'ECF' e “FATURAR” for igual 'I' ou 'F' |
| numero_objeto | string (max 40) | Código de rastreio do pedido |
| obs | string | Observação do pedido de venda |
| obs2 | string | Campo correspondente as observações 2 do pedido de venda |
| orcamento | boolean | Indica que o pedido será um orçamento |
| origem_pedido | string (max 10) | Campo correspondente a descrição de origem do pedido. - Exemplos: (NORMAL,WEB SITE) Comportamento - Se omitido, à API deixará como default "Web Site" |
| pdf_etiqueta_transporte | string | Etiqueta a ser impressa no momento do faturamento. A etiqueta de transporte deve estar codificado em Base64. Os formatos aceitos são PDF e ZPL. |
| pedido_parcial_e_commerce | boolean |  |
| periodo_entrega | string (max 1) | Campo que indica o período de entrega. São eles: 'M'='Manhã'; 'T'='Tarde'; 'N'='Noite' |
| plataforma_financeiro | boolean |  |
| ponto_retirada | integer | Código do ponto de retirada dentro do Millennium. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.PONTOS_RETIRADA.INCLUIROUALTERAR |
| prazoentregadias | integer | Prazo de entrega dias úteis |
| pre_pedido | boolean | Campo que indica que é um pré-pedido temporário. Comportamento - Se 'true', o Status do pedido ficará "1" – Em análise e “RESEVAR” true. Quando o pedido for efetivado, isto é, incluído com o campo “COD_PEDIDOV” igual ao pré-pedido, o pré será substituído pelo efetivado, nesse caso o campo “PRE_PEDIDO” deverá ser 'false' |
| protocolo_agendamento | string (max 40) | Código do protocolo de agendamento |
| protocolo_troca_dev | string (max 15) | Protocolo de devolução do pedido de venda ou protocolo de troca. Comportamento - Se o campo “PROTOCOLO_TROCA_DEV” for diferente de vazio, à API irá buscar a nota Fiscal de saída(Troca e Devolução) e atribuir o resultado no campo “NF_SAIDA”, não encontrando à API retornará uma mensagem de erro |
| pvadiantamento | boolean | Campo que indica que será gerado o Adiantamento financeiro para um pedido de venda |
| quantidade | float | Quantidade de itens do Pedido de Venda Comportamento - Este campo é resultado da soma do campo "QUANTIDADE" do objeto "PRODUTOS" |
| representante_externo | string (max 250) | Representante externo configurado na tabela de mapeamento do representante da vitrine Comportamento -Somente é utilizado se o campo vitrine for informado -Somente é utilizado se a tabela de mapeamento conter ao menos um mapeamento |
| serie | string (max 3) | Campo correspondente ao número de série da nota fiscal. Comportamento - É necessário informar quando “MODELO” for igual '55' ou '65' e “FATURAR” for igual 'I' ou 'F' |
| status_analise_risco | string (max 1) | Status da análise de risco 0- APROVADO; 1- REPROVADO; 2- AGUARANDO ANÁLISE; 3- ERRO; |
| suspenso | boolean | Indica se o pedido esta suspenso |
| total | float | Valor total do Pedido de Venda |
| transacao_analise_risco | string (max 50) | Número da transação que identifica a análise de risco na operadora de risco |
| v_acerto | float | Valor absoluto do acerto (Acréscimo ou Desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará no valor enviado para o campo "VALOR_INICIAL" do objeto de "LANCAMENTOS". |
| v_frete | float | Valor do frete. Comportamentos - Será usado para calcular o valor líquido do pedido quando “MODALIDADE_FRETE” for diferente de 0 e 9. - Se houver um valor, deve haver também uma transportadora “NOME_TRANSPORTADORA”, senão à API retornará uma mensagem de erro. |
| v_frete_calc | float | Campo correspondente ao valor do frete calculado pela transportadora Comportamento - Se vazio, o mesmo irá assumir o valor do campo “V_FRETE” |
| v_frete_custo | float | Custo real do frete cobrado pela transportadora |
| validade | date | Validade do Pedido de Venda |
| vitrine | integer | Campo correspondente ao ID da vitrine. Comportamento - Se for informado algum ID, o mesmo deverá estar cadastrado ou à API retornará uma mensagem de erro. |
| xml_doc | string | Campo correspondente ao XML do documento informado no campo “MODELOS”. Comportamento - É obrigatório quando “MODELOS” for “55,59,65” e “FATURAR” for igual “I” |
| campanhas | object array | Campo correspondente as campanhas |
| cod_campanha | string (max 6) | Campo correspondente ao código da campanha. |
| conteudo | string (max 40) | Campo correspondente ao conteúdo da campanha. |
| data * | date | Campo correspondente a data inicial da campanha. |
| data_final | date | Campo correspondente a data final da campanha. |
| descricao * | string | Campo correspondente a descrição da campanha. |
| midia | string (max 40) | Campo correspondente a mídia da campanha. |
| nome * | string (max 40) | Campo correspondente ao nome da campanha. |
| origem | string (max 40) | Campo correspondente a origem da campanha. |
| recorrencia | integer | Campo correspondente a recorrencia da campanha. |
| situacao * | string (max 20) | Campo correspondente a situação da campanha(0=Não Iniciada,1=Em Execução,2=Finalizada. |
| template_html | string | Campo correspondente ao template da campanha no formato HTML. |
| tempo_recorrencia | integer | Campo correspondente ao tempo de recorrencia da campanha. |
| termo | string (max 40) | Campo correspondente ao termo da campanha. |
| tipo * | string (max 20) | Campo correspondente ao tipo da campanha(0=Telefone,1=Mala Direta,2=Email,3=FAX). |
| dados_cliente | object array | Campo correspondente aos dados do cliente |
| aplicar_icms_st | boolean | Campo que identifica se deve ser aplicado ICMS ST para o cliente. |
| cel | string (max 20) | Celular do cliente / contato. |
| cnpj | string (max 20) | CNPJ do cliente. |
| cod_cliente | string (max 12) | Código do cliente Comportamentos É utilizado somente para atualização de cliente. Quando não encontrado um cliente correspondente é retornado erro. |
| cpf | string (max 14) | CPF do cliente. |
| dados_adicionais | string (max 30) | Informações adicionais do cliente. |
| data_aniversario | date | Data de aniversário do cliente. |
| ddd_cel | string (max 3) | DDD do celular do cliente / contato. |
| e_mail | string (max 250) | E-mail do cliente. |
| e_mail_nfe | string (max 250) | E-mail do cliente para emissão da nota fiscal eletrônica. |
| fantasia | string (max 120) | Nome fantasia do cliente. |
| id_externo | string (max 255) | ID externo do cliente associado a vitrine. Comportamentos O envio de Id_externo torna obrigatório o envio do Id da Vitrine |
| ie | string (max 15) | Inscrição estadual do cliente. |
| nome | string (max 120) | Nome do cliente. |
| origem_cliente | string (max 10) | Origem do cadastro do cliente. |
| parentesco | integer | Tipo de parentesco do cliente. (0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó). |
| permite_enviar_newsletter | string (max 1) | Permite enviar NewsLetter - Informar T ou F |
| permite_enviar_sms | string (max 1) | Permite enviar SMS - Informar T ou F |
| pf_pj | string (max 2) | Tipo de cliente. (PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | RG do Cliente. |
| tipo_cli | string (max 1) | 0-Atacado 1-Varejo 3-Franquia 4-Representante 5-Funcionário 6-Catálogo 2-Todos 7-Grupo |
| tipo_sexo | string (max 1) | Sexo do cliente. (M = Masculino, F = Feminino, U = Não Aplicável). |
| tratamento | string (max 20) | Tratamento dado ao cliente. (0 = Sr. , 1 = Sra. , 2 = Dr. , 3 = Dra. , 4 = Srta). |
| ufie | string (max 3) | Estado da inscrição estadual do cliente. |
| vitrine | integer | ID da vitrine. |
| endereco | object array | Endereço do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_cobranca | object array | Endereço de cobrança do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_entrega | object array | Endereço de entrega do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| dados_fornecedor | object array | Campo correspondente aos dados do fornecedor |
| cel | string (max 20) | Campo correspondente ao celular do fornecedor. |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do fornecedor. |
| cod_fornecedor | string (max 10) | Campo correspondente ao código do fornecedor. Comportamento - Se este código não for informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail. - Se for informado, o sistema irá atualizar o fornecedor com o código especificado. |
| cpf | string (max 14) | Campo correspondente ao CPF do fornecedor. |
| data_aniversario | date | Campo correspondente a data de aniversário do fornecedor. |
| e_mail | string (max 250) | Campo correspondente ao email do fornecedor. |
| fantasia | string (max 60) | Campo correspondente a fantasia do fornecedor. |
| gerador_origem | integer | Campo correspondente ao gerador origem do fornecedor. |
| ie | string (max 15) | Campo correspondente a inscrição estadual do fornecedor. |
| maladireta | boolean | Campo que indica se o fornecedor deseja receber mala direta. |
| nome | string (max 60) | Campo correspondente ao nome do fornecedor. |
| obs | string | Campo correspondente a observação do fornecedor. |
| pf_pj | string (max 2) | Campo correspondente o tipo da pessoa do fornecedor(PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | Campo correspondente ao rg do fornecedor. |
| tipo_sexo | string (max 1) | Campo correspondente ao sexo do fornecedor(M = Masculino, F = Feminino, U = Não Aplicável). |
| vitrine | integer | Campo correspondente id da vitrine. |
| endereco | object array | Campo correspondente a lista de endereços do fornecedor. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| dados_ponto_retirada | object array | Campo correspondente aos dados do ponto de entrega |
| nome | string (max 120) | Nome do ponto de retirada |
| endereco | object array | Endereço do ponto de retirada |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string (max 30) | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| doacoes | object array | Doações que foram feitas junto com o pedido |
| descricao | string (max 30) | Campo correspondente a descrição da doação. |
| valor | float | Campo correspondente ao valor da doação. |
| lancamentos | object array | Laçamentos do Pedido de Venda |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| mensagens | object array | Campo correspondente as mensagens do pedido de venda |
| assinatura | string (max 100) | Campo correspondente a assinatura da mensagem. |
| cod_endereco | integer | Campo correspondente ao endereço da mensagem. |
| data_entrega | date | Campo correspondente a data de entrega da mensagem. |
| imagem | I | Campo correspondente a imagem. |
| imagem_mensagem * | boolean | Campo que indica se a imagem da mensagem é uma mensagem ou um texto. Comportamento - Se marcar essa opção, a imagem será tratada como uma mensagem de texto. |
| impresso * | boolean | Campo que indica se a mensagem já foi impressa. |
| texto | string | Campo correspondente ao texto. |
| tipo * | string (max 1) | Campo correspondente ao tipo da mensagem(0='Texto',1='Imagem',2='Envelope'). |
| produtos | object array | Itens do Pedido de Venda |
| al_cofins | float | AL COFINS Comportamento Se omitido pega o valor do parâmetro geral |
| al_fcp | float |  |
| al_fcp_st | float |  |
| al_icms | float | AL ICMS(00, 20- 102 e T Obrigatório) |
| al_icmss | float |  |
| al_ipi | float |  |
| al_pis | float | AL PIS Comportamento Se omitido pega o valor do parâmetro geral |
| alteracao_bloqueada | boolean | Indica que não será permitido a alteração deste sku no pedido de venda |
| altura | float | Altura do produto |
| b_fcp | float |  |
| b_fcp_st | float |  |
| b_icms | float | Base ICMS. Comportamento Se não informado, assume o valor do produto |
| b_icmss | float |  |
| b_ipi | float |  |
| barra | string (max 20) | Código de barras |
| bicm_orig | float |  |
| bonificado | boolean | Indica que o item é bonificado |
| brindesite | boolean | Indica que o item é um brinde |
| cbenef | string (max 8) |  |
| cfop | string (max 5) | CFOP do produto |
| cod_campanha | string (max 15) | Código da campanha de venda do produto |
| cod_filial | string (max 50) | Código da filial em que o produto será reservado |
| cod_pedidov | string (max 15) | Código do pedido de venda. Utilizado também para informar qual é o pedido encomenda que pertence o item quando for um item de um pedido pai de encomenda |
| comprimento | integer | Comprimento do produto |
| data_entrega | timestamp | Data de entrega do produto |
| desc_transportadora | string (max 255) |  |
| desconto | float | Valor do desconto do produto em percentual |
| encomenda | string (max 1) | Indica que o item é: "T" Encomenda "R" Reservar Indicar no campo "FILIAL_EXTERNA" a filial que o millennium deve reservar "F" Nenhum' "C" Compra |
| endereco | integer | Endereço de entrega do item |
| enquadramento_ipi | integer |  |
| fatura_brinde | boolean | Indica se o brinde será faturado Comportamento Este campo funciona em conjunto com o campo BRINDESITE |
| filial_externa | string (max 50) | Código da filia da plataformal em que o produto será reservado |
| icm_orig | float |  |
| id_externo | string (max 255) | Id externo do produto |
| it_valor_frete | float |  |
| item | string (max 20) | Código do Item Comportamento - Quando for um componente de kit o código do item deve ser {item_pai}.{item_filho}, exemplo 0001.0001, 0001.0002 ... |
| item_xml_nfe | integer |  |
| largura | integer | Largura do produto |
| lote | string (max 50) | Lote do produto |
| obs_item | string (max 500) | Observação do item |
| prazoentregadias | integer | Prazo da entrega DIAS ÚTEIS |
| preco | float | Preço do produto |
| preco_original_site | float |  |
| presente | boolean | Indica que o item é um presente |
| quantidade | float | Quantidade do produto |
| sit_trib | string (max 3) | Situação tributária do produto |
| sit_trib_cofins | string (max 2) |  |
| sit_trib_ipi | string (max 2) |  |
| sit_trib_pis | string (max 2) |  |
| sku | string (max 255) | SKU no formato produto_cor_estampa_tamanho |
| taxa_icmss | float |  |
| tipo_icms | string (max 3) | Tipo do ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF) |
| transportadora | integer |  |
| tx_red_icms | float |  |
| unidade | string (max 5) |  |
| v_cofins | float | V COFINS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| v_fcp | float |  |
| v_fcp_st | float |  |
| v_icms | float | V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS |
| v_icmss | float |  |
| v_ipi | float |  |
| v_pis | float | V PIS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| vendedor_item | integer |  |
| descontos | object array | Descontos aplicados no item. |
| desconto | float | Campo correspondente ao valor do desconto. |
| descricao | string (max 50) | Campo correspondente a descrição do desconto. |
| id_externo_desconto | string (max 255) | Campo correspondente ao id externo do desconto. |
| nome | string (max 255) | Campo correspondente ao nome do desconto. |
| tipo_desc | integer | Campo correspondente ao tipo do desconto(0=Percentual,1=valor). |
| retiradas_autorizadas | object array | Lista de pessoas autorizadas a retirar as mercadorias |
| cpf | string (max 14) | Campo correspondente ao CPF da pessoa autorizada à retirar a mercadoria |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento da pessoal autorizada à retirar a mercadoria com o cliente |
| nome | string (max 60) | Campo correspondente ao nome da pessoa autorizada à retirar a mercadoria |
| tipos_fretes | object array |  |
| cod_endereco | integer |  |
| cod_filial | string (max 50) |  |
| desc_tipo_frete | string (max 250) |  |
| filial_externa | string (max 50) |  |
| v_frete * | float |  |
| acerto | float | Valor em percentual de acerto (Acréscimo ou desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará sobre o valor do campo "TOTAL" do objeto principal |
| acessa_presente | boolean | Campo que indica que o pedido de venda acessa o presente. |
| analisador_risco | integer | Campo correspondente ao análisador de risco. |
| aprovado | boolean | Campo que indica que o pedido de venda está aprovado |
| autorizacao_cartao | string (max 10) | Campo utilizado quando não há adiantamento financeiro |
| cif_fob | string (max 1) | Campo que indica quem paga o frete. São eles: - C = CIF(empresa paga frete) - F = FOB(cliente paga frete) |
| cliente | integer | Código do cliente dentro do Millennium. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.CLIENTES.INCLUIROUALTERAR. Comportamentos - É obrigatório quando não há dados no objeto "DADOS_CLIENTE"; - Se o código do cliente não existir no Millennium à API irá retornar mensagem de erro; |
| cnpj_fornecedor | string (max 19) | Campo que informa o Fornecedor de Devolução através do CNPJ |
| cnpj_transportadora | string (max 19) | Campo correspondente ao CNPJ da transportadora. Comportamento - Será usado para buscar à transportadora, se o mesmo não for encontrado, buscará pelo “NOME_TRANSPORTADORA” |
| cod_colecao | string (max 15) | Código da coleção |
| cod_endereco | integer | Código do endereço do Cliente. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.CLIENTES.INCLUIROUALTERAR. Comportamento - Se houver informação, o código do endereço deve corresponder ao cliente informado no campo "CLIENTE" |
| cod_evento | string (max 15) |  |
| cod_filial | string (max 10) | Código Esterno da Filial Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| cod_pedido_mkt_place | string (max 150) | Código do pedido no marketplace |
| cod_pedidov | string (max 12) | Código do pedido. Comportamentos - Se for omitido, à API irá gerar automaticamente um código válido. - Se for enviado vazio ou null, à API irá retornar mensagem de erro. - Se o código já existir no Millennium e o pedido corresponder a um pedido em análise (pedido incluído na API com o campo "PRE_PEDIDO" = true),a integração substituirá esse pedido, senão retornará mensagem de erro. |
| cod_prazo_entrega | string (max 3) | Campo correspondente ao código do prazo de entrega. Comportamento - Se houver informação, à API verifica se o código do prazo está cadastrado, caso não esteja, à API retornará uma mensagem de erro. |
| cod_tabela_preco_venda | string (max 8) | Código da tabela de preço de venda |
| cod_usuario_na_plataforma | string (max 60) |  |
| cod_vendedor | string (max 7) | Codigo do vendedor (Funcionario) do millennium |
| comissao_f | float | Percentual de comissão do funcionário do pedido de venda |
| comissao_r | float | Percentual de comissão do representante do pedido de venda |
| cortesia | float | valor absoluto de cortesia (Acréscimo ou desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará no valor enviado para o campo "TOTAL" do objeto principal e "VALOR_INICIAL" do objeto de "LANCAMENTOS" |
| cpnj_plataforma | string (max 19) |  |
| dados_adicionais | string (max 100) | Campo correspondente aos dados adicionais do pedido de venda |
| data_emissao | date | Data de emissão do pedido Comportamento - Se for omitido, à API irá gerar automaticamente a data atual. |
| data_emissao_nf | date | Quando preenchido junto com os dados da nota, será a Data de Emissão da NF |
| data_entrega | date | Data de entrega do pedido de venda |
| data_entrega_final | date | Campo correspondente a data final de entrega do pedido |
| datahora_agendamento | timestamp | Campo correspondente a data e hora do agendamento para entrega do pedido |
| datahora_expedicao | timestamp | data e hora de expedição do pedido |
| dispositivo_compra | string (max 40) | Campo correspondente ao dispositivo de compra |
| email_vendedor | string (max 100) | Campo correspondente ao e-mail do vendedor. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| encomenda | boolean | Campo que indica que este é um pedido encomenda filho. Comportamento - Se ele for true, o campo “ENCOMENDA” do objeto produtos, não poderá ser true, senão à API retornará mensagem de erro |
| endereco_presente | integer | Campo correspondente ao endereço do presente. Comportamento - Se o campo “ACESSA_PRESENTE” for true e se Endereço do Presente igual a vazio, então “ENDERECO_PRESENTE” será igual ao “COD_ENDERECO”. |
| endereco_retirada | integer | Código do endereço de retirada do ponto de retirada. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.PONTOS_RETIRADA.INCLUIROUALTERAR. Comportamento - Se houver informação, o código do endereço de retirada deve corresponder ao ponto de retirada informado no campo "PONTO_RETIRADA" |
| enviado | boolean | Campo que deixa o saldo de reserva para os itens do pedido, visível na API |
| faturar | string (max 1) | Campo que indica como o pedido de venda deverá ser faturado. São eles: 'N'='Não Faturar', 'I'='Importar documento XML', 'F'='Faturar - Indisponível por enquanto' |
| id_carrinho | string (max 50) | Id do carrinho na plataforma |
| idnfe | string (max 50) | Campo correspondente ao ID da nota fiscal. Comportamento - É necessário informar quando “MODELO” for diferente de 'ECF' e “FATURAR” for igual 'I' |
| ignorar_analise_risco | boolean | Indica que a analise de risco será ignorada |
| manter_filial_transferencia | boolean |  |
| modalidade_frete | string (max 1) | Campo que indica modalidade de frete e quem irá pagar pelo mesmo. São eles: 0 = (Emitente - quem compra paga, o valor não é incluído no pedido), 1 = ( Dest/Rem), 2 = (Terceiros), 9 = ( Sem Frete), 5 = ( Emitente (soma Frete) - valor não é incluído no pedido). Comportamentos - Se o campo “ENCOMENDA” do objeto principal for true, modalidade será 9. - Se o modalidade for diferente de 0 e 9, o “V_FRETE” será somado ao valor líquido da venda. |
| modelo | string (max 3) | Campo correspondente ao modelo. São eles 'ECF','55','59','65' (“ECF” – Emissor de cupom fiscal , "55" NFe, "59" Sat-cfe , "65" NFCe') Comportamento - Se “FATURAR” for igual a “I” ou “F” e o “MODELO” diferente de um dos anteriores, à API retornará uma mensagem de erro. |
| n_pedido_cliente | string (max 50) | Número do pedido do cliente, não é obrigatório |
| n_serie | string (max 20) | Campo correspondente ao número de fabricação. Comportamento - É necessário informar quando “MODELO” for igual a 'ECF' ou '59' |
| nf_saida | integer | Nota fiscal de saída para troca ou devolução. Comportamento - Se possuir um valor, à API verifica se há “PROTOCOLO_TROCA_DEV”, caso não tenha ele assume que a informação é um código de uma nota fiscal de um pedido original/anterior, utilizado para efetuar à troca ou a devolução |
| nfce_server | string (max 5) |  |
| nome_contato_cliente | string (max 60) | Nome do contato do cliente |
| nome_mkt_place | string (max 100) |  |
| nome_representante | string (max 60) | Campo correspondente ao nome do representante. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome do representante e se não for encontrado retornará mensagem de erro. |
| nome_transportadora | string (max 250) | Nome da transportadora cadastrada no sistema. Comportamento - A integração irá tentar buscar uma transportadora que corresponda a ao valor enviado para esse campo dentro dos cadastros do Millennium, primeiro |
| nome_vendedor | string (max 60) | Campo correspondente ao nome do vendedor. Comportamento - Caso não seja vazio, à API irá fazer uma buscar pelo nome e se não for encontrado retornará mensagem de erro. |
| nota | string (max 10) | Campo correspondente a nota fiscal ou cupom. Comportamento - É necessário informar quando “FATURAR” for igual 'I' ou 'F' |
| nsu_cartao | string (max 40) | Campo utilizado quando não há adiantamento financeiro |
| numecf | integer | Campo correspondente ao número da ECF - Emissor de cupom fiscal. Comportamento - É necessário informar quando “MODELO” for igual 'ECF' e “FATURAR” for igual 'I' ou 'F' |
| numero_objeto | string (max 40) | Código de rastreio do pedido |
| obs | string | Observação do pedido de venda |
| obs2 | string | Campo correspondente as observações 2 do pedido de venda |
| orcamento | boolean | Indica que o pedido será um orçamento |
| origem_pedido | string (max 10) | Campo correspondente a descrição de origem do pedido. - Exemplos: (NORMAL,WEB SITE) Comportamento - Se omitido, à API deixará como default "Web Site" |
| pdf_etiqueta_transporte | string | Etiqueta a ser impressa no momento do faturamento. A etiqueta de transporte deve estar codificado em Base64. Os formatos aceitos são PDF e ZPL. |
| pedido_parcial_e_commerce | boolean |  |
| periodo_entrega | string (max 1) | Campo que indica o período de entrega. São eles: 'M'='Manhã'; 'T'='Tarde'; 'N'='Noite' |
| plataforma_financeiro | boolean |  |
| ponto_retirada | integer | Código do ponto de retirada dentro do Millennium. Esta informação poderá ser obtida no retorno do método MILLENIUM_ECO.PONTOS_RETIRADA.INCLUIROUALTERAR |
| prazoentregadias | integer | Prazo de entrega dias úteis |
| pre_pedido | boolean | Campo que indica que é um pré-pedido temporário. Comportamento - Se 'true', o Status do pedido ficará "1" – Em análise e “RESEVAR” true. Quando o pedido for efetivado, isto é, incluído com o campo “COD_PEDIDOV” igual ao pré-pedido, o pré será substituído pelo efetivado, nesse caso o campo “PRE_PEDIDO” deverá ser 'false' |
| protocolo_agendamento | string (max 40) | Código do protocolo de agendamento |
| protocolo_troca_dev | string (max 15) | Protocolo de devolução do pedido de venda ou protocolo de troca. Comportamento - Se o campo “PROTOCOLO_TROCA_DEV” for diferente de vazio, à API irá buscar a nota Fiscal de saída(Troca e Devolução) e atribuir o resultado no campo “NF_SAIDA”, não encontrando à API retornará uma mensagem de erro |
| pvadiantamento | boolean | Campo que indica que será gerado o Adiantamento financeiro para um pedido de venda |
| quantidade | float | Quantidade de itens do Pedido de Venda Comportamento - Este campo é resultado da soma do campo "QUANTIDADE" do objeto "PRODUTOS" |
| representante_externo | string (max 250) | Representante externo configurado na tabela de mapeamento do representante da vitrine Comportamento -Somente é utilizado se o campo vitrine for informado -Somente é utilizado se a tabela de mapeamento conter ao menos um mapeamento |
| serie | string (max 3) | Campo correspondente ao número de série da nota fiscal. Comportamento - É necessário informar quando “MODELO” for igual '55' ou '65' e “FATURAR” for igual 'I' ou 'F' |
| status_analise_risco | string (max 1) | Status da análise de risco 0- APROVADO; 1- REPROVADO; 2- AGUARANDO ANÁLISE; 3- ERRO; |
| suspenso | boolean | Indica se o pedido esta suspenso |
| total | float | Valor total do Pedido de Venda |
| transacao_analise_risco | string (max 50) | Número da transação que identifica a análise de risco na operadora de risco |
| v_acerto | float | Valor absoluto do acerto (Acréscimo ou Desconto) sobre o valor do Pedido de Venda Comportamento - O valor enviado para este campo implicará no valor enviado para o campo "VALOR_INICIAL" do objeto de "LANCAMENTOS". |
| v_frete | float | Valor do frete. Comportamentos - Será usado para calcular o valor líquido do pedido quando “MODALIDADE_FRETE” for diferente de 0 e 9. - Se houver um valor, deve haver também uma transportadora “NOME_TRANSPORTADORA”, senão à API retornará uma mensagem de erro. |
| v_frete_calc | float | Campo correspondente ao valor do frete calculado pela transportadora Comportamento - Se vazio, o mesmo irá assumir o valor do campo “V_FRETE” |
| v_frete_custo | float | Custo real do frete cobrado pela transportadora |
| validade | date | Validade do Pedido de Venda |
| vitrine | integer | Campo correspondente ao ID da vitrine. Comportamento - Se for informado algum ID, o mesmo deverá estar cadastrado ou à API retornará uma mensagem de erro. |
| xml_doc | string | Campo correspondente ao XML do documento informado no campo “MODELOS”. Comportamento - É obrigatório quando “MODELOS” for “55,59,65” e “FATURAR” for igual “I” |
| campanhas | object array | Campo correspondente as campanhas |
| cod_campanha | string (max 6) | Campo correspondente ao código da campanha. |
| conteudo | string (max 40) | Campo correspondente ao conteúdo da campanha. |
| data * | date | Campo correspondente a data inicial da campanha. |
| data_final | date | Campo correspondente a data final da campanha. |
| descricao * | string | Campo correspondente a descrição da campanha. |
| midia | string (max 40) | Campo correspondente a mídia da campanha. |
| nome * | string (max 40) | Campo correspondente ao nome da campanha. |
| origem | string (max 40) | Campo correspondente a origem da campanha. |
| recorrencia | integer | Campo correspondente a recorrencia da campanha. |
| situacao * | string (max 20) | Campo correspondente a situação da campanha(0=Não Iniciada,1=Em Execução,2=Finalizada. |
| template_html | string | Campo correspondente ao template da campanha no formato HTML. |
| tempo_recorrencia | integer | Campo correspondente ao tempo de recorrencia da campanha. |
| termo | string (max 40) | Campo correspondente ao termo da campanha. |
| tipo * | string (max 20) | Campo correspondente ao tipo da campanha(0=Telefone,1=Mala Direta,2=Email,3=FAX). |
| dados_cliente | object array | Campo correspondente aos dados do cliente |
| aplicar_icms_st | boolean | Campo que identifica se deve ser aplicado ICMS ST para o cliente. |
| cel | string (max 20) | Celular do cliente / contato. |
| cnpj | string (max 20) | CNPJ do cliente. |
| cod_cliente | string (max 12) | Código do cliente Comportamentos É utilizado somente para atualização de cliente. Quando não encontrado um cliente correspondente é retornado erro. |
| cpf | string (max 14) | CPF do cliente. |
| dados_adicionais | string (max 30) | Informações adicionais do cliente. |
| data_aniversario | date | Data de aniversário do cliente. |
| ddd_cel | string (max 3) | DDD do celular do cliente / contato. |
| e_mail | string (max 250) | E-mail do cliente. |
| e_mail_nfe | string (max 250) | E-mail do cliente para emissão da nota fiscal eletrônica. |
| fantasia | string (max 120) | Nome fantasia do cliente. |
| id_externo | string (max 255) | ID externo do cliente associado a vitrine. Comportamentos O envio de Id_externo torna obrigatório o envio do Id da Vitrine |
| ie | string (max 15) | Inscrição estadual do cliente. |
| nome | string (max 120) | Nome do cliente. |
| origem_cliente | string (max 10) | Origem do cadastro do cliente. |
| parentesco | integer | Tipo de parentesco do cliente. (0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó). |
| permite_enviar_newsletter | string (max 1) | Permite enviar NewsLetter - Informar T ou F |
| permite_enviar_sms | string (max 1) | Permite enviar SMS - Informar T ou F |
| pf_pj | string (max 2) | Tipo de cliente. (PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | RG do Cliente. |
| tipo_cli | string (max 1) | 0-Atacado 1-Varejo 3-Franquia 4-Representante 5-Funcionário 6-Catálogo 2-Todos 7-Grupo |
| tipo_sexo | string (max 1) | Sexo do cliente. (M = Masculino, F = Feminino, U = Não Aplicável). |
| tratamento | string (max 20) | Tratamento dado ao cliente. (0 = Sr. , 1 = Sra. , 2 = Dr. , 3 = Dra. , 4 = Srta). |
| ufie | string (max 3) | Estado da inscrição estadual do cliente. |
| vitrine | integer | ID da vitrine. |
| endereco | object array | Endereço do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_cobranca | object array | Endereço de cobrança do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_entrega | object array | Endereço de entrega do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| dados_fornecedor | object array | Campo correspondente aos dados do fornecedor |
| cel | string (max 20) | Campo correspondente ao celular do fornecedor. |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do fornecedor. |
| cod_fornecedor | string (max 10) | Campo correspondente ao código do fornecedor. Comportamento - Se este código não for informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail. - Se for informado, o sistema irá atualizar o fornecedor com o código especificado. |
| cpf | string (max 14) | Campo correspondente ao CPF do fornecedor. |
| data_aniversario | date | Campo correspondente a data de aniversário do fornecedor. |
| e_mail | string (max 250) | Campo correspondente ao email do fornecedor. |
| fantasia | string (max 60) | Campo correspondente a fantasia do fornecedor. |
| gerador_origem | integer | Campo correspondente ao gerador origem do fornecedor. |
| ie | string (max 15) | Campo correspondente a inscrição estadual do fornecedor. |
| maladireta | boolean | Campo que indica se o fornecedor deseja receber mala direta. |
| nome | string (max 60) | Campo correspondente ao nome do fornecedor. |
| obs | string | Campo correspondente a observação do fornecedor. |
| pf_pj | string (max 2) | Campo correspondente o tipo da pessoa do fornecedor(PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | Campo correspondente ao rg do fornecedor. |
| tipo_sexo | string (max 1) | Campo correspondente ao sexo do fornecedor(M = Masculino, F = Feminino, U = Não Aplicável). |
| vitrine | integer | Campo correspondente id da vitrine. |
| endereco | object array | Campo correspondente a lista de endereços do fornecedor. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| dados_ponto_retirada | object array | Campo correspondente aos dados do ponto de entrega |
| nome | string (max 120) | Nome do ponto de retirada |
| endereco | object array | Endereço do ponto de retirada |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string (max 30) | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| doacoes | object array | Doações que foram feitas junto com o pedido |
| descricao | string (max 30) | Campo correspondente a descrição da doação. |
| valor | float | Campo correspondente ao valor da doação. |
| lancamentos | object array | Laçamentos do Pedido de Venda |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| mensagens | object array | Campo correspondente as mensagens do pedido de venda |
| assinatura | string (max 100) | Campo correspondente a assinatura da mensagem. |
| cod_endereco | integer | Campo correspondente ao endereço da mensagem. |
| data_entrega | date | Campo correspondente a data de entrega da mensagem. |
| imagem | I | Campo correspondente a imagem. |
| imagem_mensagem * | boolean | Campo que indica se a imagem da mensagem é uma mensagem ou um texto. Comportamento - Se marcar essa opção, a imagem será tratada como uma mensagem de texto. |
| impresso * | boolean | Campo que indica se a mensagem já foi impressa. |
| texto | string | Campo correspondente ao texto. |
| tipo * | string (max 1) | Campo correspondente ao tipo da mensagem(0='Texto',1='Imagem',2='Envelope'). |
| produtos | object array | Itens do Pedido de Venda |
| al_cofins | float | AL COFINS Comportamento Se omitido pega o valor do parâmetro geral |
| al_fcp | float |  |
| al_fcp_st | float |  |
| al_icms | float | AL ICMS(00, 20- 102 e T Obrigatório) |
| al_icmss | float |  |
| al_ipi | float |  |
| al_pis | float | AL PIS Comportamento Se omitido pega o valor do parâmetro geral |
| alteracao_bloqueada | boolean | Indica que não será permitido a alteração deste sku no pedido de venda |
| altura | float | Altura do produto |
| b_fcp | float |  |
| b_fcp_st | float |  |
| b_icms | float | Base ICMS. Comportamento Se não informado, assume o valor do produto |
| b_icmss | float |  |
| b_ipi | float |  |
| barra | string (max 20) | Código de barras |
| bicm_orig | float |  |
| bonificado | boolean | Indica que o item é bonificado |
| brindesite | boolean | Indica que o item é um brinde |
| cbenef | string (max 8) |  |
| cfop | string (max 5) | CFOP do produto |
| cod_campanha | string (max 15) | Código da campanha de venda do produto |
| cod_filial | string (max 50) | Código da filial em que o produto será reservado |
| cod_pedidov | string (max 15) | Código do pedido de venda. Utilizado também para informar qual é o pedido encomenda que pertence o item quando for um item de um pedido pai de encomenda |
| comprimento | integer | Comprimento do produto |
| data_entrega | timestamp | Data de entrega do produto |
| desc_transportadora | string (max 255) |  |
| desconto | float | Valor do desconto do produto em percentual |
| encomenda | string (max 1) | Indica que o item é: "T" Encomenda "R" Reservar Indicar no campo "FILIAL_EXTERNA" a filial que o millennium deve reservar "F" Nenhum' "C" Compra |
| endereco | integer | Endereço de entrega do item |
| enquadramento_ipi | integer |  |
| fatura_brinde | boolean | Indica se o brinde será faturado Comportamento Este campo funciona em conjunto com o campo BRINDESITE |
| filial_externa | string (max 50) | Código da filia da plataformal em que o produto será reservado |
| icm_orig | float |  |
| id_externo | string (max 255) | Id externo do produto |
| it_valor_frete | float |  |
| item | string (max 20) | Código do Item Comportamento - Quando for um componente de kit o código do item deve ser {item_pai}.{item_filho}, exemplo 0001.0001, 0001.0002 ... |
| item_xml_nfe | integer |  |
| largura | integer | Largura do produto |
| lote | string (max 50) | Lote do produto |
| obs_item | string (max 500) | Observação do item |
| prazoentregadias | integer | Prazo da entrega DIAS ÚTEIS |
| preco | float | Preço do produto |
| preco_original_site | float |  |
| presente | boolean | Indica que o item é um presente |
| quantidade | float | Quantidade do produto |
| sit_trib | string (max 3) | Situação tributária do produto |
| sit_trib_cofins | string (max 2) |  |
| sit_trib_ipi | string (max 2) |  |
| sit_trib_pis | string (max 2) |  |
| sku | string (max 255) | SKU no formato produto_cor_estampa_tamanho |
| taxa_icmss | float |  |
| tipo_icms | string (max 3) | Tipo do ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF) |
| transportadora | integer |  |
| tx_red_icms | float |  |
| unidade | string (max 5) |  |
| v_cofins | float | V COFINS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| v_fcp | float |  |
| v_fcp_st | float |  |
| v_icms | float | V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS |
| v_icmss | float |  |
| v_ipi | float |  |
| v_pis | float | V PIS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| vendedor_item | integer |  |
| descontos | object array | Descontos aplicados no item. |
| desconto | float | Campo correspondente ao valor do desconto. |
| descricao | string (max 50) | Campo correspondente a descrição do desconto. |
| id_externo_desconto | string (max 255) | Campo correspondente ao id externo do desconto. |
| nome | string (max 255) | Campo correspondente ao nome do desconto. |
| tipo_desc | integer | Campo correspondente ao tipo do desconto(0=Percentual,1=valor). |
| retiradas_autorizadas | object array | Lista de pessoas autorizadas a retirar as mercadorias |
| cpf | string (max 14) | Campo correspondente ao CPF da pessoa autorizada à retirar a mercadoria |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento da pessoal autorizada à retirar a mercadoria com o cliente |
| nome | string (max 60) | Campo correspondente ao nome da pessoa autorizada à retirar a mercadoria |
| tipos_fretes | object array |  |
| cod_endereco | integer |  |
| cod_filial | string (max 50) |  |
| desc_tipo_frete | string (max 250) |  |
| filial_externa | string (max 50) |  |
| v_frete * | float |  |
| aprovado | boolean | Quando enviado com "True", somente faturamentos aprovados serão listados |
| cancelada | boolean | Quando enviado com "True", somente faturamentos cancelados serão listados |
| cod_pedidov | string (max 20) | Código do pedido de venda |
| data_atualizacao | timestamp | Data de atualização |
| data_atualizacao_final | timestamp | Data da atualização final da nota |
| data_atualizacao_inicial | timestamp | Data da atualzação inicial da nota |
| data_emissao | date | Data de emissão |
| data_emissao_final | timestamp | Data de emissão final |
| data_emissao_inicial | timestamp | Data de emissão Inicial |
| gera_xml | string (max 1) | Força o retorno do xml da nota |
| lancamentos_pedido | boolean | Listar os lançamentos do pedido |
| lancamentos_pedido_filial | boolean | Lista os lançamentos do pedido que correspondem a mesma filial da nota |
| nota | integer | Numero da nota |
| pedidov | integer | Id do pedido de venda |
| saida | integer | Id da saida, entrada ou transferência |
| saida_inicial | integer | Id da saida, entrada ou transferência que será usado como ponto de partida |
| trans_id | integer | Trans_id para a listagem das notas fiscais, as notas fiscais serão listadas a partir desse trans_id. Trans_id é um campo numérico que indica quando um item foi alterado |
| vitrine | integer | Id da vitrine |
| b_cofins | float |  |
| b_pis | float |  |
| canal_destribuicao | string (max 20) |  |
| cancelado | boolean | Indica que a movimentação foi cancelada |
| chave_nf | string (max 50) | Chave na nota fiscal |
| cidade_transportadora | string (max 50) | Cidade onde a transportadora esta localizada |
| cif_fob | string (max 1) | C = CIF(empresa paga frete), F = FOB(cliente paga frete) |
| cnpj_emissor | string (max 20) |  |
| cnpj_filial_retira | string (max 19) |  |
| cnpj_transportadora | string (max 20) | CNPJ da transportadora |
| cod_emissor | string (max 10) |  |
| cod_filial_retira | string (max 10) |  |
| cod_operacao | integer | Código da operação (único por tipo de operação) |
| cod_pedidov | string (max 20) | Código do pedido de venda |
| cod_pedidov_ref | string (max 20) | Código do pedido de venda referência |
| cod_transportadora | string (max 20) | Código da transportadora |
| cup_fis | string (max 1) |  |
| data | date | Data da movimentação |
| data_atualizacao | timestamp | Data de atualização da movimentação |
| data_autorizacao_nf | timestamp | Data de autorização da nota fiscal |
| data_hora_emissao | timestamp | Data e hora da emissão |
| datacancelamento | date | Data do cancelamento |
| desc_evento | string (max 50) | Descrição do evento |
| digitada | string (max 1) |  |
| endereco_transportadora | string (max 120) |  |
| especie | string (max 20) |  |
| icms | float |  |
| icmss | float |  |
| ie_emissor | string (max 20) |  |
| ie_transportadora | string (max 20) |  |
| ipi | float |  |
| marca | string (max 20) |  |
| mensagem_nfe | string (max 200) |  |
| modalidade_frete | string (max 1) | 0 = (0 - Emitente'), 1 = (1 - Dest/Rem), 2 = (2 - Terceiros), 9 = (9 - Sem Frete), 5 = (0 - Emitente (soma Frete)) |
| modelo | string (max 1) |  |
| moeda | string (max 5) |  |
| n_fabr_impr | string (max 30) | Número da ECF |
| n_pedido_cliente | string (max 50) | Número do pedido de venda no cliente |
| n_pedido_cliente_ref | string (max 50) | Número do pedido de venda no cliente referência |
| n_volumes | integer | Número de Volumes |
| nf | string (max 15) | Número da nota fiscal |
| nome_emissor | string (max 120) |  |
| nome_transportadora | string (max 120) | Nome da transportadora |
| numeracao | string (max 20) |  |
| peso_b | float |  |
| peso_l | float |  |
| placa | string (max 8) | Numero da placa |
| placa_transportadora | string (max 8) |  |
| protocolo_nf | string (max 20) | Protocolo da nota fiscal |
| quantidade | float | Quantidade da movimentação |
| recibo_nf | string (max 20) | Recibo da nota fiscal |
| romaneio | string (max 15) | Romaneio da movimentação |
| saida | integer | Id da movimentação de saida ou entrada |
| serie_nf | string (max 10) | Série da nota fiscal |
| status | string |  |
| tipo_operacao | string (max 1) | Tipo da operação(S=Saida;E=Entrada) da movimentação |
| tipo_veiculo | string (max 1) |  |
| total | float | Total da movimentação |
| trans_id | integer | trans_id da nota fiscal |
| uf_transportadora | string (max 2) | Estado onde fica localizada a transportadora |
| unidade_peso | string (max 2) |  |
| v_cofins | float |  |
| v_fcp_uf_dest | float | Valor do fundo de combate a pobreza |
| v_frete | float | Valor do frete da movimentação |
| v_icms | float |  |
| v_icms_uf_dest | float | Valor do ICMS de partilha para a UF do destinatário |
| v_icms_uf_remet | float | Valor do ICMS de partilha para a UF do remetente |
| v_icmss | float |  |
| v_ipi | float |  |
| v_pis | float |  |
| valor_desconto | float | Valor dos descontos da nota levando em consideração os descontos informados |
| valor_despesas_acessorias | float | Valor das despesas acessórias que leva em consideração o acréscimo incluído na Nota |
| valor_final | float | Valor final da movimentação considerando cortesia, acerto e frete |
| valor_nf | float |  |
| valor_produtos | float |  |
| valor_seguro | float |  |
| vitrine | integer | Id da vitrine |
| xml | string |  |
| xml_nfe_cancelamento | string |  |
| cliente | object array | Dados do cliente |
| aplicar_icms_st | boolean | Campo que identifica se deve ser aplicado ICMS ST para o cliente. |
| cargo | string (max 30) | Campo correspondente ao cargo do cliente |
| cel | string (max 20) | Campo correspondente ao número do celular do cliente. |
| cgc | string (max 20) |  |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do cliente. |
| cod_cliente | string (max 12) | Campo correspondente ao código do cliente. |
| cpf | string (max 14) | Campo correspondente ao CPF do cliente. |
| dados_adicionais | string (max 30) | Campo correspondente as informações adicionais do cliente. |
| data_aniversario | date | Campo correspondente a data de aniversário do cliente. |
| ddd_cel | string (max 3) | Campo correspondente ao DDD do celular do cliente. |
| e_mail | string (max 250) | Campo correspondente ao e-mail do cliente. |
| e_mail_nfe | string (max 250) | Campo correspondente ao e-mail do cliente para emissão da nota fiscal eletrônica. |
| fantasia | string (max 120) | Campo correspondente ao nome fantasia do cliente. |
| grupo_loja | integer | Campo correspondente ao grupo da loja do cliente. |
| id_externo | string (max 255) | Campo correspondente ao ID externo do cliente. |
| ie | string (max 15) | Campo correspondente a inscrição estadual do cliente. |
| maladireta | boolean | Campo que indica que o cliente deseja receber mala direta. |
| nome | string (max 120) | Campo correspondente ao nome do cliente. |
| obs | string | Campo correspondente a observação referente ao cliente. |
| parentesco | integer | Campo correspondente ao tipo de parentesco do cliente. (0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó). |
| pf_pj | string (max 2) | Campo correspondente ao tipo da pessoa do cliente. (PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | Campo correspondente ao rg do cliente. |
| suframa | string (max 20) | Campo correspondente ao suframa do cliente. |
| tipo_sexo | string (max 1) | Campo correspondente ao sexo do cliente. (M = Masculino, F = Feminino, U = Não Aplicável). |
| tratamento | string (max 20) | Campo correspondente ao tratamento dado ao cliente. (0 = Sr., 1 = Sra, 2 = Dr., 3 = Dra, 4 = Srta). |
| ufie | string (max 3) | Campo correspondente ao estado da inscrição estadual do cliente. |
| vitrine | integer | Campo correspondente ao ID da vitrine. |
| categorias | integer array | Campo correspondente a categoria do cliente |
| endereco | object array | Campo correspondente ao endereço do cliente. |
| bairro | string (max 200) | Campo correspondente ao bairro do endereço do cliente. |
| cep | string (max 9) | Campo correspondente ao cep do endereço do cliente. |
| cidade | string (max 60) | Campo correspondente a cidade do cliente. (Como na tabela do IBGE). |
| cod_endereco | integer | Campo correspondente ao código do endereço do cliente |
| cod_mun_ibge | string (max 6) | Campo correspondente ao código do município do IBGE. |
| complemento | string (max 200) | Campo correspondente ao complemento do endereço do cliente. |
| contato | string (max 60) | Campo correspondente ao nome do contato que estará no endereço informado. |
| ddd | string (max 4) | Campo correspondente ao DDD do telefone do cliente. |
| ddd_cel | string (max 5) | Campo correspondente ao DDD do celular do cliente. |
| desc_tipo_endereco | string (max 20) | Campo correspondente a descrição do tipo do endereço. |
| dicas_endereco | string (max 30) | Campo correspondente as instruções de direção ou ponto de referência do endereço. |
| estado | string (max 3) | Campo correspondente ao estado do cliente. (Como na tabela do IBGE). |
| fax | string (max 20) | Campo correspondente ao fax do cliente. |
| fone | string (max 20) | Campo correspondente ao telefone do cliente. |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento com o cliente. |
| logradouro | string (max 200) | Logradouro do endereço do contato |
| nome_pais | string (max 50) | Campo correspondente ao nome do país em que o cliente reside. |
| numero | string (max 15) | Campo correspondente ao número da residência do endereço do cliente. |
| pais_dest | string (max 20) | Campo correspondente ao país do cliente. |
| ramal | string (max 10) | Campo correspondente ao ramal do cliente. |
| tipo_sexo | string (max 1) | Campo correspondente ao tipo do sexo do cliente. ('M'='Masculino';'F'='Feminino';'U'='Não Aplicável'). |
| endereco_cobranca | object array | Campo correspondente ao endereço de cobrança do cliente. |
| bairro | string (max 200) | Campo correspondente ao bairro do endereço do cliente. |
| cep | string (max 9) | Campo correspondente ao cep do endereço do cliente. |
| cidade | string (max 60) | Campo correspondente a cidade do cliente. (Como na tabela do IBGE). |
| cod_endereco | integer | Campo correspondente ao código do endereço do cliente |
| cod_mun_ibge | string (max 6) | Campo correspondente ao código do município do IBGE. |
| complemento | string (max 200) | Campo correspondente ao complemento do endereço do cliente. |
| contato | string (max 60) | Campo correspondente ao nome do contato que estará no endereço informado. |
| ddd | string (max 4) | Campo correspondente ao DDD do telefone do cliente. |
| ddd_cel | string (max 5) | Campo correspondente ao DDD do celular do cliente. |
| desc_tipo_endereco | string (max 20) | Campo correspondente a descrição do tipo do endereço. |
| dicas_endereco | string (max 30) | Campo correspondente as instruções de direção ou ponto de referência do endereço. |
| estado | string (max 3) | Campo correspondente ao estado do cliente. (Como na tabela do IBGE). |
| fax | string (max 20) | Campo correspondente ao fax do cliente. |
| fone | string (max 20) | Campo correspondente ao telefone do cliente. |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento com o cliente. |
| logradouro | string (max 200) | Logradouro do endereço do contato |
| nome_pais | string (max 50) | Campo correspondente ao nome do país em que o cliente reside. |
| numero | string (max 15) | Campo correspondente ao número da residência do endereço do cliente. |
| pais_dest | string (max 20) | Campo correspondente ao país do cliente. |
| ramal | string (max 10) | Campo correspondente ao ramal do cliente. |
| tipo_sexo | string (max 1) | Campo correspondente ao tipo do sexo do cliente. ('M'='Masculino';'F'='Feminino';'U'='Não Aplicável'). |
| endereco_entrega | object array | Campo correspondente ao endereço de entrega do cliente. |
| bairro | string (max 200) | Campo correspondente ao bairro do endereço do cliente. |
| cep | string (max 9) | Campo correspondente ao cep do endereço do cliente. |
| cidade | string (max 60) | Campo correspondente a cidade do cliente. (Como na tabela do IBGE). |
| cod_endereco | integer | Campo correspondente ao código do endereço do cliente |
| cod_mun_ibge | string (max 6) | Campo correspondente ao código do município do IBGE. |
| complemento | string (max 200) | Campo correspondente ao complemento do endereço do cliente. |
| contato | string (max 60) | Campo correspondente ao nome do contato que estará no endereço informado. |
| ddd | string (max 4) | Campo correspondente ao DDD do telefone do cliente. |
| ddd_cel | string (max 5) | Campo correspondente ao DDD do celular do cliente. |
| desc_tipo_endereco | string (max 20) | Campo correspondente a descrição do tipo do endereço. |
| dicas_endereco | string (max 30) | Campo correspondente as instruções de direção ou ponto de referência do endereço. |
| estado | string (max 3) | Campo correspondente ao estado do cliente. (Como na tabela do IBGE). |
| fax | string (max 20) | Campo correspondente ao fax do cliente. |
| fone | string (max 20) | Campo correspondente ao telefone do cliente. |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento com o cliente. |
| logradouro | string (max 200) | Logradouro do endereço do contato |
| nome_pais | string (max 50) | Campo correspondente ao nome do país em que o cliente reside. |
| numero | string (max 15) | Campo correspondente ao número da residência do endereço do cliente. |
| pais_dest | string (max 20) | Campo correspondente ao país do cliente. |
| ramal | string (max 10) | Campo correspondente ao ramal do cliente. |
| tipo_sexo | string (max 1) | Campo correspondente ao tipo do sexo do cliente. ('M'='Masculino';'F'='Feminino';'U'='Não Aplicável'). |
| descontos | object array | Informativo de todos os descontos aplicados |
| barra | string (max 20) | Campo correspondente ao código de barras. |
| desconto | float | Campo correspondente ao valor do desconto. |
| descricao | string (max 50) | Campo correspondente a descrição do desconto. |
| id_externo_desconto | string (max 255) | Campo correspondente ao id externo do desconto. |
| item | string (max 20) | Campo correspondente ao ttem do SKU. |
| nome | string (max 255) | Campo correspondente ao nome do desconto. |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| tipo_desc | integer | Campo correspondente ao tipo do desconto(0=Percentual,1=valor). |
| lancamentos | object array | Lançamentos da movimentação |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| produtos | object array | Itens da movimentação |
| al_cofins | float | Campo correspondete ao AL COFINS Comportamento Se omitido pega o valor do parâmetro geral. |
| al_icms | float | Campo correspondente ao AL ICMS(00, 20- 102 e T Obrigatório). |
| al_iss | float | Campo correspondente ao AL ISS. |
| al_pis | float | Campo correspondente ao AL PIS Comportamento Se omitido pega o valor do parâmetro geral. |
| altura | float | Campo correspondente a altura. |
| b_cofins | float | Campo correspondente ao B COFINS Comportamento Se não informado, assume o valor do produto. |
| b_icms | float | Campo correspondente a base ICMS. Comportamento Se não informado, assume o valor do produto. |
| b_iss | float | Campo correspondente ao B ISS. |
| b_pis | float | Campo correspondente ao B PIS Comportamento Se não informado, assume o valor do produto. |
| barra | string (max 20) | Campo correspondente ao código de barras. |
| bcuf_dest | float | Campo correspondente ao BCUF_DEST. |
| brindesite | boolean | Campo que indica que o item é um brinde. |
| cfop | string (max 5) | Campo correspondente ao CFOP do produto. |
| cod_cor | string (max 8) | Campo correspondente ao código da cor. |
| cod_estampa | string (max 15) | Campo correspondente ao código da estampa. |
| cod_pedidov | string (max 15) | Campo correspondente ao código do pedido de venda. Utilizado também para informar qual é o pedido encomenda que pertence o item quando for um item de um pedido pai de encomenda. |
| cod_prefaturamento | string (max 85) | Campo correspondente ao código do pré faturamento. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto. |
| cod_trba_iss | string (max 4) | Campo correspondente ao código TRBA_ISS. |
| componente_kit | boolean | Campo que indica que o item é um componente de kit. |
| comprimento | float | Campo correspondente ao comprimento. |
| cst | string (max 3) | Campo correspondente ao CST. |
| data_entrega | date | Campo correspondente a data de entrega do produto. |
| desc_cor | string (max 150) | Campo correspondente a descrição da cor. |
| desc_estampa | string (max 150) | Campo correspondente a descrição da estampa. |
| desc_produto | string (max 500) | Campo correspondente a descrição do produto. |
| desc_status | string (max 50) | Campo correspondente a descrição do status do item. |
| desconto | float | Campo correspondente ao percentual do valor do desconto. |
| descricao_cfop | string (max 40) | Campo correspondente a descrição da CFOP. |
| encomenda | boolean | Campo que indica que o item é uma encomenda. |
| endereco | integer | Campo correspondente ao endereço de entrega do item. |
| fcp_uf_dest | float | Percentual do fundo de combate a pobreza |
| icms | float | Campo correspondent ao ICMS. |
| icms_uf_dest | float | Campo correspondente a alíquota do ICMS de partilha para a UF do destinatário. |
| icmss | float | Campo correspondente ao ICMS. |
| id_externo | string (max 255) | Campo correspondente ao id externo do produto. |
| ipi | float | Campo correspondente ao IPI. |
| it_valor_cortesia | float | Campo correspondente ao valor da cortesia rateado. |
| it_valor_desconto | float | Campo correspondente ao valor do desconto rateado. |
| it_valor_frete | float | Campo correspondente ao valor do frete rateado. |
| item | string (max 20) | Campo correspondente ao código do item. |
| largura | float | Campo correspondente a largura. |
| lote | string (max 50) |  |
| ncm | string (max 20) | Campo correspondente ao NCM. |
| nota_ref | string (max 60) | Campo correspondente a nota de referência. |
| obs_item | string (max 500) | Campo correspondente a observação do item. |
| pfcp_uf_dest | integer | Campo correspondente ao PFCP_UF_DEST. |
| preco | float | Campo correspondente ao preço do produto. |
| preco_icms_iss | float | Campo correspondente ao preco ICMS ISS. |
| presente | boolean | Campo que indica que o item é um presente. |
| quantidade | float | Campo correspondente a quantidade. |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| status | integer | Campo correspondente os status do item. |
| tipo_icms | string (max 3) | Campo correspondente ao tipo do ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF). |
| unidade | string (max 5) | Campo correspondente a unidade. |
| url_imagem | string | Campo correspondente a url das imagens. |
| url_tracking_pedido | string (max 512) | Campo correspondente a URL do correio. |
| v_cofins | float | Campo correspondente ao V COFINS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item. |
| v_fcp_uf_dest | float | Valor do fundo de combate a pobreza |
| v_icms | float | Campo correspondente ao V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS. |
| v_icms_uf_dest | float | Campo correspondente ao valor do ICMS de partilha para a UF do destinatário. |
| v_icms_uf_remet | float | Campo correspondente ao valor do ICMS de partilha para a UF do remetente. |
| v_icmss | float | Campo correspondente ao V ICMS. |
| v_ipi | float | Campo correspondente ao V IPI. |
| v_pis | float | Campo correspondente ao V PIS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item. |
| valor_total_bruto | float |  |
| valor_total_imposto | float | Campo correspondente ao valor total do imposto. |
| valor_total_liquido | float |  |
| valor_unitario | float | Campo correspondente ao valor unitario. |
| vfcpufdest | float | Campo correspondente ao VFCPUFDEST. |
| volumes | object array |  |
| numero_objeto | string (max 50) | Campo correspondente ao numero do objeto. |
| peso | float | Campo correspondente ao peso do volume. |
| aprovado | boolean | Campo que indica que somente serão consultados pedidos de venda aprovados. |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do cliente. |
| cod_filial | string (max 15) | Campo correspondente ao código da filial. |
| cod_pedidov | string (max 15) | Campo correspondente ao código do pedido de venda. |
| cpf | string (max 14) | Campo correspondente ao CPF do cliente. |
| data_emissao | date | Campo correspondente a data de emissão do pedido de venda. |
| data_emissao_final | timestamp | Campo correspondente a data de emissão final. |
| data_emissao_inicial | timestamp | Campo correspondente a data de emissão inicial. |
| efetuado | boolean | Campo que indica que somente serão consultados pedidos de venda efetuados. |
| lista_lcto_mov_sem_adiantamento | boolean |  |
| lista_orcamentos | boolean |  |
| nao_lista_detalhe | boolean | Campo que indica que não será listado o detalhe(produtos,cliente e lançamentos) do Pedido de Venda. |
| pedidov | integer | Campo correspondente ao id do pedido de venda. |
| pedidov_inicial | integer | Campo correspondente ao id do pedido de venda usado como ponto de partida da consulta. |
| tipo_barra | integer |  |
| trans_id | integer | Campo correspondente ao trans_id para a listagem dos pedidos de venda. Comportamento - Os Pedidos de Venda serão listadas a partir desse trans_id. Trans_id é um campo numérico que indica quando um item foi alterado. |
| vitrine | integer | Campo correspondente ao id da vitrine. |
| aprovado | boolean | Indica que o Pedido de Venda foi aprovado |
| cancelado | boolean | Indica que o Pedido de Venda foi Cancelado |
| cod_cliente | string (max 50) |  |
| cod_filial | string (max 10) |  |
| cod_pedidov | string (max 15) | Código do Pedido de Venda |
| cod_tipo_frete | string (max 15) | Código do Tipo de Frete |
| data_atualizacao | timestamp | Data de Atualização do Pedido de Venda |
| data_digitacao | timestamp |  |
| data_emissao | date | Data de Emissão do Pedido de Venda |
| data_entrega | date | Data de Entrega do Pedido de Venda |
| desc_status | string (max 50) | Descrição dos Status dos Produtos do Pedido de Venda |
| desc_tipo_frete | string (max 50) | Descrição do Tipo de Frete do Pedido de Venda |
| desc_tipo_pedido | string (max 100) |  |
| efetuado | boolean | Indica que o Pedido de Venda está efetuado |
| id_vendedor | integer |  |
| n_pedido_cliente | string (max 50) | Número do Pedido de Venda no Cliente |
| nf | string (max 30) |  |
| nome_cliente | string (max 250) |  |
| nome_transportadora | string (max 200) | Nome da Transportadora do Pedido de Venda |
| nome_vendedor | string (max 250) |  |
| pedidov | integer | Id do Pedido de Venda |
| quantidade | float | Quantidade do Pedido de Venda |
| serie | string (max 30) |  |
| status | integer | Id do Status |
| status_workflow_desc | string (max 50) | Descrição do status no workflow |
| total | float | Total do Pedido de Venda |
| trans_id | integer | Trans_id do Pedido de Venda |
| v_desconto | float | Valor do Desconto do pedido de Venda |
| v_frete | float | Valor do Frete do Pedido de Venda |
| valor_final | float | Valor final do Pedido de Venda considerando cortesia, acerto e frete |
| valor_total_entregue | float |  |
| vitrine | integer | Id da vitrine |
| cliente | object array | Cliente do Pedido de Venda |
| aplicar_icms_st | boolean | Campo que identifica se deve ser aplicado ICMS ST para o cliente. |
| cel | string (max 20) | Celular do cliente / contato. |
| cnpj | string (max 20) | CNPJ do cliente. |
| cod_cliente | string (max 12) | Código do cliente Comportamentos É utilizado somente para atualização de cliente. Quando não encontrado um cliente correspondente é retornado erro. |
| cpf | string (max 14) | CPF do cliente. |
| dados_adicionais | string (max 30) | Informações adicionais do cliente. |
| data_aniversario | date | Data de aniversário do cliente. |
| ddd_cel | string (max 3) | DDD do celular do cliente / contato. |
| e_mail | string (max 250) | E-mail do cliente. |
| e_mail_nfe | string (max 250) | E-mail do cliente para emissão da nota fiscal eletrônica. |
| fantasia | string (max 120) | Nome fantasia do cliente. |
| id_externo | string (max 255) | ID externo do cliente associado a vitrine. Comportamentos O envio de Id_externo torna obrigatório o envio do Id da Vitrine |
| ie | string (max 15) | Inscrição estadual do cliente. |
| nome | string (max 120) | Nome do cliente. |
| origem_cliente | string (max 10) | Origem do cadastro do cliente. |
| parentesco | integer | Tipo de parentesco do cliente. (0 = Marido/Noivo/Pai, 1 = Esposa/Noiva/Mãe, 2 = Filho, 3 = Agregado, 4 = Tio/Tia, 5 = Avô/Avó). |
| permite_enviar_newsletter | string (max 1) | Permite enviar NewsLetter - Informar T ou F |
| permite_enviar_sms | string (max 1) | Permite enviar SMS - Informar T ou F |
| pf_pj | string (max 2) | Tipo de cliente. (PF = Pessoa Física, PJ = Pessoa Jurídica). |
| rg | string (max 12) | RG do Cliente. |
| tipo_cli | string (max 1) | 0-Atacado 1-Varejo 3-Franquia 4-Representante 5-Funcionário 6-Catálogo 2-Todos 7-Grupo |
| tipo_sexo | string (max 1) | Sexo do cliente. (M = Masculino, F = Feminino, U = Não Aplicável). |
| tratamento | string (max 20) | Tratamento dado ao cliente. (0 = Sr. , 1 = Sra. , 2 = Dr. , 3 = Dra. , 4 = Srta). |
| ufie | string (max 3) | Estado da inscrição estadual do cliente. |
| vitrine | integer | ID da vitrine. |
| endereco | object array | Endereço do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_cobranca | object array | Endereço de cobrança do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_entrega | object array | Endereço de entrega do cliente. |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| descontos | object array | Informativo de todos os descontos aplicados |
| barra | string (max 20) | Campo correspondente ao código de barras. |
| desconto | float | Campo correspondente ao valor do desconto. |
| descricao | string (max 50) | Campo correspondente a descrição do desconto. |
| id_externo_desconto | string (max 255) | Campo correspondente ao id externo do desconto. |
| item | string (max 20) | Campo correspondente ao ttem do SKU. |
| nome | string (max 255) | Campo correspondente ao nome do desconto. |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| tipo_desc | integer | Campo correspondente ao tipo do desconto(0=Percentual,1=valor). |
| lancamentos | object array | Lançamentos do Pedido de Venda |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| produtos | object array | Itens do Pedido de Venda |
| al_cofins | float | Campo correspondete ao AL COFINS Comportamento Se omitido pega o valor do parâmetro geral. |
| al_icms | float | Campo correspondente ao AL ICMS(00, 20- 102 e T Obrigatório). |
| al_iss | float | Campo correspondente ao AL ISS. |
| al_pis | float | Campo correspondente ao AL PIS Comportamento Se omitido pega o valor do parâmetro geral. |
| altura | float | Campo correspondente a altura. |
| b_cofins | float | Campo correspondente ao B COFINS Comportamento Se não informado, assume o valor do produto. |
| b_icms | float | Campo correspondente a base ICMS. Comportamento Se não informado, assume o valor do produto. |
| b_iss | float | Campo correspondente ao B ISS. |
| b_pis | float | Campo correspondente ao B PIS Comportamento Se não informado, assume o valor do produto. |
| barra | string (max 20) | Campo correspondente ao código de barras. |
| bcuf_dest | float | Campo correspondente ao BCUF_DEST. |
| brindesite | boolean | Campo que indica que o item é um brinde. |
| cfop | string (max 5) | Campo correspondente ao CFOP do produto. |
| cod_cor | string (max 8) | Campo correspondente ao código da cor. |
| cod_estampa | string (max 15) | Campo correspondente ao código da estampa. |
| cod_pedidov | string (max 15) | Campo correspondente ao código do pedido de venda. Utilizado também para informar qual é o pedido encomenda que pertence o item quando for um item de um pedido pai de encomenda. |
| cod_prefaturamento | string (max 85) | Campo correspondente ao código do pré faturamento. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto. |
| cod_trba_iss | string (max 4) | Campo correspondente ao código TRBA_ISS. |
| componente_kit | boolean | Campo que indica que o item é um componente de kit. |
| comprimento | float | Campo correspondente ao comprimento. |
| cst | string (max 3) | Campo correspondente ao CST. |
| data_entrega | date | Campo correspondente a data de entrega do produto. |
| desc_cor | string (max 150) | Campo correspondente a descrição da cor. |
| desc_estampa | string (max 150) | Campo correspondente a descrição da estampa. |
| desc_produto | string (max 500) | Campo correspondente a descrição do produto. |
| desc_status | string (max 50) | Campo correspondente a descrição do status do item. |
| desconto | float | Campo correspondente ao percentual do valor do desconto. |
| descricao_cfop | string (max 40) | Campo correspondente a descrição da CFOP. |
| encomenda | boolean | Campo que indica que o item é uma encomenda. |
| endereco | integer | Campo correspondente ao endereço de entrega do item. |
| fcp_uf_dest | float | Percentual do fundo de combate a pobreza |
| icms | float | Campo correspondent ao ICMS. |
| icms_uf_dest | float | Campo correspondente a alíquota do ICMS de partilha para a UF do destinatário. |
| icmss | float | Campo correspondente ao ICMS. |
| id_externo | string (max 255) | Campo correspondente ao id externo do produto. |
| ipi | float | Campo correspondente ao IPI. |
| it_valor_cortesia | float | Campo correspondente ao valor da cortesia rateado. |
| it_valor_desconto | float | Campo correspondente ao valor do desconto rateado. |
| it_valor_frete | float | Campo correspondente ao valor do frete rateado. |
| item | string (max 20) | Campo correspondente ao código do item. |
| largura | float | Campo correspondente a largura. |
| lote | string (max 50) |  |
| ncm | string (max 20) | Campo correspondente ao NCM. |
| nota_ref | string (max 60) | Campo correspondente a nota de referência. |
| obs_item | string (max 500) | Campo correspondente a observação do item. |
| pfcp_uf_dest | integer | Campo correspondente ao PFCP_UF_DEST. |
| preco | float | Campo correspondente ao preço do produto. |
| preco_icms_iss | float | Campo correspondente ao preco ICMS ISS. |
| presente | boolean | Campo que indica que o item é um presente. |
| quantidade | float | Campo correspondente a quantidade. |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| status | integer | Campo correspondente os status do item. |
| tipo_icms | string (max 3) | Campo correspondente ao tipo do ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF). |
| unidade | string (max 5) | Campo correspondente a unidade. |
| url_imagem | string | Campo correspondente a url das imagens. |
| url_tracking_pedido | string (max 512) | Campo correspondente a URL do correio. |
| v_cofins | float | Campo correspondente ao V COFINS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item. |
| v_fcp_uf_dest | float | Valor do fundo de combate a pobreza |
| v_icms | float | Campo correspondente ao V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS. |
| v_icms_uf_dest | float | Campo correspondente ao valor do ICMS de partilha para a UF do destinatário. |
| v_icms_uf_remet | float | Campo correspondente ao valor do ICMS de partilha para a UF do remetente. |
| v_icmss | float | Campo correspondente ao V ICMS. |
| v_ipi | float | Campo correspondente ao V IPI. |
| v_pis | float | Campo correspondente ao V PIS. Comportamento Se omitido o sistema calcula com base na aliquota e valor do item. |
| valor_total_bruto | float |  |
| valor_total_imposto | float | Campo correspondente ao valor total do imposto. |
| valor_total_liquido | float |  |
| valor_unitario | float | Campo correspondente ao valor unitario. |
| vfcpufdest | float | Campo correspondente ao VFCPUFDEST. |
| retiradas_autorizadas | object array | Lista de pessoas que estão autorizadas a retirar as mercadorias |
| cpf | string (max 14) | Campo correspondente ao CPF da pessoa autorizada à retirar a mercadoria |
| grau_relacionamento | string (max 30) | Campo correspondente ao grau de relacionamento da pessoal autorizada à retirar a mercadoria com o cliente |
| nome | string (max 60) | Campo correspondente ao nome da pessoa autorizada à retirar a mercadoria |
| somente_inclui_pedido | boolean | Campo que limita os pedidos a serem processados. Comportamento - Quando "T" realiza o processamento apenas de pedidos que ainda não foram importados, para "F" apenas de pedidos que já foram importados e ""(vazio) de todos os pedidos. |
| vitrine | integer | Campo correspondente ao id da vitrine. |
| status_pedidos | object array | Campo correspondente aos status de cada pedido a ser processado. |
| bloqueado | boolean | Indica que o pedido não deve ser importado para o millennium |
| cod_etiqueta_transporte | string |  |
| cod_pedidov | string (max 20) | Campo correspondente ao código do pedido. |
| cod_pedidov_original | string (max 251) | Campo correspondente ao código original do pedido. |
| data_entrega | date |  |
| grupo_quebra_separacao | string (max 255) |  |
| id_mensagem | string (max 250) |  |
| id_status_plataforma | string (max 50) |  |
| mensagem_erro | string (max 1000) |  |
| numero_objeto | string (max 40) | Código de rastreio do pedido |
| pdf_etiqueta_transporte | string | Etiqueta a ser impressa no momento do faturamento. A etiqueta de transporte deve estar codificado em Base64. Os formatos aceitos são PDF e ZPL. |
| response | string |  |
| status | integer | Status do pedido(0=Aguardando Pagamento,1=Pagamento Confirmado,2=Em Separação,3=Despachado,4=Entregue,5=Cancelado,6=Problemas,7=Embarcado,8=Falha na Entrega) |
| tipo | integer |  |
| tipo_fila | string (max 10) |  |
| vitrine_pedido | integer |  |
| dados_autorizacao | object array | Campo correspondente ao dados da autorização. |
| autorizacao | string (max 40) | Campo correspondente ao código da autorização. |
| bandeira | integer | Campo correspondente as bandeiras. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) |  |
| desc_bandeira | string (max 50) |  |
| desc_operadora | string (max 50) |  |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| nsu | string (max 50) | Campo correspondente ao NSU do Cartão de Crédito. |
| numero_cartao | string (max 20) | Campo correspondente ao número do Cartão de Crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente as operadoras. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| tipo_pgto | integer | Campo correspondente ao tipo de pagamento. Os Tipos de pagamento disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| transacao | string (max 14) | Campo correspondente ao id da transação Aprova Fácil. |
| doacoes | object array | Campo correspondente as doações. |
| descricao | string (max 30) | Campo correspondente a descrição da doação. |
| valor | float | Campo correspondente ao valor da doação. |
| itens_filiais | object array | Campo correspondente a lista de itens por filial para a realização da reserva, permite a reserva utilizando múltiplas filiais Comportamento - Utilizado no processamento dos status "Pagamento Confirmado" ou "Em Preparação". |
| cor | integer | Campo correspondente ao id da cor. |
| estampa | integer | Campo correspondente ao id da estampa. |
| filial_externa | string (max 50) | Campo correspondente a filial externa. Comportamento - Este campo deve ser informado no cadastro da vitrine na tabela de filiais. |
| filial_externa_nova | string (max 255) | Campo corresponde a nova filial externa |
| grupo_quebra_separacao | string (max 255) | Campo corresponde ao grupo quebra de separação |
| item | string (max 20) | Campo corresponde ao item do pedido. |
| nome_transportadora | string (max 250) | Campo correspondente ao nome do tipo de frete ou transportadora. |
| preco | float | Campo corresponde ao preço |
| produto | integer | Campo correspondente ao id do produto. |
| quantidade | float | Campo correspondente a quantidade a ser reservada. |
| sku | string (max 255) | Campo correspondente ao id do item. Comportamento - Este id é obtido durante todos os serviços do catálogo de produtos. Pode também estar no formato produto_cor_estampa_tamanho. Se informado esse campo não será necessário informar os campos produto, cor, estampa e tamanho. |
| tamanho | string (max 5) | Campo correspondente ao tamanho. |
| tipo | string (max 2) | Campo correspondente ao tipo do produto. |
| tipo_frete | integer | Campo correspondente ao id do tipo de frete. |
| transportadora | integer | Campo correspondente ao id da transportadora. |
| v_frete | float | Campo correspondente ao valor do frete cobrado. |
| lancamentos | object array |  |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| nota | object array | Campo correspondente aos dados da nota para a realização do faturamento. Comportamento - Utilizado no processamento do status "Despachado". |
| cfop | string (max 10) | Código fiscal de operação de um dos itens da nota |
| cidade_origem | string (max 60) |  |
| cod_caixa | integer | Código do caixa. |
| cod_filial | string (max 15) | Código da filial. |
| contribuinte | boolean |  |
| cortesia | float | Desconto adicional de valor (não porcentagens) usado normalmente para corrigir alguns arredondamentos. Deve ser um número negativo. |
| data_emissao_nf | date | Data emissão da nota. |
| doc_cliente | string (max 14) |  |
| estado_origem | string (max 3) |  |
| faturar | string (max 1) | Opção de faturar(N=Não Faturar,I=Importar documento XML,F=Faturar - Indisponível por enquanto). |
| grupo_quebra_separacao | string (max 250) | grupo quebra separacao |
| idnfe | string (max 47) | ID da NFE da nota. |
| idprotocolo | string (max 50) | Id do protocolo |
| mensagemnfe | string (max 200) |  |
| modalidade_frete | string (max 1) |  |
| modelo | string (max 3) | Modelo de documento para faturamento de evento configurado na vitrine. |
| n_serie | string (max 20) | Número de série da ECF ou do SAT, caso o modelo seja cupom fiscal. |
| nfce_server | string (max 5) |  |
| nome_transportadora | string (max 60) | Nome da transportadora da movimentação. |
| nota | integer | Número da nota. |
| numecf | integer | Número do ECF, caso o modelo seja cupom fiscal. |
| numero_rastreio | string (max 512) | Número do objeto do correio |
| obs | string (max 500) |  |
| romaneio | string (max 100) |  |
| serie_nf | string (max 5) | Série da nota. |
| tipo_emissao | string (max 1) |  |
| tipo_frete | integer | Id do tipo de frete |
| url_rastreio | string (max 512) | Url do correio. |
| usa_modbcst6_consumofinal | boolean |  |
| v_acerto | float | Valor total do desconto aplicado a todos os itens da movimentação. Este é o valor relativo ao campo ACERTO. Este campo é fornecido para evitar erros de arredondamento causadas por diferentes estratégias de arredondamento deve ser um número negativo. |
| v_frete | float | Valor do frete cobrado |
| v_juros | float |  |
| valor | float | Valor da nota. |
| valor_troco | float |  |
| xml_doc | string | XML do documento informado no campo Modelo - Obrigatório para quando for 55,59 e 65 |
| caixas | object array | Lista de volumes da movimentação |
| altura | float | Campo correspondente a altura do volume. |
| comprimento | float | Campo correspondente ao comprimento do volume. |
| etiqueta | string | Campo de texto livre utilizado para o envio da etiqueta do volume. |
| largura | float | Campo correspondente a largura do volume. |
| numero_objeto | string (max 50) | Campo correspondente ao número de rastreamento do correio. |
| peso | float | Campo correspondente ao peso do volume. |
| tipo_volume | integer |  |
| url | string (max 255) | Campo correspondente a url do correio. |
| creditos | object array |  |
| lancamento | integer |  |
| valor | float |  |
| lancamentos | object array | Lista de lançamentos da movimentação |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| produtos | object array | Lista de itens da movimentação. |
| al_cofins | float | Campo correspondente ao AL COFINS Comportamento Se omitido pega o valor do parâmetro geral. |
| al_fcp | float |  |
| al_fcp_st | float |  |
| al_icms | float | Campo correspondente ao AL CIMS(00, 20-102 e T Obrigatório) |
| al_icmss | float |  |
| al_ipi | float |  |
| al_pis | float | Campo correspondente ao AL PIS Comportamento Se omitido pega o valor do parâmetro geral. |
| b_fcp | float |  |
| b_fcp_st | float |  |
| b_icms | float | Campo correspondente B COFINS Comportamemto Se não informado, assume o valor do produto. |
| b_icmss | float |  |
| b_ipi | float |  |
| bicm_orig | float |  |
| bonificado | boolean | Indica que o item é bonificado. |
| brindesite | boolean | Indica que o item é um brinde. |
| cbenef | string (max 8) |  |
| cfop | string (max 5) | CFOP |
| codigo_cfop | string (max 20) | Código da CFOP. |
| desconto | float | Percentual do valor do desconto. |
| descricao_cfop | string (max 40) | Descrição da CFOP do produto |
| encomenda | string (max 1) | Indica que o item é uma encomenda. |
| enquadramento_ipi | string (max 3) |  |
| grupo_quebra_separacao | string (max 255) | Grupo quebra separação |
| icm_orig | float |  |
| id_externo | string (max 255) | Id externo do sku. |
| id_externo_produto | string (max 255) | Id externo do produto. |
| it_valor_cortesia | float | Valor da cortesia rateado. |
| it_valor_desconto | float | Valor do desconto rateado. |
| it_valor_frete | float | Valor do frete rateado. |
| item | string (max 20) | Campo correspondente ao código do item. Quando for um componente de kit o código do item deve ser {item_pai}.{item_filho}, exemplo 0001.0001, 0001.0002 ... |
| item_xml_nfe | integer |  |
| numero_prefat | string (max 15) | Número do pré-faturamento. |
| obs_item | string (max 500) | Observação do item. |
| peso_b | float |  |
| peso_l | float |  |
| preco | float | Preço do produto. |
| presente | boolean | Indica que o item é um presente. |
| quantidade | float | Quantidade. |
| quantidadenc | float |  |
| sit_trib_ipi | string (max 3) |  |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| taxa_icmss | float |  |
| taxcode | string (max 10) |  |
| tipo_icms | string (max 3) | Campo correspondente ao tipo ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF). |
| tx_red_icms | float |  |
| unidade | string (max 15) |  |
| v_cofins | float | Campo correspondente ao V COFINS Comportamento - Se omitido o sistema calcula com base na aliquota e valor do item. |
| v_fcp | float |  |
| v_fcp_st | float |  |
| v_icms | float | Campo correspondente ao V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS. |
| v_icms_uf_dest | float | Valor do ICMS de partilha para a UF do destinatário. |
| v_icms_uf_remet | float | Valor do ICMS de partilha para a UF do remetente. |
| v_icmss | float |  |
| v_ipi | float |  |
| v_pis | float | Campo correspondente ao V PIS Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| vendedor_item | integer |  |
| volumes | object array |  |
| altura | float |  |
| comprimento | float |  |
| largura | float |  |
| numero_rastreio | string (max 50) | Número do objeto no correio |
| peso | float |  |
| url_rastreio | string (max 512) | URL de rastreio do objeto no correio |
| acoes | object array | Lista de ações a serem tomadas de acordo com os status |
| acao | integer | Ações a serem tomadas(0=Nenhuma,1=Incluir Pedido,2=Mudar Status,100=Erro). |
| cancelado | boolean | Indica se o pedido está cancelado. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria. |
| cod_pedidov | string (max 12) | Código do pedido. |
| cod_pedidov_original | string (max 50) | Código original do pedido. |
| data_conclusao_embarque | timestamp |  |
| data_emissao_nf | date | Data da emissão da nota do pedido. |
| data_entrega | date | Data de entrega do pedido |
| data_hora_emissao_nf | timestamp | Data e Hora de emissão da nota do pedido. |
| data_prevista_entrega | date | Data prevista para a entrega do pedido |
| desc_status_workflow | string (max 50) | Descrição do status do Workflow |
| efetuado | boolean | Indica se o pedido está faturado total. |
| erro | string (max 1000) | Mensagem do erro quando a ação for 100. |
| fantasia_transportadora | string (max 70) | Nome Fantasia da transportadora da nota do pedido. |
| idnfe | string (max 47) | Id da NFE da nota do pedido. |
| motivo_canc | string (max 255) | Motivo do cancelamento do pedido. |
| n_pedido_cliente | string (max 50) | Número do pedido do cliente cadastrado para o pedido. |
| nome_recebedor | string (max 100) | Nome do recebedor. |
| nome_transportadora | string (max 100) | Nome da transportadora da nota do pedido. |
| nota | integer | Número da nota do pedido. |
| numero_rastreio | string (max 512) | Número do objeto do correio. |
| processar_embarque | boolean |  |
| serie_nf | string (max 5) | Série da nota do pedido. |
| status | integer | Status dos pedidos(0=Aguardando Pagamento,1=Pagamento Confirmado,2=Em Separação,3=Despachado,4=Entregue,5=Cancelado,6=Problemas,7=Embarcado,8=Falha na Entega). |
| status_plataforma | string (max 50) | Status de integração dos pedidos na plataforma |
| tipo_frete | integer | Id do tipo de frete |
| url_rastreio | string (max 512) | Url do correio. |
| valor | float | Valor da nota do pedido. |
| notas | object array | Lista de notas do pedido. |
| cfop | string (max 10) | Código fiscal de operação de um dos itens da nota |
| cidade_origem | string (max 60) |  |
| cod_caixa | integer | Código do caixa. |
| cod_filial | string (max 15) | Código da filial. |
| contribuinte | boolean |  |
| cortesia | float | Desconto adicional de valor (não porcentagens) usado normalmente para corrigir alguns arredondamentos. Deve ser um número negativo. |
| data_emissao_nf | date | Data emissão da nota. |
| doc_cliente | string (max 14) |  |
| estado_origem | string (max 3) |  |
| faturar | string (max 1) | Opção de faturar(N=Não Faturar,I=Importar documento XML,F=Faturar - Indisponível por enquanto). |
| grupo_quebra_separacao | string (max 250) | grupo quebra separacao |
| idnfe | string (max 47) | ID da NFE da nota. |
| idprotocolo | string (max 50) | Id do protocolo |
| mensagemnfe | string (max 200) |  |
| modalidade_frete | string (max 1) |  |
| modelo | string (max 3) | Modelo de documento para faturamento de evento configurado na vitrine. |
| n_serie | string (max 20) | Número de série da ECF ou do SAT, caso o modelo seja cupom fiscal. |
| nfce_server | string (max 5) |  |
| nome_transportadora | string (max 60) | Nome da transportadora da movimentação. |
| nota | integer | Número da nota. |
| numecf | integer | Número do ECF, caso o modelo seja cupom fiscal. |
| numero_rastreio | string (max 512) | Número do objeto do correio |
| obs | string (max 500) |  |
| romaneio | string (max 100) |  |
| serie_nf | string (max 5) | Série da nota. |
| tipo_emissao | string (max 1) |  |
| tipo_frete | integer | Id do tipo de frete |
| url_rastreio | string (max 512) | Url do correio. |
| usa_modbcst6_consumofinal | boolean |  |
| v_acerto | float | Valor total do desconto aplicado a todos os itens da movimentação. Este é o valor relativo ao campo ACERTO. Este campo é fornecido para evitar erros de arredondamento causadas por diferentes estratégias de arredondamento deve ser um número negativo. |
| v_frete | float | Valor do frete cobrado |
| v_juros | float |  |
| valor | float | Valor da nota. |
| valor_troco | float |  |
| xml_doc | string | XML do documento informado no campo Modelo - Obrigatório para quando for 55,59 e 65 |
| caixas | object array | Lista de volumes da movimentação |
| altura | float | Campo correspondente a altura do volume. |
| comprimento | float | Campo correspondente ao comprimento do volume. |
| etiqueta | string | Campo de texto livre utilizado para o envio da etiqueta do volume. |
| largura | float | Campo correspondente a largura do volume. |
| numero_objeto | string (max 50) | Campo correspondente ao número de rastreamento do correio. |
| peso | float | Campo correspondente ao peso do volume. |
| tipo_volume | integer |  |
| url | string (max 255) | Campo correspondente a url do correio. |
| creditos | object array |  |
| lancamento | integer |  |
| valor | float |  |
| lancamentos | object array | Lista de lançamentos da movimentação |
| adiantamento | boolean | Campo que indica que é um adiantamento financeiro. |
| agencia | string (max 6) | Campo correspondente a agência bancária. |
| ano_validade_cartao | string (max 2) | Campo correspondente ao ano de validade do cartão de crédito. |
| autorizacao | string (max 40) | Campo correspondente ao número da autorização do pagamento. |
| bandeira | integer | Campo correspondente a bandeira. As bandeiras disponíveis serão listados pelo método pedido_venda.ListaBandeiras. |
| barra_digitada | string (max 55) | Campo correspondente a linha digitável do boleto. |
| barra_leitora | string (max 50) | Campo correspondente ao código de barras do boleto. |
| c_c | string (max 30) | Campo correspondente ao número da conta corrente. |
| cartao_presente | string (max 50) |  |
| cod_autorizacao_cartao | string (max 40) | Campo correspondente ao código de autorização retornado pela adm do cartão. |
| cod_cond_pagto | integer |  |
| cod_seguranca_cartao | string (max 4) | Campo correspondente ao código de segurança do cartão de crédito. |
| cod_tipo_pgto | integer | Campo correspondente ao código do tipo de pagamento. |
| comprovante_administradora | string | Campo correspondente ao comprovante da administradora. |
| condicao_pgto | integer |  |
| cpf_portador_cartao | string (max 14) | Campo correspondente ao CPF do titular do cartão de crédito. |
| credito | boolean |  |
| data_aprova_facil | date | Campo correspondente a data de processamento Aprova Fácil. |
| data_emissao | date | Campo correspondente a data da emissão do lançamento. |
| data_pagamento | date | Campo correspondente a data de pagamento do lançamento. |
| data_vencimento | date | Campo correspondente a data de vencimento do lançamento. |
| desc_bandeira | string (max 30) | Campo correspondente a descrição da bandeira. |
| desc_cond_pagto | string (max 50) | Campo correspondente ao desconto da condição de pagamento. |
| desc_operadora | string (max 20) | Campo correspondente a descrição da operadora. |
| desc_tipo | string (max 150) | Campo correspondente a descrição do tipo de pagamento. |
| desconto | float | Campo correspondente ao valor do desconto. |
| documento | string (max 20) | Campo correspondente ao número do lançamento. |
| duplicata | string (max 40) | Campo correspondente o número do título no banco(nosso número). |
| efetuado | boolean |  |
| gateway_pagamento | string (max 50) | Campo correspondente ao Gateway de Pagamento(ex:. BRASPAG, ADYEN, etc). |
| item | string (max 10) | Campo correspondente ao item. |
| mensagem_aprova_facil | string (max 200) | Campo correspondente a mensagem do Aprova Fácil. |
| mes_validade_cartao | string (max 2) | Campo correspondente ao mes de validade do cartão de crédito. |
| n_cheque | string (max 20) |  |
| natureza | string (max 40) |  |
| nome_portador_cartao | string (max 50) | Campo correspondente ao nome do portador do cartão de crédito. |
| nsu | string (max 40) | Campo correspondente ao NSU do TEF(se houver). |
| numcontrato | string (max 20) | Campo correspondente ao número do contrato para crediário. |
| numero_cartao | string (max 25) | Campo correspondente ao número do cartão de crédito. |
| numero_credito | string (max 20) | Campo correspondente ao número da movimentação de entrada(Nota fiscal ou romaneio) em que pertence o título usado como crédito. |
| numparc | integer | Campo correspondente ao número de parcelas. |
| operadora | integer | Campo correspondente a operadora. As operadoras disponíveis serão listados pelo método pedido_venda.ListaOperadoras. |
| parcela | integer | Campo correspondente ao número de parcelas. |
| pedido | string (max 20) | Campo correspondente ao pedido. |
| perc_desconto | float | Campo correspondente ao percentual de desconto. |
| plano_financiamento | string | Campo correspondente as fnformações passadas pelo financeiro. |
| previsao | boolean | Campo que indica que é uma previsão financeira. |
| rede | string (max 20) | Campo correspondente a rede do pagamento. |
| resumo_venda | string (max 25) | Campo correspondente ao resumo da venda. |
| status_aprovacao | string (max 20) |  |
| tabela_financiamento | string (max 40) | Campo correspondente a tabela utilizada para o cartão. |
| tef | boolean | Campo que indica que o lançamento foi gerado utilizando TEF. |
| tipo_pgto | integer | Campo correspondente aos tipos da pagamento. Os Tipos de pagamentos disponíveis serão listados pelo método pedido_venda.ListaTiposPgto. |
| token_cartao_gp | string (max 40) | Campo correspondente ao token identificador do cartão. |
| transacao | string (max 70) | Campo correspondente ao id da transação Aprova Fácil. |
| transacao_aprovada | string (max 1) | Campó que indica se a transação foi aprovada(F=Reprovado,T=Aprovado,R=Reservado,S=Cancelamento Solicitado,C=Cancelado). |
| transacao_gp | string (max 40) | Campo correspondente ao número transação do Gateway de pagamento. |
| url_boleto | string (max 254) | Campo correspondente a URL do boleto. |
| valor_inicial | float | Campo correspondente ao valor inicial do lançamento. |
| valor_inicial_porpor | float | Campo correspondente ao valor iniciar porpor. |
| valor_liquido | float | Campo correspondente ao valor líquido. |
| valor_pago | float |  |
| produtos | object array | Lista de itens da movimentação. |
| al_cofins | float | Campo correspondente ao AL COFINS Comportamento Se omitido pega o valor do parâmetro geral. |
| al_fcp | float |  |
| al_fcp_st | float |  |
| al_icms | float | Campo correspondente ao AL CIMS(00, 20-102 e T Obrigatório) |
| al_icmss | float |  |
| al_ipi | float |  |
| al_pis | float | Campo correspondente ao AL PIS Comportamento Se omitido pega o valor do parâmetro geral. |
| b_fcp | float |  |
| b_fcp_st | float |  |
| b_icms | float | Campo correspondente B COFINS Comportamemto Se não informado, assume o valor do produto. |
| b_icmss | float |  |
| b_ipi | float |  |
| bicm_orig | float |  |
| bonificado | boolean | Indica que o item é bonificado. |
| brindesite | boolean | Indica que o item é um brinde. |
| cbenef | string (max 8) |  |
| cfop | string (max 5) | CFOP |
| codigo_cfop | string (max 20) | Código da CFOP. |
| desconto | float | Percentual do valor do desconto. |
| descricao_cfop | string (max 40) | Descrição da CFOP do produto |
| encomenda | string (max 1) | Indica que o item é uma encomenda. |
| enquadramento_ipi | string (max 3) |  |
| grupo_quebra_separacao | string (max 255) | Grupo quebra separação |
| icm_orig | float |  |
| id_externo | string (max 255) | Id externo do sku. |
| id_externo_produto | string (max 255) | Id externo do produto. |
| it_valor_cortesia | float | Valor da cortesia rateado. |
| it_valor_desconto | float | Valor do desconto rateado. |
| it_valor_frete | float | Valor do frete rateado. |
| item | string (max 20) | Campo correspondente ao código do item. Quando for um componente de kit o código do item deve ser {item_pai}.{item_filho}, exemplo 0001.0001, 0001.0002 ... |
| item_xml_nfe | integer |  |
| numero_prefat | string (max 15) | Número do pré-faturamento. |
| obs_item | string (max 500) | Observação do item. |
| peso_b | float |  |
| peso_l | float |  |
| preco | float | Preço do produto. |
| presente | boolean | Indica que o item é um presente. |
| quantidade | float | Quantidade. |
| quantidadenc | float |  |
| sit_trib_ipi | string (max 3) |  |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| taxa_icmss | float |  |
| taxcode | string (max 10) |  |
| tipo_icms | string (max 3) | Campo correspondente ao tipo ICMS(00-90 Venda empresa Normal,102-900 Simples Nacional,T I N e F apenas para Cupom Fiscal - ECF). |
| tx_red_icms | float |  |
| unidade | string (max 15) |  |
| v_cofins | float | Campo correspondente ao V COFINS Comportamento - Se omitido o sistema calcula com base na aliquota e valor do item. |
| v_fcp | float |  |
| v_fcp_st | float |  |
| v_icms | float | Campo correspondente ao V ICMS Comportamento Se omitido o sistema calcula com base na aliquota e no TIPO_ICMS. |
| v_icms_uf_dest | float | Valor do ICMS de partilha para a UF do destinatário. |
| v_icms_uf_remet | float | Valor do ICMS de partilha para a UF do remetente. |
| v_icmss | float |  |
| v_ipi | float |  |
| v_pis | float | Campo correspondente ao V PIS Comportamento Se omitido o sistema calcula com base na aliquota e valor do item |
| vendedor_item | integer |  |
| volumes | object array |  |
| altura | float |  |
| comprimento | float |  |
| largura | float |  |
| numero_rastreio | string (max 50) | Número do objeto no correio |
| peso | float |  |
| url_rastreio | string (max 512) | URL de rastreio do objeto no correio |

---

###  PERFIL_IMPOSTOS

**Endpoint:** `GET /api/general/ perfil_impostos`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| cgc | string (max 18) | CNPJ da Filial |
| filial | integer | Código da Filial |
| nome * | string (max 60) | Nome da Filial |

---

###  PONTOS_RETIRADA

**Endpoint:** `GET /api/general/ pontos_retirada`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| nome | string (max 120) | Nome do ponto de retirada |
| endereco | object array | Endereço do ponto de retirada |
| bairro | string (max 200) | Bairro do endereço |
| cep | string (max 9) | Cep do endereço |
| cidade | string (max 60) | IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| cnpj_filial_retira | string (max 20) | CNPJ da filial de retirada da mercadoria |
| cod_endereco | integer | Campo correspondente ao código do endereço. Esse código deve estar cadastrado, pois é utilizado apenas para atualizar o endereço existente. |
| cod_filial_retira | string (max 10) | Código da filial de retirada da mercadoria |
| complemento | string (max 200) | Complemento do endereço |
| contato | string (max 30) | Nome do contato que estará no endereço informado (empregado, porteiro, parente etc) |
| ddd | string (max 4) | DDD do contato informado |
| ddd_cel | string (max 5) | DDD do celular do contato |
| desc_tipo_endereco | string (max 20) | Descrição do Tipo do Endereço(Exemplo: residencial, comercial) |
| dicas_endereco | string (max 30) | Instruções de direção ou ponto de referência do endereço |
| estado | string (max 3) | IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informado seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Fax do contato informado |
| fone | string (max 20) | IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| grau_relacionamento | string (max 30) | Grau de Relacionamento com o contato |
| ie | string (max 20) | Inscrição estadual do endereço |
| logradouro | string (max 200) | Logradouro do endereço |
| nome_pais | string (max 20) | Nome do País em que o contato reside |
| numero | string (max 10) | Número da residência do endereço |
| ramal | string (max 10) | Ramal do contato informado |
| tipo_sexo | string (max 1) | Tipo do Sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável') |
| endereco_retirada | integer |  |
| ponto_retirada | integer |  |

---

###  PRODUTOS

**Endpoint:** `GET /api/general/ produtos`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| cod_produto | string (max 60) | Campo correspondente ao código do produto. |
| referencia_sku | string (max 15) | Campo correspondente a referência do sku. |
| vitrine | integer | Campo correspondente ao id da vitrine. |
| cod_produto | string (max 60) | Código do produto |
| desc_status | string (max 50) | Descrição do status do produto |
| descricao_literal | string (max 255) | Descrição Literal do produto |
| descricao_produto_site | string | Descrição do produto no site |
| descricao_traduzida | string (max 100) | Descrição traduzida do produto |
| nome_produto_site | string | Nome do produto no site |
| status | integer | Id do status do produto |
| vitrine | integer | Id da vitrine |
| skus | object array |  |
| barra | string (max 20) | Campo correspondente a barra. |
| sku_padrao | boolean | Campo indica se o sku é padrao. |
| desagrupar_cores | boolean | Campo que indica o desagrupamento do produto em cores ao enviar para a plataforma. |
| lista_preco | boolean | Campo que indica a listagem dos preços do produto. |
| todas_vitrines | boolean | Quando verdadeiro seleciona todas as vitrines |
| trans_id | integer | Campo correspondente ao trans_id para a listagem dos produtos, os produtos serão listados a partir desse trans_id. Trans_id é um campo numérico que indica quando um item foi alterado. |
| vitrine | integer | Campo correspondente ao id da vitrine. |
| web | string (max 1) | Campo correspondente ao campo WEB.(F=Indisponível na WEB,T=Disponível na WEB,E=Excluir da WEB). |
| altura | float | Altura do produto |
| apelido_cor | string (max 40) | Apelido da cor do produto |
| apelido_estampa | string (max 40) | Apelido da estampa do produto |
| apelido_tamanho | string (max 40) | Apelido do tamanho do produto |
| ativo | string (max 1) | Indica se o produto está ativo |
| aviso | string | Avisos do produto |
| bloqueado | boolean |  |
| cod_categoria | string (max 15) | Código da categoria do produto |
| cod_colecao | string (max 15) | Código da coleção do produto |
| cod_departamento | string (max 15) | Código do departamento do produto |
| cod_divisao | string (max 15) | Código da divisão do produto |
| cod_grupo | string (max 15) | Código do grupo do produto |
| cod_isbn | string (max 20) | Código ISBN do produto |
| cod_marca | string (max 15) | Código da marca do produto |
| cod_produto | string (max 60) | Código do Produto |
| cod_produto_fornec | string (max 255) | Código do produto no fornecedor |
| cod_subcolecao | string (max 15) | Código da subcoleção do produto |
| cod_tipo | string (max 15) | Código do tipo do produto |
| codigo_youtube | string (max 255) | Código do youtube do produto |
| comprimento | float | Comprimento do produto |
| cubagem | float | Cubagem do produto(Altura*Largura*Comprimento) |
| custo | float | Preco de custo |
| data_cadastro | date | Data de cadastro do produto |
| data_lancamento | date | Data de lançamento do produto |
| desc_categoria | string (max 150) | Descrição da categoria do produto |
| desc_colecao | string (max 150) | Descrição da coleção do produto |
| desc_departamento | string (max 150) | Descrição do departamento do produto |
| desc_divisao | string (max 150) | Descrição da divisão do produto |
| desc_grupo | string (max 150) | Descrição do grupo do produto |
| desc_marca | string (max 150) | Descrição da marca do produto |
| desc_subcolecao | string (max 150) | Descrição da subcoleção do produto |
| desc_tipo | string (max 150) | Descrição do tipo do produto |
| descricao_etiq | string (max 100) | Descrição da etiqueta do produto |
| descricao_literal | string (max 100) | Descrição literal do produto |
| descricao_original | string (max 100) | Descrição original do produto |
| descricao_produto_anuncio | string | Anúncios do produto |
| descricao_produto_site | string | Descrição do produto que será exibido no site |
| descricao_sf | string (max 100) | Descrição do produto informada pelo usuário |
| descricao_traduzida | string (max 100) | Descrição traduzida do produto |
| descricao1 | string (max 100) | Descrição do Produto |
| descricao2 | string (max 100) | Segunda descrição do produto |
| excluido | boolean | Indica se o produto está excluído |
| exibir_prod_sem_est | boolean | Exibir produto sem estoque |
| expressao_imagem | string | Expressão para identificar a localização da imagem |
| fator_conversao_dimensao | float | Fator de conversão da dimensão |
| fator_conversao_peso | float | Fator de conversão do peso |
| forma_apresentacao | string (max 1) | Configuração do formato de apresentação do produto ('U'='Único'; 'A'='Grade Aberta'; 'F'='Grade fechada'; 'C'='Composto Multiplos Produtos'; 'P'='Padrão da Vitrine') |
| fornecedor_principal | string (max 50) | Nome do fornecedor principal do produto |
| horizonte_estoq_projetado | integer | Horizonte do estoque projetado |
| id_fornecedor_principal | string (max 50) | Codigo do fornecedor principal do produto |
| id_sem_categoria | integer |  |
| itens_inclusos | string | Descrição dos itens inclusos do produto |
| kit | boolean | Indica se o produto é um kit |
| largura | float | Largura do produto |
| lead_time_entrega | integer | Tempo de entrega do produto |
| lojas | string (max 255) | Lista de lojas do produto |
| ncm | string (max 10) | NCM do produto |
| nome_complemento | string (max 300) | Nome complemento do produto |
| nome_estilista | string (max 255) | Nome do estilista do produto |
| nome_produto_site | string | Nome do produto que será exibido no site |
| obs | string | Observação do produto |
| palavra_chave | string | Palavra chave do produto |
| permite_pedido_sem_estoque | string (max 1) | Permite a venda do produto sem estoque |
| peso | float | Peso do Produto |
| pre_venda | string (max 1) | Indica se o produto é uma pré-venda |
| qtde_ativos | integer | Quantidade de skus ativos do produto |
| qtde_max_venda | integer | Quantidade máxima para venda cadastrado para o produto |
| quantidade_multipla | float |  |
| referencia | string (max 50) | Referência do produto |
| tipo_prod | string (max 2) | Tipo do produto(AC = Produto acabado, MP = Matéria prima, MC = Material de consumo, AG = Agrupador) |
| trans_id | integer | Trans_id do produto |
| unidade_uso | string (max 5) | Unidade de Uso - VENDA |
| url_produto | string (max 250) | Url do produto |
| visibilidade | string (max 4) | Visibilidade do produto na plataforma |
| vitrine | integer | Id da vitrine |
| volumes_peso | float | Peso dos volumes do produto |
| web | string (max 1) | F=Indisponível na WEB; T=Disponível na WEB; E=Excluir da WEB |
| classificacoes | object array | Lista de classificações do produto. Corresponde a árvore de classificação no qual o produto está vinculado na vitrine |
| controle_ultimas_unidade | integer | Campo correspondente a quantidade mínima de estoques por categoria, com esta informação o site entende controla a disponibilidade do produto. |
| mandatory_for_lookbook | boolean | Campo que caso o estoque do produto desta categoria zere, o estoque do LookBook inteiro acaba. |
| permite_presente | boolean | Campo que determina que todos os produtos dentro desta categoria será enviado na API de saída como novo campo. |
| pickup_in_store | boolean | Campo que indica se a categoria permite retira em loja, o controle estará no Millennium, somente produtos desta categoria poderão ser retirados em loja, a marcação não estará no produto. |
| visivel_web | boolean | ????????????Para habilitar uma categoria em uma determina, categoria inativas não envia para o SITE, mesmo com produto dentro. Campo será utilizado para criar uma categoria e inserir produtos nela, mas que não pode ser visualizada no site até que seja marcada. |
| vitrine_classificacao | integer | Campo correspondente ao id da classificação na vitrine. Este id é relacionado com os produtos contidos nesta classificação. |
| especificacoes | object array | Lista de especificações do produto |
| caracteristica | boolean | Indica se a especificação irá se comportar como característica |
| cor | integer | id da Cor |
| desc_prod | string | Descrição da especificação do produto |
| descricao | string (max 255) | Descrição da especificação |
| estampa | integer | id da estampa |
| filtro | boolean | Indica se a especificação irá se comportar como filtro |
| tamanho | string (max 5) | id do tamanho |
| tipo_espec | string (max 2) | Tipo da especificação(01=Texto livre,02=Valores especificados) |
| fornecedores | object array | Lista de fornecedores do produto |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do fornecedor. |
| cod_fornecedor | string (max 50) | Campo correspondente ao código do fornecedor. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto no fornecedor. |
| cpf | string (max 14) | Campo correspondente ao CPF do fornecedor. |
| fantasia | string (max 50) | Campo correspondente a fantasia do fornecedor. |
| nome | string (max 50) | Campo correspondente ao nome do fornecedor. |
| obs | string | Campo correspondente a observação do fornecedor. |
| medidas | object array | Lista de medidas do produto |
| desc_medida | string (max 30) | Descrição da medida |
| tamanho | string (max 5) | Tamanho da medida |
| valor | float | Valor da medida |
| sku | object array | Lista de skus do produto |
| altura | float | Campo correspondente a altura do sku. |
| altura_real | float |  |
| ativo | string (max 1) | Campo que indica se o sku está ativo(1=Ativo,0=Inativo). |
| barra | string (max 40) | Campo correspondente ao código de barras do sku. |
| barra_ref | string (max 40) | Campo correspondente ao código de Barras usado como id de referência do sku quando o "Id Referência Sku" estiver configurado na vitrine como "Código de Barras". |
| barra13 | string (max 40) | Campo correspondente o código de barras com 13 Digitos do sku. |
| cod_cor | string (max 8) | Campo correspondente ao código da cor do sku. |
| cod_est | string (max 4) | Campo correspondente ao código da estampa do sku. |
| cod_produto | string (max 60) | Campo correspondente o código do produto do sku. |
| codigo_imagem | string (max 30) |  |
| comprimento | float | Campo correspondente o comprimento do sku. |
| comprimento_real | float |  |
| ctamanho | integer |  |
| custo | float | Campo correspondente o preço de custo. |
| data_lancamento | date | Campo correspondente a data de lançamento do produto. |
| desc_cor | string (max 255) | Campo correspondente a descrição da cor do sku. |
| desc_estampa | string (max 255) | Campo correspondente a descrição da estampa do sku. |
| desc_produto | string (max 100) | Campo correspondente a descrição do produto do sku. |
| desc_tamanho | string (max 255) | Campo correspondente a descrição do tamanho do sku. |
| estoque_min | integer | Campo correspondente o estoque mínimo do sku. |
| fornecedor_principal | string (max 50) | Campo correspondente ao nome do fornecedor principal do produto. |
| id_externo_produto | string (max 255) |  |
| id_fornecedor_principal | string (max 50) | Nome do fornecedor principal do produto |
| importado | boolean | Campo que indica se o sku já foi importado(publicado). |
| inicio_pre_venda | date | Campo correspondente a data do inicio da pré-venda do produto. |
| kit | boolean | Campo que indica se o sku é um kit. |
| largura | float | Campo correspondente a largura do sku. |
| largura_real | float |  |
| lead_time_entrega | integer | Campo correspondente ao tempo de entrega do sku. |
| maior_preco | float | Maior preço |
| menor_preco | float | Menor preço |
| num_cores | integer | Campo correspondente a quantidade de cores do produto. |
| num_estampas | integer | Campo correspondente a quantidade de estampas do produto. |
| num_tamanhos | integer | Campo correspondente a quantidade de tamanhos do produto. |
| obs_sku1 | string |  |
| obs_sku2 | string |  |
| obs_sku3 | string |  |
| obs_sku4 | string |  |
| obs_sku5 | string |  |
| observacao_cor | string (max 100) |  |
| palavra_chave | string | Campo corresponde a palavra chave configurada por SKU. |
| permite_antecipar_picking | boolean | Campo que indica que permite antecipar picking. |
| permite_pedido_sem_estoque | string (max 1) | Campo que indica se permite a venda do sku sem estoque(T=True,F=False). |
| peso | float | Campo correspondente o peso do sku. |
| peso_real | float | Campo correspondente o peso real do produto |
| pre_venda | string (max 1) | Campo que indica se o sku é uma pré-venda(T=True,F=False) |
| referencia | string (max 15) | Campo correspondente a referencia da caracteristica sku. |
| referencia_cor | string (max 20) |  |
| sku | string (max 255) | Id do sku no formato produto_cor_estampa_tamanho |
| sku_base | boolean | Campo que indica que o sku é o base do produto. |
| sku_padrao | boolean | Campo que indica se o sku é o padrão do produto. |
| url_imagens | string |  |
| validade_final_preco | timestamp | Validade final do preço |
| validade_inicial_preco | timestamp | Validade inicial do preço |
| vitrine | integer |  |
| cartela_cores | object array | Campo correspondente a cartela de cores. |
| descricao | string (max 40) | Campo correspondente a descrição da cartela de cores. |
| componentes_sku_kit | object array | Campo correspondente a lista de Componentes do kit. |
| id_externo | string (max 255) |  |
| incluir | boolean | Campo que indica se o sku componente está ativo. |
| produto_filho | integer |  |
| produto_pai | integer |  |
| quantidade | integer | Campo correspondente a quantidade do sku componente. |
| sku | string (max 20) | Campo correspondente ao sSku componente no formato produto_cor_estampa_tamanho |
| estoques | object array |  |
| barra | string (max 40) | Campo correspondente ao código de barras do sku. |
| barra_ref | string (max 255) | Código de Barrra_ref configurado na vitrine |
| cod_filial | string (max 10) |  |
| cod_produto | string (max 60) |  |
| cor | integer | Campo correspondente ao id da cor. |
| data_atualizacao | timestamp | Campo correspondente a data de atualização do preço. Como os resultados são ordenados por este campo, basta guardar o último processado para informar como parâmetro DATA_ATUALIZACAO_INICIAL na próxima chamada. |
| data_compra | date | Campo correspondente a data da compra do sku. |
| data_envio | timestamp | Campo correspondente a data de envio do sku. |
| empenho | float | Campo correspondente ao saldo da reserva do produto (não deve ser considerado como saldo disponível). |
| estampa | integer | Campo correspondente ao id da estampa. |
| estoque_min | integer | Campo correspondente ao estoque mínimo do sku. |
| estoque_nivel_kit | boolean |  |
| filial | integer | Campo correspondente ao id da filial. |
| filial_externa | string (max 50) | Campo correspondente a filial externa. |
| id | string (max 255) | Campo correspondente ao id do sku(Será o Id_externo se possuir valor, senão será o vitrine_produto_sku). |
| id_externo | string (max 255) | Campo correspondente ao id externo do sku. |
| id_externo_produto | string (max 255) |  |
| incluir | string (max 1) |  |
| kit | boolean |  |
| lead_time | integer |  |
| lote | string (max 50) |  |
| permite_pedido_sem_estoque | string (max 1) | Campo que permite a venda do sku sem estoque. |
| pre_venda | string (max 1) |  |
| preco_custo | float |  |
| produto | integer | Campo correspondente ao id do produto. |
| reserva_naovitrine | float | Campo correspondente ao saldo da reserva dos pedidos não vinculados a vitrine. |
| reserva_vitrine | float | Campo correspondente ao saldo da reserva dos pedidos vinculados a vitrine |
| revendedor_integrado | string (max 50) |  |
| saldo | float | Campo correspondente ao saldo de estoque do produto. |
| saldo_compra | float | Campo correspondente ao saldo da compra do sku. |
| saldo_naovitrine | float | Campo correspondente ao saldo dos pedidos não reservados e não vinculados a vitrine. |
| saldo_vitrine | float | Campo correspondente ao saldo dos pedidos não reservados vinculados a vitrine. |
| saldo_vitrine_com_reserva | float |  |
| saldo_vitrine_sem_reserva | float |  |
| sku | string (max 255) | Campo correspondente ao SKU no formato produto_cor_estampa_tamanho. |
| tamanho | string (max 5) | Campo correspondente ao código do tamanho. |
| total_saldo_vitrine_sem_reserva | float |  |
| trans_id | integer | Campo correspondente trans_id. |
| vitrine_produto_sku | string (max 20) | Campo correspondente ao id do SKU. |
| fornecedores_sku | object array | Campo correspondente a lista de fornecedores do produto. |
| cnpj | string (max 20) | Campo correspondente ao CNPJ do fornecedor. |
| cod_fornecedor | string (max 50) | Campo correspondente ao código do fornecedor. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto no fornecedor. |
| cpf | string (max 14) | Campo correspondente ao CPF do fornecedor. |
| fantasia | string (max 50) | Campo correspondente a fantasia do fornecedor. |
| nome | string (max 50) | Campo correspondente ao nome do fornecedor. |
| obs | string | Campo correspondente a observação do fornecedor. |
| utilizacoes | object array |  |
| cod_utilizacao | string (max 5) |  |
| descricao | string (max 100) |  |
| utilizacao | integer |  |

---

###  TABELAS_PRECO

**Endpoint:** `GET /api/general/ tabelas_preco`

---

###  TRANSPORTADORAS

**Endpoint:** `GET /api/general/ transportadoras`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| cnpj | string (max 20) | Campo correspondente ao CNPJ da transportadora. |
| cod_transportadora | string (max 15) | Campo correspondente ao código da transportadora. |
| email | string (max 250) | Campo correspondente ao email da transportadora. |
| nome | string (max 250) | Campo correspondente ao nome da transportadora. |
| cnpj | string (max 20) | Email da transportadora |
| cod_transportadora | string (max 15) | Código da transportadora |
| nome | string (max 250) | Nome da transportadora |
| transportadora | integer | Id da transportadora |
| cod_transportadora | string (max 10) | Código da transportadora |
| trans_id | integer | Valor do controle incremental de alteração |
| cel | string (max 20) | Celular da transportadora |
| cnpj | string (max 19) | CNPJ da transportadora |
| cod_transportadora | string (max 15) | Código identificando a transportadora. Se este código não for informado, o sistema irá automaticamente localizar o registro pelo RG, CNPJ ou EMail. Se for informado, o sistema irá atualizar a transportadora com o código especificado. |
| cpf | string (max 14) | CPF da transportadora |
| ddd | string (max 3) | DDD do celular da transportadora |
| e_mail | string (max 100) | Email da transportadora |
| fantasia | string (max 120) | Fantasia da transportadora |
| ie | string (max 20) | Inscrição Estadual da transportadora |
| nome | string (max 120) | Nome da transportadora |
| obs | string | Observação da transportadora |
| pf_pj | string (max 2) | Tipo da pessoa da transportadora (PF = Pessoa Física, PJ = Pessoa Jurídica) |
| rg | string (max 20) | Rg da transportadora |
| trans_id | integer | Valor do controle incremental de alteração |
| ufie | string (max 3) | Estado da Inscrição Estadual da transportadora |
| bancos_contas | object array |  |
| agencia | string (max 7) | Agencia vinculado a transportadora |
| banco | integer | Banco vinculado a transportadora |
| cod_banco | string (max 6) |  |
| numero | string (max 30) | Numero da conta vinculado a transportadora |
| endereco | object array | Lista de endereços da transportadora |
| bairro | string (max 20) | Campo correspondente ao bairro do endereço. |
| cep | string (max 9) | Campo correspondente ao cep do endereço. |
| cidade | string (max 40) | Campo correspondente a cidade. IMPORTANTE: Devido à regra de validação da NFe, a cidade deve ser informada seguindo a tabela padrão do IBGE. |
| complemento | string (max 200) | Campo correspondente ao complemento do endereço. |
| contato | string (max 30) | Campo correspondente ao nome do contato que estará no endereço informado (empregado, porteiro, parente etc). |
| ddd | string (max 4) | Campo correspondente ao DDD do fone do contato do endereço. |
| ddd_cel | string (max 5) | Campo correspondente ao DDD do celular do contato do endereço. |
| desc_tipo_endereco | string (max 20) | Campo correspondente a descrição do tipo do endereço(Exemplo: residencial, comercial). |
| dicas_endereco | string (max 30) | Campo correspondente as instruções de direção ou ponto de referência do endereço. |
| estado | string (max 3) | Campo correspondente ao estado. IMPORTANTE: Devido à regra de validação da NFe, o estado deve ser informada seguindo a tabela padrão do IBGE. No caso de estados estrangeiros, deve ser informado EX. |
| fax | string (max 20) | Campo correspondente ao fax do contato do endereço. |
| fone | string (max 20) | Campo correspondente ao fone. IMPORTANTE: É necessário informar um telefone para que a emissão da nota seja feita. A falta de um campo de telefone levará à rejeição da nota. |
| logradouro | string (max 60) | Campo correspondente ao logradouro do endereço. |
| nome_pais | string (max 50) | Campo correspondente ao nome do país em que o contato reside. |
| numero | string (max 10) | Campo correspondente ao número da residência do endereço. |
| ramal | string (max 10) | Campo correspondente ao ramal do contato do endereço. |
| tipo_sexo | string (max 1) | Campo correspondente ao tipo do sexo do contato('M'='Masculino';'F'='Feminino';'U'='Não Aplicável'). |

---

###  TROCA_DEVOLUCAO

**Endpoint:** `GET /api/general/ troca_devolucao`

#### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| barra | string (max 20) | Código de Barras do produto, o programa mostra todas as vendas e autorizações do produto informado. O parâmetro barra não pode ser informado sozinho. |
| cnpj | string (max 19) | CNPJ do cliente |
| cpf | string (max 20) | CPF do cliente |
| desc_produto | string (max 255) |  |
| ecf | string (max 25) | ECF |
| filial | integer |  |
| full_price | boolean |  |
| n_registros | integer |  |
| nota | string (max 100) | Nota Fiscal |
| numero_dias | integer | Número de dias |
| pedido | string (max 14) | Código do pedido de venda |
| protocolo | string (max 50) | Número de controle para o Millennium será a ASN para WMS |
| saida | integer | Id da movimentação de saída |
| serie | string (max 5) | Campo referente a serie da nota, caso não seja informado este filtro não será aplicado |
| vitrine | integer | Id da Vitrine |
| cliente | integer | Id do cliente |
| cnpj | string (max 19) | CNPJ do cliente que está devolvendo a mercadoria |
| cnpj_filial | string (max 20) | CNPJ da filial |
| cod_filial | string (max 15) | Código da filial |
| cpf | string (max 20) | CPF do cliente |
| data | date | Data |
| ecf | string (max 100) | ECF |
| frete | float |  |
| idnfe | string (max 100) | Id da NFE |
| naturezas_pgto | string (max 1000) |  |
| nome_cliente | string (max 120) | Nome do cliente |
| nota | string (max 50) | Nota Fiscal |
| quantidade | float | Quantidade |
| saida | integer | Id da movimentação de saída |
| serie | string (max 20) | Série da Nota Fiscal |
| tabela | integer |  |
| total | float | Total |
| produtos | object array | Itens |
| cod_cor | string (max 15) | Campo correspondente ao código da cor. |
| cod_estampa | string (max 15) | Campo correspondente ao código da estampa. |
| cod_produto | string (max 60) | Campo correspondente ao código do produto. |
| data_devolucao | date | Campo correspondente a data da devolução. |
| data_emissao_pedido | date | Campo correspondente a data de emissão do pedido de venda. |
| desc_cor | string (max 255) | Campo correspondente a descrição da cor. |
| desc_estampa | string (max 255) | Campo correspondente a descrição da estampa. |
| desc_produto | string (max 255) | Campo correspondente a descrição do produto. |
| it_valor_desconto | float |  |
| it_valor_frete | float |  |
| lote | string (max 50) | Campo correspondente ao lote. |
| pedido | string (max 50) | Campo correspondente ao número do pedido de venda. |
| preco | float | Campo correspondente ao preço. |
| quantidade | float | Campo correspondente a quantidade. |
| quantidade_dev | float | Campo correspondente a quantidade devolvida. |
| tamanho | string (max 5) | Campo correspondente ao tamanho. |
| url_imagens | string (max 8000) | Campo correspondente a URL das imagens. |
| valor | float | Campo correspondente ao valor. |
| vitrine_produto_sku | integer |  |
| barra | string array | Campo correspondente a lista de código de barras do item. |

---

###  VITRINE

**Endpoint:** `GET /api/general/ vitrine`

---

