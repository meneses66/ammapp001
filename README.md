# FPet Gestión (ammapp001)

Aplicação full stack composta por:
- **Backend Python (Flask)** com padrão MVC e APIs REST para o módulo de Usuários.
- **Frontend Node.js (Express)** servindo páginas responsivas que consomem as APIs.

## Estrutura

```
appfpet001/
├── backend/                # Flask API
│   ├── app.py              # Ponto de entrada
│   ├── config.py           # Configurações (credenciais do banco)
│   ├── controllers/        # Regras de negócio
│   ├── models/             # Acesso ao MySQL
│   └── routes/             # Blueprints e endpoints
└── frontend/               # Servidor Express e assets estáticos
    ├── server.js
    └── public/
        ├── login.html
        ├── dashboard.html
        ├── app.js
        └── styles.css
```

## Pré-requisitos
- Python 3.11+
- Node.js 18+
- Acesso ao MySQL informado pelo cliente

## Backend (Flask)
1. Crie e ative um ambiente virtual (opcional):
   ```bash
   cd appfpet001
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
2. Instale as dependências:
   ```bash
   pip install -r ../requirements.txt
   ```
3. Ajuste variáveis de ambiente se quiser sobrepor as credenciais padrão (o host pode ser definido como `host` ou `host:porta`):
   ```bash
   export DB_HOST="node244579-fiusapet-clone348010.sp1.br.saveincloud.net.br"
   export DB_PORT=14975
   export DB_USER="amm"
   export DB_PASSWORD="carol+211012"
   export DB_NAME="dbfpet"
   ```
4. Execute a API:
   ```bash
   python -m backend.app
   ```
   A API ficará disponível em `http://localhost:5000/api`.

## Frontend (Node.js)
1. Instale as dependências:
   ```bash
   cd appfpet001/frontend
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
   A interface web ficará acessível em `http://localhost:3000`.

> As páginas HTML usam `fetch` para consumir os endpoints REST (`/api/auth/login`, `/api/users`, etc.), portanto deixe o backend ativo antes de navegar pela aplicação.

## Executando com Docker
1. Construa as imagens:
   ```bash
   docker compose build
   ```
2. Suba os serviços:
   ```bash
   docker compose up
   ```
   O backend ficará em `http://localhost:5000/api` e o frontend em `http://localhost:3000`.
3. Para ajustar credenciais ou URLs, edite as variáveis no `docker-compose.yml` ou sobrescreva-as via `docker compose --env-file`.

## Próximos passos
- Expandir o menu lateral adicionando os demais módulos (Clientes, Raças, Animais, etc.).
- Replicar o padrão MVC/CRUD do backend para cada tabela.
- Incluir testes automatizados para os endpoints críticos.
