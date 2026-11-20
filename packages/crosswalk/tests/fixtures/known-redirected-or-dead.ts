/**
 * Gate 1 item 2 — evidence URLs confirmed redirected or dead.
 *
 * Checked 2026-11-20 (HEAD, followed one hop). The test suite never requests
 * these URLs. The list says what must not be cited; it does not say what the
 * replacement should be.
 *
 * - https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft
 *   HTTP 301 → https://www.paloaltonetworks.com/cortex/agentic-endpoint-security
 *   (an unrelated Palo Alto Networks product page, not the postmark-mcp incident).
 */
export const KNOWN_REDIRECTED_OR_DEAD = [
  "https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft",
] as const;
