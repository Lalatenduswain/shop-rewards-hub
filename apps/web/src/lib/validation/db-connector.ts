/**
 * Database Connection Tester
 *
 * Tests database connections and runs migrations for wizard Step 7.
 * Supports SQLite, PostgreSQL, MySQL via Prisma.
 */

import 'server-only';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@shop-rewards/db';
import type { Database } from '@shop-rewards/shared';

const execAsync = promisify(exec);

export interface DatabaseTestResult {
  success: boolean;
  message: string;
  provider?: string;
  version?: string;
  migrationStatus?: 'pending' | 'applied' | 'none';
  error?: string;
}

/**
 * Test database connection with provided configuration
 *
 * @param config - Database configuration from wizard
 * @returns Test result with connection status
 */
export async function testDatabaseConnection(
  config: Database
): Promise<DatabaseTestResult> {
  try {
    let connectionString: string;

    // Build connection string based on target
    if (config.target === 'sqlite') {
      connectionString = 'file:./prisma/dev.db';
    } else if (config.target === 'docker-postgres') {
      // Use docker-compose postgres
      connectionString =
        'postgresql://shoprewards:shoprewards@localhost:5432/shoprewards';
    } else if (config.target === 'managed' && config.connectionString) {
      connectionString = config.connectionString;
    } else {
      return {
        success: false,
        message: 'Invalid database configuration',
        error: 'INVALID_CONFIG',
      };
    }

    // Temporarily set DATABASE_URL for testing
    const originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = connectionString;

    console.log('[DB Connector] Testing connection to', {
      target: config.target,
      provider: config.provider,
    });

    // Create Prisma client
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });

    // Try to connect and query
    await prisma.$connect();

    // Get database version
    const result = await prisma.$queryRaw<
      Array<{ version: string }>
    >`SELECT version()`;
    const version =
      result && result[0] ? result[0].version : 'Unknown version';

    console.log('[DB Connector] Connection successful', { version });

    await prisma.$disconnect();

    // Restore original DATABASE_URL
    if (originalDatabaseUrl) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    return {
      success: true,
      message: 'Database connection successful',
      provider: config.provider,
      version,
    };
  } catch (error) {
    console.error('[DB Connector] Connection failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Categorize common errors
    if (errorMessage.includes('ECONNREFUSED')) {
      return {
        success: false,
        message: 'Connection refused. Is the database server running?',
        error: 'CONNECTION_REFUSED',
      };
    }

    if (errorMessage.includes('authentication failed')) {
      return {
        success: false,
        message: 'Authentication failed. Check username and password.',
        error: 'AUTH_FAILED',
      };
    }

    if (errorMessage.includes('database') && errorMessage.includes('not')) {
      return {
        success: false,
        message: 'Database does not exist. Please create it first.',
        error: 'DATABASE_NOT_FOUND',
      };
    }

    return {
      success: false,
      message: 'Database connection failed',
      error: errorMessage,
    };
  }
}

/**
 * Run Prisma migrations on the configured database
 *
 * @param config - Database configuration
 * @returns Migration result
 */
export async function runMigrations(
  config: Database
): Promise<DatabaseTestResult> {
  try {
    let connectionString: string;

    if (config.target === 'sqlite') {
      connectionString = 'file:./prisma/dev.db';
    } else if (config.target === 'docker-postgres') {
      connectionString =
        'postgresql://shoprewards:shoprewards@localhost:5432/shoprewards';
    } else if (config.target === 'managed' && config.connectionString) {
      connectionString = config.connectionString;
    } else {
      return {
        success: false,
        message: 'Invalid database configuration',
        error: 'INVALID_CONFIG',
      };
    }

    console.log('[DB Connector] Running migrations', {
      target: config.target,
    });

    // Set DATABASE_URL and run migrations
    const env = {
      ...process.env,
      DATABASE_URL: connectionString,
    };

    // Run prisma migrate deploy (for production)
    const { stdout, stderr } = await execAsync(
      'npx prisma migrate deploy --schema=../../packages/db/prisma/schema.prisma',
      { env }
    );

    console.log('[DB Connector] Migration output:', stdout);

    if (stderr && !stderr.includes('warnings')) {
      console.error('[DB Connector] Migration errors:', stderr);
    }

    // Also generate Prisma client
    await execAsync(
      'npx prisma generate --schema=../../packages/db/prisma/schema.prisma',
      { env }
    );

    return {
      success: true,
      message: 'Migrations applied successfully',
      migrationStatus: 'applied',
    };
  } catch (error) {
    console.error('[DB Connector] Migration failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      message: 'Failed to run migrations',
      error: errorMessage,
      migrationStatus: 'pending',
    };
  }
}

/**
 * Check migration status without applying them
 *
 * @param config - Database configuration
 * @returns Status of pending migrations
 */
export async function checkMigrationStatus(
  config: Database
): Promise<DatabaseTestResult> {
  try {
    let connectionString: string;

    if (config.target === 'sqlite') {
      connectionString = 'file:./prisma/dev.db';
    } else if (config.target === 'docker-postgres') {
      connectionString =
        'postgresql://shoprewards:shoprewards@localhost:5432/shoprewards';
    } else if (config.target === 'managed' && config.connectionString) {
      connectionString = config.connectionString;
    } else {
      return {
        success: false,
        message: 'Invalid database configuration',
        error: 'INVALID_CONFIG',
      };
    }

    const env = {
      ...process.env,
      DATABASE_URL: connectionString,
    };

    // Run prisma migrate status
    const { stdout } = await execAsync(
      'npx prisma migrate status --schema=../../packages/db/prisma/schema.prisma',
      { env }
    );

    console.log('[DB Connector] Migration status:', stdout);

    const hasPendingMigrations = stdout.includes('pending');
    const hasAppliedMigrations = stdout.includes('applied');

    return {
      success: true,
      message: hasPendingMigrations
        ? 'Pending migrations found'
        : 'All migrations applied',
      migrationStatus: hasPendingMigrations
        ? 'pending'
        : hasAppliedMigrations
          ? 'applied'
          : 'none',
    };
  } catch (error) {
    console.error('[DB Connector] Status check failed:', error);

    return {
      success: false,
      message: 'Failed to check migration status',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
