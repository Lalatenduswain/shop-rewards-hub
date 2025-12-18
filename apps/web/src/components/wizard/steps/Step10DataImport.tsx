'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dataImportSchema, type DataImport } from '@shop-rewards/shared';
import { useWizardStore } from '@/store/wizardStore';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function Step10DataImport() {
  const dataImport = useWizardStore((state) => state.dataImport);
  const setDataImportData = useWizardStore((state) => state.setDataImportData);
  const markStepCompleted = useWizardStore((state) => state.markStepCompleted);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({
    shops: 'idle',
    employees: 'idle',
    vouchers: 'idle',
  });

  const {
    register,

    watch,
    formState: { errors, isValid },
  } = useForm<DataImport>({
    resolver: zodResolver(dataImportSchema),
    defaultValues: dataImport,
    mode: 'onChange',
  });

  const formValues = watch();

  useEffect(() => {
    if (formValues) {
      setDataImportData(formValues);
    }
  }, [formValues, setDataImportData]);

  useEffect(() => {
    // Mark as completed even if no files uploaded (optional step)
    markStepCompleted(10);
  }, [markStepCompleted]);

  const handleFileUpload = (type: 'shops' | 'employees' | 'vouchers', file: File) => {
    setUploadStatus((prev) => ({ ...prev, [type]: 'uploading' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setDataImportData({ [`${type}Csv`]: base64 });
      setUploadStatus((prev) => ({ ...prev, [type]: 'success' }));
    };
    reader.onerror = () => {
      setUploadStatus((prev) => ({ ...prev, [type]: 'error' }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
          Optional: Import Existing Data
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          You can skip this step and add data manually later. CSV files will be validated and imported after wizard completion.
        </p>
      </div>

      {/* Shops CSV Import */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Import Shops (Tenants)
        </h3>
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('shops', file);
              }}
            />
            {uploadStatus.shops === 'success' && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ File uploaded successfully</p>
            )}
            {uploadStatus.shops === 'error' && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">✗ Upload failed</p>
            )}
          </div>

          {/* CSV Format Guide */}
          <div className="mt-4 p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Expected CSV Format:</p>
            <code className="text-xs text-gray-600 dark:text-gray-400 font-mono block">
              name,slug,industry,country,currency<br />
              "Acme Shop","acme-shop","retail","US","USD"<br />
              "Beta Store","beta-store","ecommerce","GB","GBP"
            </code>
          </div>
        </div>
      </div>

      {/* Employees CSV Import */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Import Employees
        </h3>
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('employees', file);
              }}
            />
            {uploadStatus.employees === 'success' && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ File uploaded successfully</p>
            )}
            {uploadStatus.employees === 'error' && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">✗ Upload failed</p>
            )}
          </div>

          {/* CSV Format Guide */}
          <div className="mt-4 p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Expected CSV Format:</p>
            <code className="text-xs text-gray-600 dark:text-gray-400 font-mono block">
              name,email,shopSlug,role,department<br />
              "John Doe","john@acme.com","acme-shop","manager","Sales"<br />
              "Jane Smith","jane@acme.com","acme-shop","user","Marketing"
            </code>
          </div>
        </div>
      </div>

      {/* Vouchers CSV Import */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Import Vouchers
        </h3>
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('vouchers', file);
              }}
            />
            {uploadStatus.vouchers === 'success' && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">✓ File uploaded successfully</p>
            )}
            {uploadStatus.vouchers === 'error' && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">✗ Upload failed</p>
            )}
          </div>

          {/* CSV Format Guide */}
          <div className="mt-4 p-3 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Expected CSV Format:</p>
            <code className="text-xs text-gray-600 dark:text-gray-400 font-mono block">
              shopSlug,title,code,value,validFrom,validUntil<br />
              "acme-shop","20% Off","WELCOME20","20","2025-01-01","2025-12-31"<br />
              "acme-shop","$10 Discount","SAVE10","10","2025-01-01","2025-06-30"
            </code>
          </div>
        </div>
      </div>

      {/* Import Notes */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
            Important Notes:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Files will be validated for correct format and data types</li>
            <li>Duplicate entries will be skipped</li>
            <li>Import processing happens after wizard completion</li>
            <li>You'll receive an email with import results</li>
          </ul>
        </div>
      </div>

      {/* Validation Status */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✓ Data import step complete. Click "Next" to continue.
        </p>
      </div>
    </div>
  );
}
