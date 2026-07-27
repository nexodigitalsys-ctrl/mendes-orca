# Design: Ajuste do PDF de Proposta / Orçamento

## Status
Aprovado pelo usuário em 25/07/2026.

## Contexto
O sistema Mendes Orça gera o PDF da proposta comercial através de `window.print()` + CSS `@media print` em `src/app/proposta/page.tsx`. O cliente reportou que:
- As imagens dos produtos ficam pequenas e mal aproveitadas.
- A tabela possui muitas colunas, ficando espremida.
- O layout não está bem otimizado.

O usuário enviou um PDF modelo (`/home/elias-mendes/Documentos/joao_orça/presuposto_modelo_joao.pdf`) no qual:
- As fotos dos produtos são grandes (~100–120 px de largura).
- A tabela mantém 8 colunas: Item, Qtd, Código/Produto, Medidas, Acabamento, Ilustração, Valor Unitário, Total.
- O orçamento é A4 retrato.

O `spoiler.html` de referência do sistema define a identidade visual preto/dourada e sugere imagens de 110 × 82 px na célula de ilustração.

## Objetivo
Ajustar o CSS e a estrutura da tabela do PDF de proposta para:
1. Exibir imagens dos produtos de forma destacada (~110 × 82 px).
2. Reduzir a sensação de “colunas espremidas”.
3. Manter a identidade visual preto/dourada do sistema.
4. Continuar usando A4 retrato e `window.print()`.

## Decisões de design

### Formato e orientação
- **A4 retrato** (`@page { size: A4; }`).
- Margens aumentadas para `@page { margin: 10mm 8mm; }` (antes `4mm 5mm`) para dar respiro e evitar corte em impressoras.

### Estrutura da tabela
Mantemos as 8 colunas existentes, mas redistribuímos as larguras:

| Coluna | Largura atual | Nova largura | Alinhamento |
|---|---|---|---|
| Item | 3% | 4% | centro |
| Qtd | 4% | 5% | centro |
| Código / Produto | 18% | 19% | esquerda |
| Medidas | 10% | 9% | centro |
| Acabamento | 22% | 20% | esquerda |
| **Ilustração** | **12%** | **18%** | **centro** |
| Unit. | 12% | 10% | direita |
| Total | 15% | 15% | direita |

### Imagens
- Tamanho fixo: **110 px × 82 px**.
- `object-fit: cover` para preencher o espaço sem distorcer.
- Borda sutil `#E8E4DA` e `border-radius: 4px`.
- Aplicar tanto no preview de tela quanto no `@media print`.

### Tipografia
- Cabeçalho da tabela (`th`): 7 pt, maiúsculas, cor dourada sobre fundo preto.
- Corpo da tabela (`td`): 8 pt.
- Colunas de valor (`Unit.`, `Total`): `white-space: nowrap` para evitar quebra do valor.
- Colunas de texto (`Código/Produto`, `Acabamento`): `word-wrap: break-word` e `line-height` confortável.

### Valores monetários
- Manter o padrão atual de exibir `R$` + valor, mas garantir alinhamento à direita e evitar quebra de linha.
- Não alterar a função `brl()` nesta tarefa.

### Preview de tela
- Aumentar `.paper .th-img` / `.paper .td-img` para ~118 px.
- Aumentar `.paper .td-img img` para 110 × 82 px no CSS base.
- Manter `paper-wrap` com scroll horizontal no mobile.

## Arquivos afetados
- `src/app/proposta/page.tsx` — ajustes no bloco `<style>` (linhas ~264–529) e, se necessário, na estrutura da tabela.

## Fora de escopo
- Não trocar a biblioteca de geração de PDF (continua `window.print()`).
- Não alterar a paleta de cores para o azul do PDF modelo (mantém preto/dourado do sistema).
- Não alterar os tipos de dados (`Product`, `Quote`, etc.).
- Não alterar o recibo (`src/app/recibo/page.tsx`) nesta entrega.

## Critérios de aceitação
- [ ] As imagens dos produtos aparecem no PDF com aproximadamente 110 × 82 px.
- [ ] A tabela não transborda horizontalmente no A4 retrato.
- [ ] Os valores (`Unit.`, `Total`, `Subtotal`, `Total geral`) permanecem alinhados à direita e legíveis.
- [ ] O preview na tela reflete o tamanho das imagens do PDF.
- [ ] O PDF gerado com o orçamento de exemplo cabe corretamente na página.

## Teste de validação
1. Abrir a rota `/proposta` no navegador.
2. Selecionar um orçamento com produtos que possuam imagens.
3. Clicar em “Baixar PDF” (`window.print()`).
4. Verificar visualmente:
   - Tamanho das imagens.
   - Largura das colunas.
   - Alinhamento dos valores.
   - Quebras de página.
5. Se necessário, ajustar fino nas larguras percentuais.

## Notas
- O PDF modelo do cliente usa cores azuis, mas o usuário confirmou que o sistema deve seguir a paleta preto/dourada definida no `spoiler.html`.
- A escolha foi pela **Opção A**: manter 8 colunas e aumentar a célula de ilustração, replicando a experiência do PDF modelo sem mudar a identidade visual.
