# Security Policy — VigilSense

VigilSense is a Perimeter Intrusion Detection System (PIDS) atmospheric correlation and sensor calibration intelligence platform. Because perimeter security systems protect critical physical infrastructure (refineries, data centers, maritime terminals, border checkpoints), security, integrity, and tamper-resistance are paramount.


## 1. Supported Versions

Security updates and patches are actively maintained for the following versions:

| Version | Supported | Release Date | Status |
| :--- | :--- | :--- | :--- |
| **1.0.x** | :white_check_mark: Yes | September 2026 | Active / Current Baseline |
| **< 1.0.0** | :x: No | Pre-release | Unsupported |


## 2. Reporting a Vulnerability

We take all security vulnerabilities seriously. If you discover or suspect a security vulnerability in VigilSense, please do **NOT** open a public issue on GitHub.

Instead, please report it via one of our confidential channels:

- **Email**: `security@vigilsense.io`
- **PGP Fingerprint**: `4A8F C321 E90B 12D4 77F8 B910 882E 55C1` (available upon request)
- **Response SLA**:
  - Initial acknowledgment: within **24 hours**
  - Triage and severity assessment: within **72 hours**
  - Patch release / advisory: within **14 calendar days**

Please include the following in your report:
1. Description of the vulnerability and attack vector.
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. Impact assessment (e.g., unauthorized parameter alteration, sensor blinding, denial of service).
4. Suggested remediation or patch, if known.


## 3. Perimeter Intrusion Detection Threat Model

PIDS platforms are targeted by specialized physical and cyber-physical attack vectors. VigilSense implements multi-layered defensive controls against the following threats:

### 3.1 Sensor Blinding & Defeat Attacks
* **Threat**: An adversary attempts to trigger a weather event or manipulate environmental telemetry to force the system to lower sensor sensitivity below detection thresholds, creating an unmonitored blind spot along the perimeter fence.
* **Mitigation**:
  - **Hardware Range Pinning**: Calibration recommendation values are strictly pinned within the sensor profile's physical bounds (`min_value` and `max_value`) defined in the database.
  - **Operator Confirmation Required**: VigilSense defaults to an **intelligence & recommendation layer**—automated sensor parameter changes require authorized operator review and explicit confirmation.
  - **Audit Logging**: Every calibration proposal and manual modification is immutably logged with timestamp, target sensor, previous value, proposed value, and environmental rationale via Spring AOP `@Auditable`.

### 3.2 Atmospheric Telemetry Spoofing / Replay
* **Threat**: Malicious actors feeding falsified weather data (e.g., simulated severe hurricane wind) to trigger mass de-sensitization.
* **Mitigation**:
  - **Provider Verification**: Outbound HTTP requests to the Open-Meteo API enforce TLS 1.3 encryption and connect timeouts (5s) / read timeouts (10s).
  - **Staleness Bounds**: Telemetry older than 30 minutes is automatically flagged with `stale = true` and `STALE FEED (>30M)` warnings, preventing replay of outdated storm snapshots.
  - **Plausibility Filters**: Extreme meteorological outliers undergo validation checks before rule evaluation.

### 3.3 Perimeter Zoning & Geospatial Integrity
* **Threat**: Tampering with facility coordinates or spoofing boundary circles to skew localized weather retrieval.
* **Mitigation**:
  - Strict input validation via `jakarta.validation` on latitude (`-90.0` to `90.0`) and longitude (`-180.0` to `180.0`).
  - Map presentation uses trusted OpenStreetMap tile servers with zero third-party commercial keys or tracking scripts.
  - Visual verification with continuous multi-tier perimeter zones (800m outer detection, 400m exclusion, 150m core zone) directly in the console.


## 4. Software Security Controls

### 4.1 Authentication & Authorization
- API endpoints are structured under `/api/v1/*` with role-based access readiness (`OPERATOR`, `SECURITY_ADMIN`, `SYSTEM_AUDITOR`).
- Environment variables (`DATABASE_PASSWORD`, `DATABASE_URL`, `SERVER_PORT`) are strictly separated into `.env` and never committed to source control.

### 4.2 Cross-Origin Resource Sharing (CORS)
- CORS origin restriction is strictly enforced in `application.yml` via `vigilsense.cors.allowed-origins`.
- Wildcard `*` origins are prohibited in production profiles.

### 4.3 Database Security
- Parameterized queries and Spring Data JPA / Hibernate prevent SQL injection.
- Database migrations are version-controlled and cryptographically validated via Flyway.
- Database connections pool credentials through HikariCP with SSL connection support (`sslmode=require`).

### 4.4 Automated Dependency Scanning
- Maven and npm dependencies are scanned against the National Vulnerability Database (NVD) and GitHub Advisory Database.
- Strict module imports and TypeScript type safety eliminate prototype pollution and unchecked runtime exceptions.


## 5. Security Checklist for Deployments

When deploying VigilSense into an operational security operations center (SOC):

- [ ] Change default PostgreSQL database passwords in `app/server/.env`.
- [ ] Configure `CORS_ALLOWED_ORIGINS` to match your designated SOC console domain.
- [ ] Ensure Spring Boot is run behind a reverse proxy (e.g., NGINX / Envoy) terminating TLS with valid enterprise certificates.
- [ ] Restrict access to port `8081` to internal network segments and trusted proxy interfaces.
- [ ] Ensure audit logs generated by `LoggingAspect` and `AuditAspect` are forwarded to your centralized SIEM (Splunk, Elastic, or OpenSearch).
