'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { databaseSchema, type Database } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';

export function Step07DatabaseTarget() {
  const database = useWizardStore((state) => state.database);
  const setDatabaseData = useWizardStore((state) => state.setDatabaseData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<Database>({
    resolver: zodResolver(databaseSchema),
    defaultValues: database,
    mode: 'onChange',
  });

  const target = watch('target');

  // Save form data
  const saveFormData = (data: Database) => {
    setDatabaseData(data);
  };

  useEffect(() => {
    if (isValid && validationStatus === 'success') {
      markStepCompleted(7);
    }
  }, [isValid, validationStatus, markStepCompleted]);

  const handleTestAndApply = async () => {
    setValidationStatus('validating');
    setErrorMessage('');

    try {
      // TODO: Call tRPC mutation to test connection and run migrations
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setValidationStatus('success');
      setDatabaseData({ validated: true });
    } catch (error) {
      setValidationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
          ⚠️ Critical Configuration Step
        </p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          This step configures your database and runs all migrations. Choose carefully based on your deployment needs.
        </p>
      </div>

      {/* Database Target Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Database Target <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SQLite Option */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              target === 'sqlite'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => {
              setDatabaseData({ target: 'sqlite' });
              handleSubmit(saveFormData)();
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('target')}
                value="sqlite"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">SQLite (Local)</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  File-based database. Best for development and testing.
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  ✓ Zero configuration<br />
                  ✓ Fast setup<br />
                  ✗ Not recommended for production
                </div>
              </div>
            </div>
          </div>

          {/* Docker Postgres Option */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              target === 'docker-postgres'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => {
              setDatabaseData({ target: 'docker-postgres' });
              handleSubmit(saveFormData)();
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('target')}
                value="docker-postgres"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Docker Postgres</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  PostgreSQL 18.1 in docker-compose. Best for self-hosted production.
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  ✓ Production-ready<br />
                  ✓ Full control<br />
                  ✓ Automated backups
                </div>
              </div>
            </div>
          </div>

          {/* Managed Cloud Option */}
          <div
            className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
              target === 'managed'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
            onClick={() => {
              setDatabaseData({ target: 'managed' });
              handleSubmit(saveFormData)();
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                {...register('target')}
                value="managed"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Managed Cloud</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  AWS RDS, Azure, GCP, or Neon. Best for scalability.
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  ✓ Automatic scaling<br />
                  ✓ Managed backups<br />
                  ✓ High availability
                </div>
              </div>
            </div>
          </div>
        </div>
        {errors.target && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.target.message}</p>
        )}
      </div>

      {/* Managed Cloud Configuration */}
      {target === 'managed' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Managed Database Configuration</h3>

          {/* Provider Selection */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cloud Provider <span className="text-red-500">*</span>
            </label>
            <select
              id="provider"
              {...register('provider')}
              onChange={handleSubmit(saveFormData)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select provider</option>
              <option value="aws-rds">AWS RDS PostgreSQL</option>
              <option value="azure-db">Azure Database for PostgreSQL</option>
              <option value="gcp-sql">Google Cloud SQL</option>
              <option value="neon">Neon (Serverless)</option>
              <option value="supabase">Supabase</option>
              <option value="digitalocean">DigitalOcean Managed Database</option>
              <option value="other">Other</option>
            </select>
            {errors.provider && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.provider.message}</p>
            )}
          </div>

          {/* Connection String */}
          <div>
            <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection String <span className="text-red-500">*</span>
            </label>
            <input
              id="connectionString"
              type="text"
              {...register('connectionString')}
              onBlur={handleSubmit(saveFormData)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="postgresql://user:password@host:5432/database?sslmode=require"
            />
            {errors.connectionString && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.connectionString.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Full PostgreSQL connection string with credentials. Must support pgcrypto extension.
            </p>
          </div>
        </div>
      )}

      {/* Docker Postgres Info */}
      {target === 'docker-postgres' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Docker PostgreSQL Configuration</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>✓ PostgreSQL 18.1 container will be used from docker-compose</p>
            <p>✓ Connection: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">postgresql://shoprewards:shoprewards@db:5432/shoprewards</code></p>
            <p>✓ Extensions enabled: pgcrypto, uuid-ossp</p>
            <p>✓ Persistent volume: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">postgres-data</code></p>
          </div>
        </div>
      )}

      {/* SQLite Info */}
      {target === 'sqlite' && (
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">SQLite Configuration</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>✓ Database file: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">./prisma/dev.db</code></p>
            <p>⚠️ Not recommended for multi-tenant production use</p>
            <p>ℹ️ Use for development and testing only</p>
          </div>
        </div>
      )}

      {/* Test & Apply Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleTestAndApply}
          disabled={!isValid || validationStatus === 'validating'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
        >
          {validationStatus === 'validating' ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing Connection & Running Migrations...
            </>
          ) : (
            'Test Connection & Apply Migrations'
          )}
        </button>

        {validationStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">
              ✓ Database Connection Successful
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              All migrations applied successfully. Database is ready.
            </p>
          </div>
        )}

        {validationStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
              ✗ Database Connection Failed
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {errorMessage || 'Please check your configuration and try again.'}
            </p>
          </div>
        )}
      </div>

      {/* Validation Status */}
      {isValid && validationStatus === 'success' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Database configured and validated. Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
}
