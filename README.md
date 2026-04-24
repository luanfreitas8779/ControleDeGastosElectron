# Bella Paes - Controle de Gastos

Um sistema desktop simples para controle de gastos e finanças, desenvolvido com Electron. Ideal para pequenos negócios, como padarias, para gerenciar usuários, gastos, vendas, categorias e relatórios.

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Login seguro com hash de senhas (bcrypt).
- **Gerenciamento de Gastos**: Cadastro, edição e exclusão de gastos, com suporte básico a categorias (atualmente usa categoria "Geral" por padrão; infraestrutura preparada para categorização futura).
- **Controle de Vendas**: Registro de vendas e relatórios.
- **Dashboard**: Resumos visuais com gráficos (Chart.js) para análise de finanças.
- **Logs de Auditoria**: Rastreamento de ações dos usuários.
- **Banco de Dados Local**: SQLite com better-sqlite3 para armazenamento offline.
- **Interface Desktop**: Aplicativo Electron multiplataforma (Windows, macOS, Linux).

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript (puro, sem frameworks pesados).
- **Backend**: Node.js com Electron.
- **Banco de Dados**: SQLite (better-sqlite3).
- **Segurança**: bcryptjs para hashes de senha.
- **Gráficos**: Chart.js.
- **Build e Distribuição**: Electron Forge e Electron Builder.
- **Testes**: Jest.
- **Outros**: IPC para comunicação entre processos.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior).
- npm ou yarn.

## 🔧 Instalação e Execução

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/luanfreitas8779/ControleDeGastosElectron.git
   cd ControleDeGastosElectron
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Execute o aplicativo em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Para testes**:
   ```bash
   npm test
   ```

5. **Para build e distribuição**:
   - Pacote: `npm run package`
   - Distribuição: `npm run make` (para instaladores) ou `npm run dist` (para Windows).

## 📁 Estrutura do Projeto

```
ControleDeGastosElectron/
├── controllers/          # Controladores da API
├── database/             # Configuração do banco SQLite
├── frontend/             # Interface HTML/CSS/JS
├── helpers/              # Utilitários
├── ipc/                  # Comunicação IPC do Electron
├── middlewares/          # Middlewares (auth, logs)
├── models/               # Modelos de dados
├── services/             # Lógica de negócio
├── __tests__/            # Testes com Jest
├── main.js               # Ponto de entrada do Electron
├── preload.js            # Preload script
├── package.json          # Dependências e scripts
└── README.md             # Este arquivo
```

## 🤝 Como Contribuir

1. Fork o projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`).
4. Push para a branch (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Luan Barros Freitas** - [GitHub](https://github.com/luanfreitas8779)

---

Feito com ❤️ para facilitar o controle financeiro de pequenos negócios.
