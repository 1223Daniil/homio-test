# Deployment Guide

## Database Setup

The application uses PostgreSQL database running in a Docker container. For production deployment, follow these steps:

### Initial Setup

1. Create required directories:
```bash
mkdir -p /var/lib/homio/postgres/data
mkdir -p /var/lib/homio/postgres/backup
```

2. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Update database credentials
POSTGRES_USER=your_production_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=homio_prod
```

3. Start the database:
```bash
docker-compose up -d postgres
```

4. Initialize the database:
```bash
# Run migrations
yarn prisma migrate deploy

# Create minimal system data (recommended for production)
yarn db:seed:minimal
```

### Backup Strategy

1. Set up automated backups:
```bash
# Add to crontab (backup daily at 2 AM)
0 2 * * * /path/to/app/scripts/backup-db.sh
```

2. Configure backup rotation:
```bash
# Keep last 7 daily backups
find /var/lib/homio/postgres/backup -name "backup_*.sql.gz" -mtime +7 -delete
```

3. Test backup restoration:
```bash
# Regularly test backup restoration
./scripts/restore-db.sh ./backup/latest_backup.sql.gz
```

### Security Recommendations

1. Network Security:
   - Use internal Docker network
   - Don't expose PostgreSQL port to the internet
   - Use SSL for database connections

2. Access Control:
   - Use strong passwords
   - Limit database user permissions
   - Regularly rotate credentials

3. Data Protection:
   - Enable WAL archiving
   - Configure regular backups
   - Use encrypted volumes

### Monitoring

1. Set up health checks:
```bash
# Check database status
docker exec homio_postgres pg_isready

# Monitor disk space
df -h /var/lib/homio/postgres/data
```

2. Configure alerts for:
   - High disk usage
   - Failed health checks
   - Failed backups
   - Connection issues

### Updating Database

1. Before update:
   - Create backup
   - Test update procedure in staging
   - Schedule maintenance window

2. Update procedure:
```bash
# Create backup
./scripts/backup-db.sh

# Stop container
docker-compose down postgres

# Update image
docker-compose pull postgres

# Start new container
docker-compose up -d postgres

# Verify update
docker-compose logs postgres
```

3. After update:
   - Verify application functionality
   - Check database performance
   - Update documentation if needed

### Disaster Recovery

1. Prepare recovery plan:
   - Keep backup copies offsite
   - Document recovery procedures
   - Test recovery regularly

2. Recovery steps:
```bash
# Stop services
docker-compose down

# Restore data
./scripts/restore-db.sh /path/to/backup.sql.gz

# Start services
docker-compose up -d
```

3. Post-recovery:
   - Verify data integrity
   - Check application functionality
   - Document incident and improvements 