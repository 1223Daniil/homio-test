# Next Homio

A modern real estate project management system built with Next.js 14.

## Features

- Multi-language support (English and Russian)
- Project management with unit tracking
- Media management for projects
- Developer profiles and portfolios
- Responsive design for all devices
- Dark/Light theme support
- Automated unit import API for integration with external systems

## Tech Stack

- Next.js 15 with App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- next-intl for internationalization
- Docker for development environment

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
cd next-homio
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Start the development database:

```bash
npm run docker:up
```

5. Initialize the database:

```bash
npm run db:push
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
/src
  /app                    # Next.js App Router
    /[locale]            # Internationalized routes
    /api                 # API routes
  /components            # React components
  /hooks                 # Custom React hooks
  /lib                   # Utilities and configurations
  /locales             # i18n translation files
  /types                # TypeScript type definitions
/prisma                 # Database schema and migrations
/public                 # Static assets
/docs                   # Documentation
```

## Documentation

- [Development Guidelines](docs/development-guidelines.md)
- [Translation Guide](docs/TRANSLATIONS.md)
- [Architecture Overview](docs/architecture.md)
- [Quick Reference](docs/quick-reference.md)
- [Automated Units Import API](docs/automated-units-import-api.md)

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret key for authentication
- `NEXTAUTH_URL`: Authentication callback URL
- `NEXT_PUBLIC_API_URL`: API base URL
- `UNITS_IMPORT_API_TOKEN`: API token for automated unit imports

See `.env.example` for all available configuration options.

## Available Scripts

- `yarn run dev` - Start development server
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript checks
- `yarn docker:up` - Start development database
- `yarn docker:down` - Stop development database
- `yarn db:push` - Push schema changes to database
- `yarn db:seed` - Seed database with initial data
- `yarn db:studio` - Open Prisma Studio

## Database Security

To check PostgreSQL access security:

```bash
# Check listening settings in postgresql.conf
grep "listen_addresses" /etc/postgresql/14/main/postgresql.conf

# Check access settings in pg_hba.conf
cat /etc/postgresql/14/main/pg_hba.conf | grep -v '^#' | grep -v '^$'
```

Safe configuration should show:
- Only localhost connections (127.0.0.1/32 and ::1/128)
- No external access (no 0.0.0.0/0)
- Secure authentication methods (scram-sha-256)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

Администратор
Email: admin@homio.com
Username: admin
Password: demo123
Role: ADMIN
Застройщик
Email: developer@homio.com
Username: developer
Password: demo123
Role: DEVELOPER
Связан с компанией застройщика "Demo Developer"
Агент
Email: agent@homio.com
Username: agent
Password: demo123
Role: AGENT
Связан с агентством "Demo Agency"
Клиент
Email: client@homio.com
Username: client
Password: demo123
Role: CLIENT



Оптимизация сборки:

swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

cd /var/homio && \
export NODE_OPTIONS="--max-old-space-size=4096" && \
export NEXT_TELEMETRY_DISABLED=1 && \
yarn install --production=false --network-timeout 1000000 && \
yarn build


psql -h localhost -U postgres -d homio -f prisma/migrations/20250115_rename_project_location/migration.sql


yarn tsx prisma/seed-real-data-new.ts