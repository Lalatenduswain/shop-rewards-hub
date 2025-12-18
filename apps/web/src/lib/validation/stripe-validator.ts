/**
 * Stripe API Validator
 *
 * Validates Stripe API keys before saving to wizard.
 * Tests authentication and retrieves account information.
 */

import 'server-only';
import Stripe from 'stripe';
import type { Billing } from '@shop-rewards/shared';

export interface StripeValidationResult {
  success: boolean;
  message: string;
  accountId?: string;
  accountName?: string;
  currency?: string;
  isLiveMode?: boolean;
  error?: string;
}

/**
 * Validate Stripe API key and retrieve account info
 *
 * @param config - Billing configuration with Stripe API key
 * @returns Validation result with account details
 */
export async function validateStripeKey(
  config: Billing
): Promise<StripeValidationResult> {
  if (!config.apiKey) {
    return {
      success: false,
      message: 'No API key provided',
      error: 'MISSING_API_KEY',
    };
  }

  if (config.provider !== 'stripe') {
    return {
      success: false,
      message: 'Provider is not Stripe',
      error: 'INVALID_PROVIDER',
    };
  }

  try {
    console.log('[Stripe Validator] Validating API key');

    // Determine if it's a live or test key
    const isLiveMode = config.apiKey.startsWith('sk_live_');
    const isTestMode = config.apiKey.startsWith('sk_test_');

    if (!isLiveMode && !isTestMode) {
      return {
        success: false,
        message: 'Invalid API key format. Must start with sk_live_ or sk_test_',
        error: 'INVALID_KEY_FORMAT',
      };
    }

    // Initialize Stripe client
    const stripe = new Stripe(config.apiKey, {
      apiVersion: '2025-12-15.clover', // Use latest API version
      typescript: true,
    });

    // Retrieve account balance (lightweight call to test auth)
    const balance = await stripe.balance.retrieve();

    // Retrieve account information
    const account = await stripe.accounts.retrieve();

    console.log('[Stripe Validator] Validation successful', {
      accountId: account.id,
      isLiveMode,
    });

    return {
      success: true,
      message: `Stripe account verified successfully (${isLiveMode ? 'Live' : 'Test'} mode)`,
      accountId: account.id,
      accountName: account.business_profile?.name || account.email || 'Unknown',
      currency: balance.available[0]?.currency || 'usd',
      isLiveMode,
    };
  } catch (error) {
    console.error('[Stripe Validator] Validation failed:', error);

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return {
        success: false,
        message:
          'Authentication failed. Please check your API key is correct.',
        error: 'AUTHENTICATION_FAILED',
      };
    }

    if (error instanceof Stripe.errors.StripePermissionError) {
      return {
        success: false,
        message:
          'Permission denied. Your API key may not have sufficient permissions.',
        error: 'PERMISSION_DENIED',
      };
    }

    if (error instanceof Stripe.errors.StripeRateLimitError) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        error: 'RATE_LIMIT',
      };
    }

    if (error instanceof Stripe.errors.StripeConnectionError) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
        error: 'CONNECTION_ERROR',
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      message: 'Stripe validation failed',
      error: errorMessage,
    };
  }
}

/**
 * Validate Stripe webhook secret
 *
 * @param webhookSecret - Webhook secret to validate
 * @param testPayload - Optional test payload to verify signature
 * @returns Validation result
 */
export async function validateWebhookSecret(
  webhookSecret: string
): Promise<StripeValidationResult> {
  if (!webhookSecret) {
    return {
      success: false,
      message: 'No webhook secret provided',
      error: 'MISSING_WEBHOOK_SECRET',
    };
  }

  // Check format
  if (!webhookSecret.startsWith('whsec_')) {
    return {
      success: false,
      message: 'Invalid webhook secret format. Must start with whsec_',
      error: 'INVALID_FORMAT',
    };
  }

  // For now, just validate format since we can't test without actual webhook events
  console.log('[Stripe Validator] Webhook secret format validated');

  return {
    success: true,
    message: 'Webhook secret format is valid',
  };
}

/**
 * Test webhook endpoint by creating a test event
 *
 * Note: This requires the webhook endpoint to be accessible
 * and properly configured.
 *
 * @param apiKey - Stripe API key
 * @param webhookUrl - Webhook endpoint URL
 * @returns Test result
 */
export async function testWebhookEndpoint(
  apiKey: string,
  webhookUrl: string
): Promise<StripeValidationResult> {
  try {
    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });

    // List webhook endpoints
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });

    // Check if our endpoint exists
    const endpoint = endpoints.data.find((e) => e.url === webhookUrl);

    if (!endpoint) {
      return {
        success: false,
        message: `Webhook endpoint not found in Stripe dashboard. Please add ${webhookUrl}`,
        error: 'ENDPOINT_NOT_FOUND',
      };
    }

    console.log('[Stripe Validator] Webhook endpoint found', {
      id: endpoint.id,
      status: endpoint.status,
    });

    return {
      success: true,
      message: `Webhook endpoint configured (Status: ${endpoint.status})`,
    };
  } catch (error) {
    console.error('[Stripe Validator] Webhook test failed:', error);

    return {
      success: false,
      message: 'Failed to verify webhook endpoint',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
