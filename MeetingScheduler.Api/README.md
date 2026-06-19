# Meeting Scheduler API

API REST desenvolvida com ASP.NET Core para gerenciamento de salas e agendamento de reuniões corporativas.

## Tecnologias Utilizadas

* ASP.NET Core 8
* Entity Framework Core 8
* MySQL
* Swagger / OpenAPI
* Git e GitHub

## Funcionalidades

### Salas

* Listar salas
* Buscar sala por ID
* Criar sala
* Atualizar sala
* Excluir sala

### Reuniões

* Listar reuniões
* Buscar reunião por ID
* Criar reunião
* Atualizar reunião
* Excluir reunião

### Regras de Negócio

* Impede agendamento de duas reuniões na mesma sala e horário.
* Valida horários de início e término.
* Relacionamento entre reuniões e salas.

### Relatórios

* Ranking de usuários que mais criaram reuniões.
* Ranking por mês e ano.

## Estrutura do Projeto

```text
Controllers/
├── MeetingsController.cs
├── RoomsController.cs
└── ReportsController.cs

Data/
└── AppDbContext.cs

Models/
├── Meeting.cs
└── Room.cs
```

## Endpoints

### Rooms

```http
GET    /api/Rooms
GET    /api/Rooms/{id}
POST   /api/Rooms
PUT    /api/Rooms/{id}
DELETE /api/Rooms/{id}
```

### Meetings

```http
GET    /api/Meetings
GET    /api/Meetings/{id}
POST   /api/Meetings
PUT    /api/Meetings/{id}
DELETE /api/Meetings/{id}
```

### Reports

```http
GET /api/Reports/top-creators
GET /api/Reports/top-creators/month/{month}/year/{year}
```

## Como Executar

1. Clonar o repositório

```bash
git clone <url-do-repositorio>
```

2. Configurar a string de conexão em `appsettings.json`

3. Executar a aplicação

```bash
dotnet restore
dotnet build
dotnet run
```

4. Abrir o Swagger

```text
https://localhost:xxxx/swagger
```

## Melhorias Futuras

* Integração com Active Directory (AD)
* Autenticação e autorização
* Front-end para agendamento
* Dashboard de utilização das salas
* Notificações de reuniões

## Autor

Desenvolvido para estudos de ASP.NET Core, Entity Framework e APIs REST.
