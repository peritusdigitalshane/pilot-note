-- Add 10 detailed prompts for Pack 2: Code Review Excellence
DO $$
DECLARE
  pack_id UUID;
BEGIN
  SELECT id INTO pack_id FROM prompt_packs WHERE name = 'Code Review Excellence' LIMIT 1;

  INSERT INTO prompt_pack_items (pack_id, title, prompt_text, order_index) VALUES
  (pack_id, 'Security-Focused Code Review', 'Conduct security-focused code review to identify vulnerabilities.

Security Assessment Protocol:

Authentication & Authorisation
- Review authentication implementation for weaknesses
- Verify proper authorisation checks at all entry points
- Check for broken access control vulnerabilities
- Assess session management security
- Verify password handling and storage
- Review token generation and validation
- Check for privilege escalation vectors

Input Validation & Sanitisation
- Verify all user inputs are validated
- Check for SQL injection vulnerabilities
- Assess XSS (Cross-Site Scripting) prevention
- Review file upload validation
- Check for command injection risks
- Verify data type validation
- Review input length restrictions

Data Protection
- Verify encryption for sensitive data at rest
- Check encryption for data in transit (TLS/SSL)
- Review handling of secrets and credentials
- Assess data masking in logs
- Check for exposed API keys or tokens
- Review database connection security
- Verify secure communication channels

Common Vulnerability Patterns
- Check for hardcoded credentials
- Review XML/JSON parsing security
- Assess deserialization security
- Check for CSRF protection
- Review CORS configuration
- Assess rate limiting implementation
- Check for information disclosure

Third-Party Dependencies
- Review dependency versions for known CVEs
- Check for outdated libraries
- Assess licence compliance
- Review dependency chain security
- Check for supply chain risks
- Verify dependency integrity checks
- Document security advisories

Error Handling
- Verify no sensitive info in error messages
- Check for proper exception handling
- Review logging of security events
- Assess error response consistency
- Check for information leakage
- Verify secure failure modes
- Review debugging code removal

Security Headers & Configuration
- Verify security headers implementation
- Check Content Security Policy
- Review HSTS configuration
- Assess X-Frame-Options settings
- Check for secure cookie flags
- Review CORS policy
- Verify security.txt presence

Deliverables:
- Security vulnerability report
- Risk-prioritised findings
- Remediation recommendations
- Secure coding guidance
- Reference to OWASP guidelines', 1);

END $$;