# 🏢 Sala de Reunião - Stratura Asfaltos

Sistema de agendamento de salas de reunião da Stratura Asfaltos.

## 📌 Como acessar

Abra o navegador e acesse:

```
http://10.123.1.206:3000/sala-de-reuniao.html
```

> ⚠️ Você precisa estar conectado na rede da Stratura para acessar.

## ✅ Funcionalidades

- Visualizar disponibilidade das salas em tempo real
- Reservar horários
- Cancelar reservas
- Timeline do dia com linha do horário atual

## 🛠️ Para rodar o sistema (responsável técnico)

O sistema depende de dois servidores rodando na máquina principal:

**1. API (Backend)**
```bash
cd MeetingScheduler.Api
dotnet run
```

**2. Servidor Web (Frontend)**
```bash
cd meeting-scheduler-web
npx serve .
```

Ambos precisam estar rodando para o sistema funcionar.

## 🗄️ Banco de Dados

O sistema utiliza MySQL hospedado no servidor interno da Stratura (`10.123.0.53`).

## 📁 Estrutura do Projeto

```
MeetingScheduler-main/
├── MeetingScheduler.Api/        # Backend .NET 8
│   ├── Controllers/             # Endpoints da API
│   ├── Models/                  # Modelos de dados
│   ├── appsettings.Example.json # Exemplo de configuração
│   └── Program.cs               # Configuração da aplicação
└── meeting-scheduler-web/       # Frontend
    └── sala-de-reuniao.html     # Interface do sistema
```

