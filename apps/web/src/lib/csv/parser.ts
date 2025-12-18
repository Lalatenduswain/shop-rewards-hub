/**
 * CSV Parser with Schema Validation
 *
 * Parses and validates CSV files for data import in wizard Step 10.
 * Supports shops, employees, and vouchers with schema validation.
 */

import 'server-only';
import Papa from 'papaparse';
import { z } from 'zod';

export interface CSVParseResult<T> {
  success: boolean;
  data?: T[];
  errors?: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  meta?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
}

/**
 * Shop CSV schema
 */
const shopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  industry: z.string().min(1, 'Industry is required'),
  country: z.string().length(2, 'Country must be 2-letter code (e.g., US)'),
  currency: z
    .string()
    .length(3, 'Currency must be 3-letter code (e.g., USD)'),
});

export type ShopCSV = z.infer<typeof shopSchema>;

/**
 * Employee CSV schema
 */
const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  shopSlug: z.string().min(1, 'Shop slug is required'),
  role: z.enum(['manager', 'user'], {
    errorMap: () => ({ message: 'Role must be manager or user' }),
  }),
  department: z.string().optional(),
});

export type EmployeeCSV = z.infer<typeof employeeSchema>;

/**
 * Voucher CSV schema
 */
const voucherSchema = z.object({
  shopSlug: z.string().min(1, 'Shop slug is required'),
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Value must be a number'),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export type VoucherCSV = z.infer<typeof voucherSchema>;

/**
 * Parse and validate shops CSV
 *
 * @param csvContent - CSV file content (Base64 or raw string)
 * @returns Parsed shops with validation errors
 */
export async function parseShopsCSV(
  csvContent: string
): Promise<CSVParseResult<ShopCSV>> {
  return parseCSV<ShopCSV>(csvContent, shopSchema, 'shops');
}

/**
 * Parse and validate employees CSV
 *
 * @param csvContent - CSV file content
 * @returns Parsed employees with validation errors
 */
export async function parseEmployeesCSV(
  csvContent: string
): Promise<CSVParseResult<EmployeeCSV>> {
  return parseCSV<EmployeeCSV>(csvContent, employeeSchema, 'employees');
}

/**
 * Parse and validate vouchers CSV
 *
 * @param csvContent - CSV file content
 * @returns Parsed vouchers with validation errors
 */
export async function parseVouchersCSV(
  csvContent: string
): Promise<CSVParseResult<VoucherCSV>> {
  return parseCSV<VoucherCSV>(csvContent, voucherSchema, 'vouchers');
}

/**
 * Generic CSV parser with schema validation
 *
 * @param csvContent - CSV content (Base64 or raw)
 * @param schema - Zod schema for validation
 * @param type - Type of data for logging
 * @returns Parsed and validated data
 */
async function parseCSV<T>(
  csvContent: string,
  schema: z.ZodSchema<T>,
  type: string
): Promise<CSVParseResult<T>> {
  try {
    // Decode Base64 if needed (server-side only)
    let content = csvContent;
    if (csvContent.startsWith('data:')) {
      // Extract base64 part
      const base64Data = csvContent.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid data URL format');
      }
      // This function runs server-side only (in tRPC mutations)
      if (typeof Buffer !== 'undefined') {
        content = Buffer.from(base64Data, 'base64').toString('utf-8');
      } else {
        // Fallback for client-side (shouldn't happen in practice)
        throw new Error('Base64 decoding not supported in browser context');
      }
    }

    console.log(`[CSV Parser] Parsing ${type} CSV`);

    // Parse CSV
    const parseResult = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      console.error(`[CSV Parser] Parse errors in ${type}:`, parseResult.errors);
      return {
        success: false,
        errors: parseResult.errors.map((err, idx) => ({
          row: err.row ?? idx,
          message: err.message,
        })),
      };
    }

    const validatedData: T[] = [];
    const errors: Array<{ row: number; field?: string; message: string }> = [];

    // Validate each row
    parseResult.data.forEach((row, index) => {
      const result = schema.safeParse(row);

      if (result.success) {
        validatedData.push(result.data);
      } else {
        // Collect validation errors for this row
        result.error.errors.forEach((err) => {
          errors.push({
            row: index + 2, // +2 because row 1 is headers, index starts at 0
            field: err.path.join('.'),
            message: err.message,
          });
        });
      }
    });

    console.log(`[CSV Parser] ${type} parsed:`, {
      total: parseResult.data.length,
      valid: validatedData.length,
      invalid: errors.length,
    });

    return {
      success: errors.length === 0,
      data: validatedData,
      errors: errors.length > 0 ? errors : undefined,
      meta: {
        totalRows: parseResult.data.length,
        validRows: validatedData.length,
        invalidRows: errors.length,
      },
    };
  } catch (error) {
    console.error(`[CSV Parser] Failed to parse ${type}:`, error);

    return {
      success: false,
      errors: [
        {
          row: 0,
          message: error instanceof Error ? error.message : 'Unknown parse error',
        },
      ],
    };
  }
}

/**
 * Validate CSV headers match expected schema
 *
 * @param csvContent - CSV content
 * @param expectedHeaders - Expected header names
 * @returns Validation result
 */
export function validateCSVHeaders(
  csvContent: string,
  expectedHeaders: string[]
): { success: boolean; message: string; missingHeaders?: string[] } {
  try {
    // Decode Base64 if needed (server-side only)
    let content = csvContent;
    if (csvContent.startsWith('data:')) {
      const base64Data = csvContent.split(',')[1];
      if (!base64Data) {
        return {
          success: false,
          message: 'Invalid data URL format',
        };
      }
      if (typeof Buffer !== 'undefined') {
        content = Buffer.from(base64Data, 'base64').toString('utf-8');
      } else {
        throw new Error('Base64 decoding not supported in browser context');
      }
    }

    // Parse just the first row to get headers
    const parseResult = Papa.parse<Record<string, string>>(content, {
      header: true,
      preview: 1,
    });

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        message: 'Failed to parse CSV headers',
      };
    }

    const actualHeaders = parseResult.meta.fields || [];
    const missingHeaders = expectedHeaders.filter(
      (h) => !actualHeaders.includes(h)
    );

    if (missingHeaders.length > 0) {
      return {
        success: false,
        message: `Missing required headers: ${missingHeaders.join(', ')}`,
        missingHeaders,
      };
    }

    return {
      success: true,
      message: 'All required headers present',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Header validation failed',
    };
  }
}
