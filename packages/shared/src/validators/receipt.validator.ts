import { z } from 'zod';

/**
 * Receipt status enum
 */
export const receiptStatusSchema = z.enum([
  'PENDING_OCR',
  'OCR_PROCESSING',
  'OCR_COMPLETED',
  'OCR_FAILED',
  'VERIFIED',
  'REJECTED',
  'FRAUDULENT',
]);

export type ReceiptStatus = z.infer<typeof receiptStatusSchema>;

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.enum([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ], {
    errorMap: () => ({ message: 'Only JPEG, PNG, WebP, and PDF files are allowed' }),
  }),
  size: z.number().int().min(1).max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  base64Data: z.string().min(1, 'File data is required'),
});

export type FileUpload = z.infer<typeof fileUploadSchema>;

/**
 * Upload receipt schema
 */
export const uploadReceiptSchema = z.object({
  shopId: z.string().cuid(),
  campaignId: z.string().cuid().optional(),
  file: fileUploadSchema,
  metadata: z.object({
    location: z.string().optional(),
    notes: z.string().max(500).optional(),
  }).optional(),
});

export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>;

/**
 * OCR result schema
 */
export const ocrResultSchema = z.object({
  merchantName: z.string().optional(),
  merchantAddress: z.string().optional(),
  date: z.string().datetime().optional(),
  total: z.number().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  currency: z.string().length(3).optional(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().optional(),
    unitPrice: z.number().optional(),
    totalPrice: z.number().optional(),
  })).optional(),
  paymentMethod: z.string().optional(),
  confidence: z.number().min(0).max(100),
  rawText: z.string().optional(),
});

export type OcrResult = z.infer<typeof ocrResultSchema>;

/**
 * Update receipt with OCR results
 */
export const updateReceiptOcrSchema = z.object({
  receiptId: z.string().cuid(),
  status: receiptStatusSchema,
  ocrResult: ocrResultSchema.optional(),
  fraudScore: z.number().min(0).max(100).optional(),
});

export type UpdateReceiptOcrInput = z.infer<typeof updateReceiptOcrSchema>;

/**
 * Verify/reject receipt schema
 */
export const reviewReceiptSchema = z.object({
  receiptId: z.string().cuid(),
  status: z.enum(['VERIFIED', 'REJECTED', 'FRAUDULENT']),
  notes: z.string().max(500).optional(),
  manualTotal: z.number().optional(),
});

export type ReviewReceiptInput = z.infer<typeof reviewReceiptSchema>;

/**
 * Receipt query filters
 */
export const receiptFiltersSchema = z.object({
  shopId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  campaignId: z.string().cuid().optional(),
  status: receiptStatusSchema.optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ReceiptFilters = z.infer<typeof receiptFiltersSchema>;
