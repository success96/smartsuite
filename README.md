# SMARTSUITE

## Requirements

1. Node 17 and above
2. NPM
3. Postgres

## Project Installation

1. `cd` into whatever directory you want work from.
2. Run `git clone https://github.com/success96/smartsuite.git` then `cd` into the repo.
3. After cloning the project, run `cp .env .env.example` on your terminal to create a new `.env` file from the `.env.example`.
4. Run `npm install` to install all the dependencies.
5. Run `npm run dev` to start the project in development mode.
6. Run `npm run build` to build the project for production.
7. Run `npm start` to start the project in production mode.


## Project Setup

1. Create a database on your machine.

- For **PostgreSQL**
  - Navigate into `database/prisma/schema.prisma` verify that inside the datasource db object provider is set to postgresql i.e `provider = "postgresql"`

```bash
Your database url in the `.env` file should as follows

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"

mydb : The name of the databse you created on your machine
johndoe : The username of the database
randompassword : The password of the database
```

- To migrate the database tables from prisma use `npx prisma migrate dev --name init --schema=./database/prisma/schema.prisma`
- To view your database on your browser use prisma studio `npx prisma studio --schema=./database/prisma/schema.prisma`

  ***

