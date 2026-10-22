# ![RealWorld Example App](logo.png)

> **React / Vite + SWC / Express.js / Sequelize / PostgreSQL codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://realworld.io/) spec and API.**

This codebase was created to demonstrate a fully fledged fullstack application built with **React / Vite + SWC / Express.js / Sequelize / PostgreSQL** including CRUD operations, authentication, routing, pagination, and more.

**[Demo app](https://conduit-realworld-example-app.fly.dev/)&nbsp;&nbsp;|&nbsp;&nbsp;[With Create React App](https://github.com/TonyMckes/conduit-realworld-example-app/tree/create-react-app)&nbsp;&nbsp;|&nbsp;&nbsp;[Other RealWorld Example Apps](https://codebase.show/projects/realworld?category=fullstack)**

> For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

---

## Getting Started

These instructions will help you install and run the project on your local machine for development and testing.

### Prerequisites

Before you run the project, make sure that you have the following tools and software installed on your computer:

- Text editor/IDE (e.g., VS Code, Sublime Text, Atom)
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/) `v18.11.0+`
- [NPM](https://www.npmjs.com/) (usually included with Node.js)
- SQL database

### Installation

To install the project on your computer, follow these steps:

1. Clone the repository to your local machine.

   ```bash
   git clone https://github.com/TonyMckes/conduit-realworld-example-app.git
   ```

2. Navigate to the project directory.

   ```bash
   cd conduit-realworld-example-app
   ```

3. Install project dependencies by running the command:

   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root directory of the project
2. Add the required environment variables as specified in the [`.env.example`](backend/.env.example) file
3. (Optional) update the Sequelize configuration parameters in the [`config.js`](backend/config/config.js) file
4. If you are **not** using PostgreSQL, you may also have to install the driver for your database:

   <details>
   <summary>Use one of the following commands to install:</summary><br/>

   > Note: `-w backend` option is used to install it in the backend [`package.json`](backend/package.json).

   ```bash
   npm install -w backend pg pg-hstore  # Postgres (already installed)
   npm install -w backend mysql2
   npm install -w backend mariadb
   npm install -w backend sqlite3
   npm install -w backend tedious       # Microsoft SQL Server
   npm install -w backend oracledb      # Oracle Database
   ```

   > :information_source: Visit [Sequelize - Installing](https://sequelize.org/docs/v6/getting-started/#installing) for more infomation.

   ***

   </details>

5. Create database specified by configuration by executing

   > :warning: Please, make sure you have already created a superuser for your database.

   ```bash
   npm run sqlz -- db:create
   ```

   > :information_source: The command `npm run sqlz` is an alias for `npx -w backend sequelize-cli`.  
   > Execute `npm run sqlz -- --help` to see more of `sequelize-cli` commands availables.

6. Optionally you can run the following command to populate your database with some dummy data (5 users, `example1@mail.com` … `example5@mail.com` with passwords `examplePwd1` … `examplePwd5`, and 55 articles):

   ```bash
   npm run sqlz -- db:seed:all
   ```

   > :information_source: Seeders that already ran are recorded in the `SequelizeData` table and skipped, so running this again won't duplicate data. To reseed, run `npm run sqlz -- db:seed:undo:all` first (this deletes **all** users and articles).

### Authentication

Signing up or logging in returns a JWT signed with `JWT_KEY`. Send it on authenticated requests in the `Authorization` header, using the `Token` scheme:

```http
Authorization: Token <jwt>
```

Tokens expire **7 days** after they are issued. To change that, set `JWT_EXPIRES_IN` in your `.env` to any value [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) accepts (e.g. `12h`, `30m`, or a number of seconds). Only tokens issued after the change use the new lifetime. Using the app doesn't extend a token, so once it expires the user has to log in again.

If a request sends an `Authorization` header that can't be verified, the API responds with `401 Unauthorized` and a RealWorld-style error body (`{ "errors": { "body": [message] } }`):

| Situation                                                             | Message                             |
| --------------------------------------------------------------------- | ----------------------------------- |
| Token has expired                                                     | `Token expired, please login again` |
| Header isn't `Token <jwt>`, or the JWT is malformed                   | `Token missing or malformed`        |
| Any other verification failure (e.g. signed with a different key)     | `Invalid token`                     |

If the token is valid but its user no longer exists, the API responds with `404` (`User not found`). Requests without an `Authorization` header aren't rejected by the auth middleware. Endpoints that need a logged-in user return `401` (`You need to login first!`).

> :information_source: The signature is checked before the expiry, so an expired token signed with a different `JWT_KEY` gets `Invalid token`, not `Token expired`.

### Usage

#### Development Server

To run the project, follow these steps:

1. Start the development server by executing the command:

   ```bash
   npm run dev
   ```

2. Open a web browser and navigate to:
   - Home page should be available at [`http://localhost:3000/`](http://localhost:3000).
   - API endpoints should be available at [`http://localhost:3001/api`](http://localhost:3001/api).

#### Running Tests

To run tests, simply run the following command:

```bash
npm run test
```

#### Production

The following command will build the production version of the app:

```bash
npm run start
```

#### Docker

The project includes a [`Dockerfile`](Dockerfile) and [`docker-compose.yml`](docker-compose.yml) that run the production build together with a PostgreSQL database, so you don't need Node.js or a database installed locally.

```bash
docker compose up --build
```

- The app (UI and API) is served at [`http://localhost:3001/`](http://localhost:3001), and the API is at [`http://localhost:3001/api`](http://localhost:3001/api).
- The `db` service runs `postgres:16-alpine` (user, password and database are all `conduit`). Data is kept in the `db-data` volume.
- The `app` waits until the database is healthy before it starts.
- `JWT_KEY` defaults to `local-test-secret`. Set your own value for anything beyond local testing:

  ```bash
  JWT_KEY=your-secret docker compose up --build
  ```

- Tokens issued by the container expire after the default 7 days. `docker-compose.yml` doesn't pass `JWT_EXPIRES_IN` to the app, so to change the lifetime, add it under the `app` service's `environment:` first (see [Authentication](#authentication)).

- A standard test user is created on startup (if it doesn't already exist), so test automation can log in right away: email `testuser@conduit.local`, username `testuser`, password `TestPassword123!`. Override with `TEST_USER_EMAIL`, `TEST_USER_USERNAME` and `TEST_USER_PASSWORD`, the same way as `JWT_KEY`.
- The one-shot `seed` service runs `npm run sqlz -- db:seed:all` after the app is healthy. Dummy data (see [Configuration](#configuration) step 6) is only loaded the first time, on a fresh database volume; later launches skip it.
- To stop the containers and delete the database volume, run `docker compose down -v`.

> :information_source: The Dockerfile uses a multi-stage build. The first stage installs dependencies and builds the React frontend. The runtime stage starts the Express backend from `backend/`, which also serves `frontend/dist`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [RealWorld](https://realworld.io/)
- [RealWorld (GitHub)](https://github.com/gothinkster/realworld)
- [CodebaseShow](https://codebase.show/)
- [How to write a Good readme](https://bulldogjob.com/news/449-how-to-write-a-good-readme-for-your-github-project)
