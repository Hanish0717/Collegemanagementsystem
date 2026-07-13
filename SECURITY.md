# SECURITY Guidelines

This document outlines the security checklist and defensive practices utilized in this project to prevent vulnerabilities and protect resources.

## 🔐 Security Checklist

* **Authentication**: Enforce JWT, OAuth, or session-based verification on all authenticated routes.
* **Authorization**: Implement robust Role-Based Access Control (RBAC) to restrict resource access by user privilege.
* **Password Hashing**: Secure all user passwords using strong algorithms like bcrypt or Argon2 before storage.
* **SQL Injection Prevention**: Always use parameterized queries or trusted ORMs/query builders to prevent SQL injections.
* **XSS Prevention**: Sanitize and escape all user input before rendering it on the client side.
* **CSRF Protection**: Guard sensitive state-modifying requests against cross-site request forgery.
* **Input Validation & Sanitization**: Validate payload structures and sanitize inputs on every endpoint.
* **Rate Limiting**: Protect endpoints against brute force and denial of service attacks.
* **CORS Configuration**: Restrict cross-origin resource sharing to trusted domains.
* **Secure HTTP Headers**: Serve content with secure headers (e.g. CSP, HSTS, X-Frame-Options).
* **Environment Variables**: Configure the system via `.env` files and keep sensitive values environment-specific.
* **No Hardcoded Secrets**: Ensure keys, database passwords, and client secrets are never committed to version control.
* **Secure File Uploads**: Validate file sizes, headers, and extensions, and store them securely.
* **Logging & Monitoring**: Log events safely without leaking sensitive payload data.
* **Dependency Vulnerability Checks**: Regularly run security audits on node modules and libraries.
* **HTTPS/TLS**: Encrypt all traffic in transit.

---

## 🛡️ Security Bypass Prevention

To defend against security control bypasses, always apply the following defensive practices:

1. **Continuous Validation**: Prevent authentication bypass by validating tokens and sessions on every protected request.
2. **Server-Side Authorization**: Prevent authorization bypass by checking permissions on the **server**, not just on the client/frontend.
3. **Pervasive Middleware Protection**: Prevent API endpoint bypass by guarding every sensitive route with appropriate middleware.
4. **Redundant Validation**: Prevent client-side validation bypass by validating all inputs again on the server.
5. **Insecure Direct Object Reference (IDOR) Protection**: Prevent direct object access by verifying that the requesting user owns or has explicit permission to access the target resource.
6. **Consistent Checks**: Prevent privilege escalation by enforcing role and permission checks uniformly across all controllers.
7. **Safe Error Handling**: Use secure error handling practices to ensure database details, stack traces, and internal structure are not leaked in server responses.
8. **OWASP Alignment**: Regularly audit the application code against the **OWASP Top 10** checklist.

---

## 🤖 Secure Development with AI (Vibe Coding)

When collaborating with AI coding assistants, form healthy habits to maintain security posture:

* **SQL Injection**: Always use parameterized queries or prepared statements. Never concatenate user input into SQL queries.
* **Authentication**: Hash passwords (e.g. bcrypt/Argon2), don't store plain text passwords.
* **Authorization**: Check what each user is allowed to access. Don't rely only on the frontend.
* **Authentication Bypass**: Validate sessions/JWTs correctly. Never trust client-side checks.
* **Input Validation**: Validate and sanitize all user input on the server.
* **XSS (Cross-Site Scripting)**: Escape user-generated content before displaying it.
* **CSRF (Cross-Site Request Forgery)**: Use CSRF protection where applicable, especially with cookie-based authentication.
* **File Upload Security**: Restrict file types, size, and scan uploads if needed.
* **API Security**: Rate limiting, authentication, and proper error handling. Don't expose secrets or API keys.
* **Secrets Management**: Keep API keys, database passwords, and tokens in environment variables, not in your code.
* **HTTPS**: Encrypt data in transit.
* **Logging & Monitoring**: Log errors and suspicious activity without exposing sensitive data.
* **Dependency Security**: Keep libraries updated and fix known vulnerabilities.

### 💡 Practice Prompts for AI Review
When building features, ask your AI assistant to:
* *"Review this code for security vulnerabilities."*
* *"Check this API for OWASP Top 10 issues."*
* *"Suggest fixes for authentication and authorization."*
