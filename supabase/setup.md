# Configuração do Supabase

## 1. Criar as tabelas

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/wbrqzyeurqpwxvuqhyyl
2. Vá em **SQL Editor > New query**.
3. Cole o conteúdo do arquivo `supabase/schema.sql`.
4. Clique em **Run**.

## 2. Criar o bucket de imagens

1. No dashboard, vá em **Storage > New bucket**.
2. Nome do bucket: `images`
3. Marque **Public bucket**.
4. Clique em **Save**.

## 3. Configurar as variáveis de ambiente na Vercel

No dashboard da Vercel, vá em **Project Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://wbrqzyeurqpwxvuqhyyl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndicnF6eWV1cnFwd3h2dXFoeXlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2NTEwNywiZXhwIjoyMTAwNzQxMTA3fQ.Xa-ZYOoLzsZqAjXgFEcxwEmMaD_SasKHC2o1LhSLEH0
```

Depois faça **redeploy** do projeto.

## 4. Migração dos dados existentes

Na primeira vez que o app carregar após a configuração, ele automaticamente envia os dados do `localStorage` do desktop para o Supabase.

Certifique-se de abrir o app no desktop primeiro (onde os dados estão) para que a migração aconteça.
