-- Habilita extensão UUID (geralmente já habilitada no Supabase)
create extension if not exists "uuid-ossp";

-- Tabela de dados da empresa (apenas 1 registro)
create table if not exists public.companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null default '',
  cnpj text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  email text not null default '',
  ie text not null default '',
  logo text not null default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de clientes
create table if not exists public.clients (
  id text primary key,
  name text not null,
  type text not null default 'person',
  document text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  city text not null default '',
  architect text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de produtos (catálogo)
create table if not exists public.products (
  code text primary key,
  name text not null,
  meas text not null default '',
  finish text not null default '',
  price numeric not null default 0,
  image text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de orçamentos
create table if not exists public.quotes (
  id text primary key,
  number text not null,
  client_id text not null default '',
  client_name text not null default '',
  client_document text not null default '',
  client_phone text not null default '',
  client_address text not null default '',
  client_city text not null default '',
  client_architect text not null default '',
  status text not null default 'rascunho',
  doc_title text not null default 'ORÇAMENTO',
  payment_notes text not null default '',
  environments jsonb not null default '[]'::jsonb,
  discount numeric not null default 0,
  delivery_time text not null default '90 DIAS',
  validity text not null default '15 dias',
  payment_methods text[] not null default '{}',
  created_at date not null default current_date,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices úteis
create index if not exists idx_quotes_client_id on public.quotes(client_id);
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_quotes_created_at on public.quotes(created_at);

-- Migração 2026-08-12: título editável do documento (ORÇAMENTO/PEDIDO/...)
alter table public.quotes add column if not exists doc_title text not null default 'ORÇAMENTO';

-- Migração 2026-08-12: observação livre das condições de pagamento (ex.: "50% de entrada")
alter table public.quotes add column if not exists payment_notes text not null default '';
