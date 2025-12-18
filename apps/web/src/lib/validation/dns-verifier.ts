/**
 * DNS Verifier
 *
 * Validates custom domain DNS records before allowing branding configuration.
 * Checks CNAME records to ensure domain ownership.
 */

import 'server-only';
import { promises as dns } from 'dns';

export interface DNSVerificationResult {
  success: boolean;
  message: string;
  records?: string[];
  error?: string;
}

/**
 * Verify CNAME record for custom domain
 *
 * @param domain - Custom domain to verify (e.g., "rewards.company.com")
 * @param expectedTarget - Expected CNAME target (e.g., "app.shoprewards.io")
 * @returns Verification result
 */
export async function verifyCNAME(
  domain: string,
  expectedTarget?: string
): Promise<DNSVerificationResult> {
  try {
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    console.log('[DNS Verifier] Checking CNAME for', cleanDomain);

    // Resolve CNAME records
    const records = await dns.resolveCname(cleanDomain);

    if (records.length === 0) {
      return {
        success: false,
        message: 'No CNAME records found for this domain',
        error: 'CNAME_NOT_FOUND',
      };
    }

    // If expected target is provided, validate it
    if (expectedTarget) {
      const cleanTarget = expectedTarget
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      const isValid = records.some(
        (record) => record.toLowerCase() === cleanTarget.toLowerCase()
      );

      if (!isValid) {
        return {
          success: false,
          message: `CNAME record points to ${records[0]}, expected ${cleanTarget}`,
          records,
          error: 'CNAME_MISMATCH',
        };
      }
    }

    console.log('[DNS Verifier] CNAME verification successful', {
      domain: cleanDomain,
      records,
    });

    return {
      success: true,
      message: `CNAME record verified successfully: ${records[0]}`,
      records,
    };
  } catch (error) {
    console.error('[DNS Verifier] CNAME verification failed:', error);

    // Handle specific DNS errors
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        return {
          success: false,
          message: 'Domain not found. Please check the domain name.',
          error: 'DOMAIN_NOT_FOUND',
        };
      }

      if (error.message.includes('ENODATA')) {
        return {
          success: false,
          message:
            'No CNAME record found. Please add a CNAME record pointing to your ShopRewards Hub instance.',
          error: 'NO_CNAME_RECORD',
        };
      }

      return {
        success: false,
        message: 'DNS verification failed',
        error: error.message,
      };
    }

    return {
      success: false,
      message: 'Unknown DNS verification error',
      error: 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Verify A record for custom domain
 *
 * @param domain - Custom domain to verify
 * @param expectedIP - Expected IP address (optional)
 * @returns Verification result
 */
export async function verifyARecord(
  domain: string,
  expectedIP?: string
): Promise<DNSVerificationResult> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    console.log('[DNS Verifier] Checking A record for', cleanDomain);

    // Resolve A records
    const records = await dns.resolve4(cleanDomain);

    if (records.length === 0) {
      return {
        success: false,
        message: 'No A records found for this domain',
        error: 'A_RECORD_NOT_FOUND',
      };
    }

    // If expected IP is provided, validate it
    if (expectedIP) {
      const isValid = records.includes(expectedIP);

      if (!isValid) {
        return {
          success: false,
          message: `A record points to ${records[0]}, expected ${expectedIP}`,
          records,
          error: 'A_RECORD_MISMATCH',
        };
      }
    }

    console.log('[DNS Verifier] A record verification successful', {
      domain: cleanDomain,
      records,
    });

    return {
      success: true,
      message: `A record verified successfully: ${records[0]}`,
      records,
    };
  } catch (error) {
    console.error('[DNS Verifier] A record verification failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        return {
          success: false,
          message: 'Domain not found',
          error: 'DOMAIN_NOT_FOUND',
        };
      }

      return {
        success: false,
        message: 'DNS verification failed',
        error: error.message,
      };
    }

    return {
      success: false,
      message: 'Unknown DNS verification error',
      error: 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Get all DNS records for a domain (for debugging)
 *
 * @param domain - Domain to query
 * @returns Object with all record types
 */
export async function getAllDNSRecords(domain: string): Promise<{
  success: boolean;
  a?: string[];
  aaaa?: string[];
  cname?: string[];
  mx?: Array<{ exchange: string; priority: number }>;
  txt?: string[][];
  error?: string;
}> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const [a, aaaa, cname, mx, txt] = await Promise.allSettled([
      dns.resolve4(cleanDomain),
      dns.resolve6(cleanDomain),
      dns.resolveCname(cleanDomain),
      dns.resolveMx(cleanDomain),
      dns.resolveTxt(cleanDomain),
    ]);

    return {
      success: true,
      a: a.status === 'fulfilled' ? a.value : undefined,
      aaaa: aaaa.status === 'fulfilled' ? aaaa.value : undefined,
      cname: cname.status === 'fulfilled' ? cname.value : undefined,
      mx: mx.status === 'fulfilled' ? mx.value : undefined,
      txt: txt.status === 'fulfilled' ? txt.value : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to query DNS records',
    };
  }
}
