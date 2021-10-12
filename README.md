# simulador-pipeline

### Objetivos  
- Comprovar a melhora de desempenho do processador com a utilização de um mecanismo de predição e reforçar os conceitos de pipeline.

### Instruções Suportadas:

ADD , ADDI, SUB, SUBI, BEQ, B

### Banco de registradores
- 32 registradores inicializados com '0' em todas as posições

### Mecanismo de predição
- indica qual a próxima instrução a ser buscada
- na etapa de fetch (busca) identifica se é uma instrução condicional

### Mecanismo de verificação do acerto da instrução
- quando chegar uma instrução condicional na etapa execute, é feita a verificação se ela é ou não tomada
- se foi tomada, a tabela é atualizada
- se ela não foi tomada, a tabela é atualizada e a instrução é marcada como inválida

### Possibilidade de desabilitar a instrução
- Por default, a predição é habilitada
- Foi adicionado o parâmetro isPredictionEnabled

### Como executar a solução

```sh
npm start
```

### Comparação da execução do pipeline

#### Sem predição:
- Total cycles: 176
- Valid instructions: 109
- Invalid instructions: 67

#### Com predição:
- Total cycles: 128
- Valid instructions: 109
- Invalid instructions: 19

#### Com a predição, resultou em:
- 48 ciclos a menos
- 48 instruções inválidas a menos

Executando o seguinte código no DrMips com o pipeline.cpu:

```addi $t1, $t0, 1
addi $t2, $t0, 2
addi $t3, $t0, 10
addi $t4, $t0, 10
nop
nop
nop
beq $t0, $t3, 5
addi $t3, $t3, -1
addi $t1, $t0, 1
addi $t2, $t0, 1
b -5
beq $t0, $t4, 5
addi $t4, $t4, -1 # *
addi $t1, $t0, 1
addi $t2, $t0, 1
b -5
nop
```
Para compatibilização com o DrMips:
- (*) Estava convertendo incorretamente a pseudo-instrução 'subi'
- (**) O branch retroativo ainda incrementa o pc em uma instrução

As estatísticas resultantes foram as seguintes:

![image](https://user-images.githubusercontent.com/72985725/137024000-a2cb290e-b253-4502-b28b-0939c2e5e6df.png)

