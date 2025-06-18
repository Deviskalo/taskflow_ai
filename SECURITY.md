# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security issues seriously and appreciate your efforts to responsibly disclose any vulnerabilities you find.

### How to Report a Security Vulnerability

If you discover a security vulnerability in TaskFlow AI, please follow these steps:

1. **Do not** create a public GitHub issue for security vulnerabilities.
2. Email your findings to [security@taskflow-ai.com](mailto:security@taskflow-ai.com). Please use a descriptive subject line.
3. Include the following details in your report:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - The version of TaskFlow AI where the vulnerability was found
   - Any potential impact of the vulnerability
   - Your name/handle for credit (if desired)

### Our Commitment

- We will acknowledge receipt of your report within 3 business days
- We will keep you informed about the progress of the fix
- We will credit you for your discovery (unless you prefer to remain anonymous)
- We will not take legal action against you for security research conducted in good faith

### Security Best Practices

### For Users

- Always keep your TaskFlow AI installation up to date
- Use strong, unique passwords for your account
- Enable two-factor authentication (2FA) when available
- Be cautious of phishing attempts
- Never share your API keys or access tokens

### For Developers

- Follow the principle of least privilege
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper CORS policies
- Keep all dependencies up to date
- Use environment variables for sensitive configuration
- Implement rate limiting on authentication endpoints
- Use HTTPS for all communications
- Set secure flags on cookies
- Implement Content Security Policy (CSP)

### Security Headers

TaskFlow AI implements the following security headers by default:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

### Data Protection

- All sensitive data is encrypted at rest
- Passwords are hashed using bcrypt
- API keys are encrypted before storage
- Regular security audits are performed
- Access logs are maintained and monitored

### Third-Party Dependencies

We regularly update our dependencies to include the latest security patches. You can check for known vulnerabilities using:

```bash
npm audit
```

### Responsible Disclosure Timeline

- **Initial Response**: 3 business days
- **Triage**: 5 business days
- **Fix Development**: 14-30 days (depending on complexity)
- **Public Disclosure**: 14 days after fix is released

### Security Updates

Security updates are released as patch versions. We recommend always running the latest patch version of your major.minor release.

### Legal

This security policy is subject to change at any time. By reporting a security vulnerability, you agree that we may contact you regarding the report.
