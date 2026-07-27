# Design: Redesign do PDF de Orçamento

## Contexto

O cliente usa o Mendes Orça para gerar propostas/orçamentos em PDF. O layout atual do PDF gerado está com os elementos muito apertados, colunas comprimidas e imagens dos produtos reduzidas a emojis miniatura. O PDF antigo que o cliente usava (gerado a partir de uma planilha Excel) tem um layout mais espaçoso, com fotos grandes, logo nos cantos e campos de cliente organizados.

## Objetivo

Ajustar o layout do PDF gerado pelo sistema para ficar visualmente mais próximo do PDF antigo do cliente, mantendo a identidade visual preta + dourada do Mendes Design, mas adotando a estrutura espaçosa e as proporções do antigo.

## Decisões de design aprovadas

Direção escolhida: **Híbrido (C2)** — manter a identidade preta/dourada atual, mas redesenhar o template do PDF com as proporções e espaçamentos do PDF antigo.

### 1. Cabeçalho

- Fundo branco.
- **Logo à esquerda**, acompanhada do nome "MENDES DESIGN" e do slogan "móveis para áreas externas" em fonte menor.
- **Nada no lado direito** do cabeçalho.
- A logo real é carregada a partir das configurações da empresa (`company.logo`).

### 2. Bloco de empresa + cliente

- Dois cards lado a lado, ambos com fundo bege claro (`#F7F4EC`) e borda dourada suave.
- **Card da empresa (esquerda):**
  - Nome, endereço, cidade, telefone, CNPJ.
  - Data e número do orçamento.
- **Card do cliente (direita):**
  - Nome, CNPJ/CPF, endereço, cidade, telefone, arquiteto(a).
- Aumentar padding interno para evitar texto colado nas bordas.

### 3. Título “ORÇAMENTO”

- Centralizado.
- Fonte serifada `Playfair Display`.
- Espaçamento antes e depois do título.

### 4. Barra de ambiente

- Manter fundo dourado e texto preto.
- Aumentar padding vertical.

### 5. Tabela de itens

- Redistribuir larguras das colunas:
  - Item / Qtd: compactas, centralizadas
  - Código / Produto: mais larga
  - Medidas: espaço suficiente para medidas comuns
  - Acabamento: mais larga, com line-height confortável
  - Ilustração: largura fixa maior (~110-120px)
  - Unit. / Total: alinhados à direita
- Altura mínima das linhas: ~95-100px para acomodar imagens maiores.
- Padding interno das células: 8-10px.
- Imagens com `object-fit: contain` e altura máxima de ~90px, sem distorcer.
- Se não houver imagem do produto: mostrar um ícone de móvel em preto/contorno dentro de um quadrado bege (não o emoji colorido atual).

### 6. Subtotal por ambiente

- Fundo bege, fonte em negrito, alinhado à direita.
- Borda superior dourada.

### 7. Total geral

- Corrigir o bug atual da barra preta vazia, garantindo contraste do texto dourado.
- Fundo preto, texto dourado.
- Mostrar `TOTAL DE X PEÇAS` à esquerda e `TOTAL R$ ...` à direita.

### 8. Rodapé

- Separar melhor do total geral com mais espaço.
- Condições de pagamento, prazo e validade em linhas/blocos com mais respiro.
- Manter a linha `IPI incluso · Frete CIF · Aguardamos retorno!`.
- Assinatura centralizada com linha e dados de contato.

### 9. Configuração de página

- A4 portrait.
- Margens ajustadas para ~10mm laterais e ~8mm vertical, aumentando a área útil sem cortar conteúdo.

## Arquivos afetados

- `src/app/proposta/page.tsx` — template do PDF e estilos de impressão (`<style>` interno e `@media print`).
- Opcional: `src/app/catalogo/page.tsx` — placeholder de imagem (se decidir compartilhar o componente de placeholder).

## Critérios de sucesso

- O PDF gerado pelo botão "Baixar PDF" não corta colunas nem texto.
- As imagens dos produtos aparecem grandes e proporcionais, sem distorção.
- O total geral aparece legível na barra preta.
- O layout fica visualmente menos apertado e mais parecido com o PDF antigo.
- A identidade preta/dourada do Mendes Design é mantida.

## Notas

- O catálogo atual armazena imagens em base64 no `localStorage`. Quando não há imagem cadastrada, o sistema deve exibir um placeholder discreto em vez do emoji colorido.
- A validação deve ser feita gerando o PDF via função de print do navegador e comparando visualmente com o PDF antigo.
