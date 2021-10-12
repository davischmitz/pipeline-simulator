# simulador-pipeline

### Objetivos  
- Comprovar a melhora de desempenho do processador com a utilização de um mecanismo de predição e reforçar os conceitos de pipeline.

### Resultado Esperado  
- Um índice em porcentagem da melhora do desempenho ( compara a execução  do mesmo código com e sem mecanismo de predição).

### Instruções Suportadas:

ADD , ADDI, SUB, SUBI, BEQ, B

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
