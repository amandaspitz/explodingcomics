# Exploding Comics Pro

## Windows Local MySQL Setup

This guide prepares a local MySQL environment for:

- `D:\explodingcomics\exploding-comics-pro\apps\api`
- `npm run db:check`
- `npm run migrate`

## 1. Recommended path

For this machine, the recommended local setup path is:

1. Install MySQL natively on Windows
2. Install MySQL Workbench
3. Create the local database and dedicated application user
4. Configure the API `.env`
5. Run database validation and migrations

Reasoning:

- Docker is not currently available on this machine
- the API is already prepared to connect to local MySQL
- this is the fastest path to unblock the next milestones

## 2. What to install

Use the official MySQL Installer for Windows:

- [MySQL Installer](https://dev.mysql.com/downloads/installer/)

Official reference:

- [MySQL 8.4 Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)

Important note:

- The Windows installer page may present `8.0.x` packages in its catalog depending on the installer channel and package availability.
- For local development, `8.0.x` is acceptable for the current project state because the current schema and migrations use standard SQL features compatible with both MySQL 8.0 and 8.4.
- Production target can still remain aligned to MySQL 8.4 later.

This compatibility statement is an engineering inference based on the current schema in [0001_initial_schema.sql](D:/explodingcomics/exploding-comics-pro/apps/api/migrations/0001_initial_schema.sql:1).

## 3. Installer options

Inside the MySQL Installer, use:

1. Installer type: `Custom`
2. Add these products:
   - `MySQL Server`
   - `MySQL Workbench`
3. If both `8.4` and `8.0` are available:
   - prefer `8.4`
4. If only `8.0` appears:
   - use the latest `8.0.x`

## 4. Server configuration

During server setup, use these values:

1. Configuration type: `Development Computer`
2. Connectivity:
   - `TCP/IP`
   - Port `3306`
3. Authentication method:
   - use strong password encryption
4. Accounts:
   - define a `root` password and keep it safe
5. Windows service:
   - service name can stay as default, such as `MySQL80`
   - start at system startup: `enabled`

## 5. Bootstrap the local database

After installation, open MySQL Workbench and connect as `root`.

Then open and run:

- [bootstrap-local-development.sql](D:/explodingcomics/exploding-comics-pro/apps/api/sql/bootstrap-local-development.sql:1)

Before running it:

1. Replace `change_me_local_password` with your real local app password

What this script does:

- creates database `exploding_comics_pro`
- creates user `exploding_comics_app`
- grants privileges on that database only

## 6. Configure the API environment

Inside:

- [apps/api](D:/explodingcomics/exploding-comics-pro/apps/api)

Create a `.env` file based on:

- [.env.local.example](D:/explodingcomics/exploding-comics-pro/apps/api/.env.local.example:1)

Recommended local values:

```env
NODE_ENV=development
PORT=3000
APP_NAME=exploding-comics-pro-api
API_BASE_PATH=/api/v1
CORS_ORIGIN=*
LOG_LEVEL=info
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=exploding_comics_pro
DB_USER=exploding_comics_app
DB_PASSWORD=change_me_local_password
DB_CONNECTION_LIMIT=10
DB_CONNECT_TIMEOUT_MS=10000
```

## 7. Validate the connection

From:

- [apps/api](D:/explodingcomics/exploding-comics-pro/apps/api)

Run:

```bash
npm run db:check
```

Expected result:

- the script logs that MySQL is reachable

## 8. Run the application migrations

From:

- [apps/api](D:/explodingcomics/exploding-comics-pro/apps/api)

Run:

```bash
npm run migrate
```

Expected result:

- table `schema_migrations` is created
- migration `0001_initial_schema.sql` is applied
- application tables are created

## 9. Smoke-check the API

After the database is ready:

```bash
npm run dev
```

Then verify:

- [http://localhost:3000/health](http://localhost:3000/health)
- [http://localhost:3000/ready](http://localhost:3000/ready)

Expected behavior:

- `/health` returns service health
- `/ready` returns readiness including MySQL dependency status

## 10. Troubleshooting

### Port 3306 already in use

- Change the MySQL server port in the installer, then mirror it in `.env`

### `Access denied for user`

- Reopen the bootstrap SQL and confirm the password matches the `.env`
- Confirm the user was created for both `localhost` and `127.0.0.1`

### `Unknown database 'exploding_comics_pro'`

- The bootstrap SQL probably did not run successfully
- Reconnect as `root` and rerun [bootstrap-local-development.sql](D:/explodingcomics/exploding-comics-pro/apps/api/sql/bootstrap-local-development.sql:1)

### `npm run db:check` fails but Workbench connects

- Check whether `.env` uses `127.0.0.1`, `localhost`, or a custom port
- Confirm the API user has privileges for the same host form used by the Node connection

## 11. What comes next

Once local MySQL is working:

1. run `npm run db:check`
2. run `npm run migrate`
3. tell Codex the database is up

At that point, the next recommended step is:

- start Milestone 3
- expose the public comic read endpoints
- connect the first HTTP routes to the MySQL-backed repository
