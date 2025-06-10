# Environment Variables

This document describes the environment variables used in the application and how to manage them securely.

## File Structure

The application uses several environment files for different purposes:

- `.env.example` - Template with all required variables
- `.env` - Local development variables
- `.env.local` - Local overrides (not committed to git)
- `.env.production` - Production environment variables
- `.env.staging` - Staging environment variables

## Required Variables

### Database Configuration
```bash
# PostgreSQL connection settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=homio
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
```

### Google Services
```bash
# Google Sheets API credentials
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="your-private-key"

# Google Maps API key (public)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### OpenAI Configuration
```bash
# OpenAI API credentials
OPENAI_API_KEY=your-openai-api-key
```

### Next Auth Configuration
```bash
# Authentication settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### AWS S3 Configuration
```bash
# AWS credentials for media storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-bucket-name
```

### Application Settings
```bash
# General settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Environment Setup

### Local Development

1. Copy the example file:
```bash
cp .env.example .env
```

2. Update the values in `.env` with your development credentials

3. Create `.env.local` for any personal overrides:
```bash
cp .env .env.local
```

### Production Setup

1. Create production environment file:
```bash
cp .env.example .env.production
```

2. Update with production values:
- Use strong passwords
- Set proper API URLs
- Configure production database
- Add production API keys

3. Set up secrets in deployment platform:
- Use platform's secrets management
- Never commit production credentials to git
- Rotate credentials regularly

## Security Guidelines

### Sensitive Information
- Never commit `.env.local` or `.env.production`
- Store production secrets in a secure vault
- Use different credentials for each environment
- Regularly rotate API keys and passwords

### Public Variables
- Prefix with `NEXT_PUBLIC_` for client-side use
- Only expose necessary information
- Use separate API keys for public access

### Access Control
- Limit access to production credentials
- Use role-based access for cloud services
- Monitor credential usage

## Deployment Considerations

### Container Deployment
- Pass environment variables through Docker Compose
- Use secrets management in production
- Consider using Docker secrets

Example docker-compose.yml:
```yaml
services:
  app:
    environment:
      NODE_ENV: production
    env_file:
      - .env.production
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

### Cloud Deployment
- Use cloud provider's secrets management
- Set up proper IAM roles and permissions
- Enable audit logging for secrets access

### Continuous Integration
- Use CI/CD platform's secret management
- Never expose secrets in build logs
- Use separate credentials for CI/CD

## Troubleshooting

### Common Issues

1. **Missing Variables**
   - Check if all required variables are set
   - Verify file permissions
   - Ensure proper file naming

2. **Invalid Values**
   - Validate format of API keys
   - Check URL formatting
   - Verify database connection string

3. **Environment Conflicts**
   - Check precedence of env files
   - Verify environment detection
   - Clear cached values

### Development Tips

1. **Local Testing**
```bash
# Verify env loading
node -e 'console.log(process.env)'

# Test database connection
yarn prisma db pull

# Check Next.js env
yarn next dev
```

2. **Production Verification**
```bash
# Test production build
yarn build

# Verify env in container
docker-compose config

# Check secrets mounting
docker-compose exec app env
``` 