import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityValidator } from '../lib/security/SecurityValidator';
import { SecurityContext, UserRole } from '../types/security';

interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

export async function securityMiddleware(
  request: NextRequest,
  resource: string,
  action: string
) {
  try {
    // В реальности здесь будет десериализация пользователя из сессии
    const userHeader = request.headers.get('user');
    if (!userHeader) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const user: User = JSON.parse(userHeader);

    // Создаем контекст безопасности
    const securityContext: SecurityContext = {
      organization: request.headers.get('organization') || '',
      project: request.headers.get('project') || '',
      ipRestrictions: ['127.0.0.1'], // Пример, в реальности будет из конфига
      timeRestrictions: {
        start: new Date(0),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      }
    };

    // Создаем валидатор
    const validator = new SecurityValidator(securityContext);

    // Проверяем доступ
    const validation = await validator.validateAccess(
      user,
      action,
      resource,
      {
        organization: request.headers.get('organization') || '',
        project: request.headers.get('project') || '',
        ipRestrictions: [request.ip || '127.0.0.1'],
        timeRestrictions: {
          start: new Date(0),
          end: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }
      }
    );

    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Access denied',
          details: validation.errors
        }),
        { status: 403 }
      );
    }

    // Если все проверки пройдены, пропускаем запрос дальше
    return null;
  } catch (error) {
    console.error('Security middleware error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Security check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// Middleware для SQL запросов
export async function sqlSecurityMiddleware(
  request: NextRequest,
  query: string
) {
  try {
    const userHeader = request.headers.get('user');
    if (!userHeader) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const user: User = JSON.parse(userHeader);

    const securityContext: SecurityContext = {
      organization: request.headers.get('organization') || '',
      project: request.headers.get('project') || '',
      ipRestrictions: ['127.0.0.1'],
      timeRestrictions: {
        start: new Date(0),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      }
    };

    const validator = new SecurityValidator(securityContext);

    // Проверяем базовый доступ к SQL
    const sqlAccess = await validator.validateAccess(
      user,
      'execute',
      'sql'
    );

    if (!sqlAccess.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'SQL access denied',
          details: sqlAccess.errors
        }),
        { status: 403 }
      );
    }

    // Здесь должна быть дополнительная проверка самого SQL запроса
    // Например, проверка используемых таблиц и типов операций
    // Это будет реализовано в следующем этапе

    return null;
  } catch (error) {
    console.error('SQL security middleware error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'SQL security check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 