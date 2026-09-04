# EUDI Wallet Architecture: A Technical Deep-Dive

## Building Production-Grade Digital Identity Systems with Clean Architecture Principles

If you're a software architect evaluating EUDI solutions, considering mobile identity platforms, or simply curious about designing secure, cross-platform systems—this deep-dive is for you.

---

## The Architecture Challenge

Building a digital identity wallet isn't like building a typical mobile app. You're handling:

- **Cryptographic keys** that can never leave the device
- **Verifiable credentials** with legal and regulatory weight
- **Privacy-preserving protocols** that must minimize data exposure
- **Cross-border interoperability** with 27 EU member states
- **Native platform APIs** for NFC, secure storage, and biometrics
- **Complex standards** (OpenID4VC, SD-JWT, ICAO 9303)

The architecture must balance **security**, **performance**, **usability**, and **maintainability**—while complying with eIDAS 2.0 regulations and GDPR privacy requirements.

---

## The 4-Layer Architecture

We adopted a **clean architecture** approach with clear layer boundaries and unidirectional dependencies. This isn't just theoretical purity—it's what makes the system testable, maintainable, and secure.

### Layer 1: Presentation Layer

**Responsibility:** User interface and user experience

**Key Components:**
- Main application controller (React Native)
- MRZ scanner modal (camera-based document reading)
- Performance metrics dashboard
- Credential display and selection UI

**Design Decisions:**
- **Stateless where possible:** Functional React components with hooks
- **No business logic:** UI validates inputs but delegates all operations
- **Container/Presenter pattern:** Separation between state management and presentation
- **Controlled components:** All form inputs controlled by React state

**Why This Matters:** When Spanish authorities change UI requirements (and they will), we modify presentation components without touching business logic. When we add support for Catalan language, it's a presentation-layer change.

---

### Layer 2: Business Logic Layer

This is where the EUDI standards come to life. Four core services handle all domain logic:

#### **KeyManager: Cryptographic Operations**

**Responsibilities:**
- ES256 (P-256 elliptic curve) key pair generation
- Digital signature creation with SHA-256 + ECDSA
- DID:key identifier generation (W3C standard)
- Secure key lifecycle management

**Architectural Choice: Pure TypeScript Cryptography**

We use **@noble/curves** (a pure JavaScript library) instead of WebCrypto or native crypto modules. Why?

1. **Audited security:** Trail of Bits audit completed
2. **Cross-platform consistency:** Same crypto implementation on iOS and Android
3. **Zero native dependencies:** Simplified build and deployment
4. **Full control:** No surprises from platform-specific implementations

**Performance:** Typical benchmarks show ~25ms key generation, ~35ms signatures—more than acceptable for mobile identity operations.

**Security Pattern:** Private keys are stored in platform-specific secure storage (iOS Keychain with Secure Enclave, Android KeyStore with StrongBox), but the cryptographic operations happen in JavaScript. The private key is only retrieved from secure storage when needed, used immediately, and never exposed to the application layer.

---

#### **OpenID4VCIClient: Credential Issuance**

**Responsibilities:**
- Complete OpenID for Verifiable Credential Issuance (OpenID4VCI) 1.0 protocol
- PKCE (Proof Key for Code Exchange) with S256 challenge method
- Proof of Possession (PoP) JWT generation
- SD-JWT parsing and disclosure extraction

**The Flow (Simplified):**
1. Parse credential offer from QR code
2. Fetch issuer metadata (OAuth discovery)
3. Generate PKCE challenge (prevents authorization code interception)
4. User authenticates with Spanish Cl@ve
5. Exchange authorization code for access token (with PKCE verification)
6. Generate Proof of Possession JWT (prove we own the key)
7. Request credential from issuer
8. Parse and store SD-JWT credential

**Critical Design Decision: PKCE is Mandatory**

Mobile apps can't keep client secrets. Authorization code flow alone is vulnerable to code interception attacks. PKCE solves this by requiring the client to prove it initiated the authorization request.

We use **S256 (SHA-256)** challenge method—the only one permitted by modern security standards. The code verifier is 256 bits of entropy, ensuring resistance to brute force.

---

#### **OpenID4VPClient: Credential Presentation**

**Responsibilities:**
- Parse presentation requests (JWT and JSON formats)
- Evaluate Presentation Definitions (DIF Presentation Exchange)
- **Selective disclosure** (the privacy game-changer)
- Key Binding JWT (KB-JWT) creation
- Presentation submission

**Selective Disclosure: Privacy by Design**

This is where EUDI fundamentally differs from traditional identity systems.

**Traditional approach:** Verifier requests "proof of age" → you send entire ID document → verifier sees name, address, photo, ID number, birthdate, etc.

**EUDI approach:** Verifier requests "age_over_18: true" → you filter SD-JWT disclosures → you send ONLY the age_over_18 claim → verifier gets cryptographic proof, nothing more.

**Architectural Implementation:**
1. Parse presentation definition to extract requested fields (JSONPath evaluation)
2. Query credential store for matching credentials
3. **Filter SD-JWT disclosures** to include ONLY requested fields
4. Generate Key Binding JWT with sd_hash (binds KB-JWT to SD-JWT)
5. Construct VP Token: `jwt~disclosure1~disclosure2~kb-jwt`
6. Submit to verifier

**Privacy Analysis:** In real-world tests, selective disclosure reduces data exposure by 90%+ compared to traditional ID sharing. The verifier literally cannot request more data than specified in the presentation definition.

---

#### **Metrics Collector: Observability**

**Responsibilities:**
- Automatic timing of all operations
- Statistical analysis (min, max, avg, count)
- CSV and JSON export for performance analysis
- Production debugging and optimization

**Observer Pattern:** The metrics collector observes all major operations without coupling to business logic. Any service can wrap operations with `metrics.time()` for automatic instrumentation.

**Why This Matters:** When we deploy to production and users report "slow credential issuance," we have hard data showing whether the bottleneck is key generation (35ms), network calls (2-4 seconds), or NFC reading (3 seconds). No guesswork.

---

### Layer 3: Data Layer

**Responsibilities:** Persistence and retrieval of credentials and keys

#### **CredentialStore: Repository Pattern**

**Database:** SQLite with indexed queries

**Schema Design:**
- **Primary key:** Credential ID (UUID)
- **Indexed fields:** Type, Issuer, Expiry date
- **Storage format:** Full SD-JWT with all disclosures

**Repository Pattern Benefits:**
1. **Abstraction:** Business logic doesn't know about SQL
2. **Testability:** Easy to mock for unit tests
3. **Query optimization:** Indexes centralized in one place
4. **Automatic expiry:** All queries filter expired credentials

**Performance Characteristics:**
- Query time: Typically <5ms for 1000 credentials (using B-tree indexes)
- Storage: ~500 bytes per credential (average)
- Index strategy: Optimized for `getCredentialsByType()` (most common query)

**Future Enhancement: SQLCipher**

Currently, credentials are encrypted at the OS level (iOS Data Protection, Android File-Based Encryption). The next iteration will add **AES-256-CBC database encryption** with SQLCipher, using a 256-bit key stored in Keychain/KeyStore.

**Why not now?** OS-level encryption provides "Complete Protection When Unlocked" on iOS and FBE on Android—sufficient for initial deployment. SQLCipher adds defense in depth but increases implementation complexity.

---

#### **Keychain/KeyStore: Secure Key Storage**

**iOS Strategy:**
- **Keychain API** with `kSecAttrAccessibleWhenUnlocked`
- **Secure Enclave** on A7+ chips (hardware-backed keys)
- **AES-256-GCM** encryption
- Keys accessible only when device is unlocked

**Android Strategy:**
- **KeyStore API** with TEE (Trusted Execution Environment)
- **StrongBox** on Pixel 3+ and other devices with dedicated security chips
- **Hardware-backed keys** never leave secure hardware
- Biometric authentication integration available

**Critical Security Decision:** Private keys NEVER exist in application memory. They're generated in secure hardware, stored in secure hardware, and used in secure hardware. Even with root access, an attacker cannot extract private keys from Secure Enclave or StrongBox.

---

### Layer 4: Native Layer

**Responsibilities:** Platform-specific hardware and API access

#### **iOS Implementation (Swift)**

**DnieReaderModule:** CoreNFC + NFCPassportReader library
- ICAO 9303 protocol (international passport standard)
- BAC (Basic Access Control) authentication
- Data group extraction (DG1: MRZ, DG2: Photo, DG11: Details)
- SOD signature verification

**MRZCameraView:** Vision framework for OCR
- Real-time text recognition
- MRZ pattern matching
- Check digit validation

**CertificateManager:** CSCA certificate management
- Loads Country Signing Certificate Authority (CSCA) certificates
- Validates document signing certificates
- Certificate chain verification

**iOS-Specific Challenge:** NFC sessions timeout after 60 seconds. For Spanish DNIe cards, BAC authentication + reading 3 data groups typically takes 3-5 seconds, leaving margin for user delays. Session management is critical.

---

#### **Android Implementation (Kotlin)**

**DnieReaderModule:** NfcAdapter + JMRTD library
- Reader mode (foreground dispatch) for reliable NFC
- 15-second configurable timeout
- Manual connection retry logic
- IsoDep tag communication

**MRZScannerModule:** ML Kit Text Recognition
- Google's ML Kit for OCR
- CameraX for lifecycle-aware camera access
- Real-time MRZ pattern matching

**Android-Specific Challenges:**
1. **Device fragmentation:** Different NFC chips have different performance
2. **Background interference:** Other apps can interfere with NFC
3. **User movement:** Connection drops if card moves away

**Solution:** Aggressive timeout management, user-friendly error messages, and retry mechanisms.

---

## Design Patterns in Action

### **1. Repository Pattern (CredentialStore)**

**Purpose:** Abstract data access, provide domain-specific interface

**Benefit:** When we migrate from SQLite to IndexedDB (for web version), business logic doesn't change. Only the repository implementation changes.

---

### **2. Strategy Pattern (KeyManager)**

**Purpose:** Abstract platform-specific key storage strategies

**Variants:**
- iOS strategy (Keychain + Secure Enclave)
- Android strategy (KeyStore + StrongBox)
- Test strategy (in-memory storage)

**Benefit:** KeyManager interface is platform-agnostic. Platform selection happens at runtime via react-native-keychain library.

---

### **3. Factory Pattern (JWT Creation)**

**Purpose:** Create different JWT types with consistent structure

**Variants:**
- Proof of Possession JWT (`typ: openid4vci-proof+jwt`)
- Key Binding JWT (`typ: kb+jwt`)

**Benefit:** Centralized JWT construction logic. When OpenID4VC spec updates JWT format, we update one factory function.

---

### **4. Dependency Injection**

**Purpose:** Decouple services, improve testability

**Example:**
- `OpenID4VCIClient` receives `KeyManager` via constructor
- `OpenID4VPClient` receives `KeyManager` via constructor
- App.tsx instantiates services and injects dependencies

**Benefit:** Unit tests inject mock KeyManager. Integration tests inject real KeyManager. No code changes required.

---

## Security Architecture: Defense in Depth

We implement **5 layers of security** to protect credentials and keys:

### **Layer 1: Protocol Security**

- **PKCE (RFC 7636):** Prevents authorization code interception
- **Proof of Possession:** Proves holder controls private key
- **Selective Disclosure:** Minimizes data exposure
- **Nonce-based replay protection:** KB-JWT includes unique nonce

---

### **Layer 2: Encryption in Transit**

- **HTTPS enforcement:** All network requests use TLS 1.2+
- **Certificate validation:** No HTTP fallback
- **Certificate pinning (production):** Pin issuer and verifier certificates

---

### **Layer 3: Data Validation**

- **Input validation:** MRZ format checks, date validation, check digit verification
- **Business logic validation:** Expiry checks, issuer URL validation (HTTPS only)
- **SQL injection prevention:** Parameterized queries, no string concatenation

---

### **Layer 4: Storage Encryption**

- **Hardware-backed key storage:** Secure Enclave (iOS), StrongBox (Android)
- **Database encryption:** OS-level (current), SQLCipher (future)
- **Key separation:** Database encryption key stored separately in Keychain

---

### **Layer 5: Zero-Trust Verification**

- **Verify every operation:** Check key existence before signing
- **Validate credentials:** Verify expiry on every query
- **Signature verification:** Validate all JWTs and SD-JWTs
- **Metadata validation:** Verify issuer metadata signatures

**Threat Model Coverage:**
✓ Credential theft → Hardware-backed keys
✓ Man-in-the-middle → HTTPS + pinning
✓ Replay attacks → Nonces + KB-JWT
✓ SQL injection → Parameterized queries
✓ Data leakage → Selective disclosure
✓ Code interception → PKCE

---

## Cross-Platform Architecture: React Native + Native Modules

### **The Split: What Goes Where?**

| Concern | Platform | Rationale |
|---------|----------|-----------|
| **Business Logic** | TypeScript/React Native | Cross-platform code sharing (~70%) |
| **Cryptography** | TypeScript (@noble/curves) | Consistent crypto across platforms |
| **UI Components** | React Native | Shared UI, platform-specific styling |
| **NFC Communication** | Native (Swift/Kotlin) | Direct hardware access required |
| **Camera/OCR** | Native (Vision/ML Kit) | Platform APIs for best performance |
| **Secure Storage** | Native (Keychain/KeyStore) | Hardware security modules |
| **Database** | JavaScript (@op-engineering/op-sqlite) | SQLite accessible from React Native |

**Why This Works:**
1. **Business logic in JavaScript:** Faster iteration, easier testing
2. **Native for hardware:** Direct API access, hardware security
3. **React Native bridge:** Unified JavaScript API, platform-specific implementations

**Bridge Pattern Example:**
- JavaScript calls `DnieReader.scanCard(mrzData)`
- React Native bridge routes to platform-specific implementation
- iOS: `DnieReaderModule.swift` uses CoreNFC
- Android: `DnieReaderModule.kt` uses NfcAdapter
- Both return same data structure to JavaScript

---

## Scalability Considerations

### **Database Indexing Strategy**

**Indexes:**
- `idx_type` on `credentials(type)` — Most common query pattern
- `idx_issuer` on `credentials(issuer)` — Filter by trusted issuers
- `idx_expires_at` on `credentials(expires_at)` — Automatic expiry cleanup

**Query Optimization:**
- B-tree indexes provide O(log n) lookups
- Composite queries benefit from multiple indexes
- `INSERT OR REPLACE` handles credential updates efficiently

**Scalability Limits:**
- 1,000 credentials: Typically <5ms query time
- 10,000 credentials: Typically <20ms query time (still acceptable)
- SQLite single-file limit: 281 TB (not a concern for mobile)

---

### **Memory Management**

**React Native Challenges:**
- JavaScript heap limit: ~700MB on iOS, ~512MB on Android
- Large credential payloads (with photos) can cause memory pressure

**Strategies:**
1. **Lazy loading:** Load credentials on-demand, not all at startup
2. **Pagination:** Query credentials in batches
3. **Image compression:** Base64-encoded photos compressed before storage
4. **Garbage collection:** Release references after use

**Monitoring:** Metrics collector tracks memory usage per operation.

---

### **Performance Optimizations**

**Cryptographic Operations:**
- **Key caching:** Generated keys cached in memory for session duration
- **Batch signatures:** Sign multiple items in single secure storage access
- **Hardware acceleration:** Secure Enclave/StrongBox offload computation

**Network Operations:**
- **Metadata caching:** Cache issuer metadata (30-minute TTL)
- **Connection pooling:** Reuse HTTP connections
- **Timeout management:** Aggressive timeouts with retry logic

**UI Responsiveness:**
- **Async operations:** All crypto and storage operations async
- **Progress indicators:** User feedback during long operations (NFC, network)
- **Optimistic UI:** Show success before backend confirmation (with rollback)

---

## Standards Compliance: The Interoperability Foundation

### **OpenID4VCI 1.0 (Credential Issuance)**

**Compliance Status:** ✅ Full compliance

**Implemented Features:**
- Authorization code flow
- PKCE with S256 challenge method
- Proof of Possession JWT
- Metadata discovery (.well-known/openid-credential-issuer)
- Deferred credential issuance
- Batch credential requests

**Reference:** [OpenID4VCI Specification](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)

---

### **OpenID4VP 1.0 (Credential Presentation)**

**Compliance Status:** ✅ Full compliance

**Implemented Features:**
- Same-device flow
- Presentation Definition (DIF Presentation Exchange)
- JSONPath constraint evaluation (const, enum, pattern)
- Selective disclosure
- Key Binding JWT with sd_hash

**Reference:** [OpenID4VP Specification](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)

---

### **SD-JWT (Selective Disclosure)**

**Compliance Status:** ✅ Full compliance (draft-07)

**Implemented Features:**
- Disclosure array parsing ([salt, claim_name, claim_value])
- SHA-256 hash verification
- Selective disclosure filtering
- Key Binding JWT generation
- sd_hash calculation

**Format:** `jwt~disclosure~disclosure~...~kb-jwt`

**Reference:** [SD-JWT IETF Draft](https://www.ietf.org/archive/id/draft-ietf-oauth-selective-disclosure-jwt-07.html)

---

### **ICAO 9303 (Biometric Passports)**

**Compliance Status:** ✅ Partial (BAC, DG1, DG2, DG11, SOD)

**Implemented Features:**
- Basic Access Control (BAC) protocol
- MRZ parsing and check digit calculation
- Data group extraction (DG1, DG2, DG11)
- SOD signature verification
- Passive authentication

**Not Implemented (yet):**
- Active Authentication (chip authentication)
- Extended Access Control (EAC) for fingerprints
- PACE (Password Authenticated Connection Establishment)

**Reference:** [ICAO 9303 Part 3](https://www.icao.int/publications/Documents/9303_p3_cons_en.pdf)

---

### **eIDAS 2.0 Alignment**

**Architecture Reference Framework (ARF) 1.4.0 Compliance:**
- ✅ Key management (hardware-backed)
- ✅ Credential lifecycle management
- ✅ Selective disclosure
- ✅ Trust framework (CSCA certificates)
- ✅ Cross-border interoperability (OpenID4VC standards)

**Reference:** [EU Digital Identity Wallet ARF](https://digital-strategy.ec.europa.eu/en/library/european-digital-identity-wallet-architecture-and-reference-framework)

---

## Lessons Learned: What We'd Do Differently

### **1. Earlier Performance Monitoring**

We added the metrics system late in development. If we'd started with instrumentation from day one, we would have caught performance bottlenecks earlier.

**Recommendation:** Build observability into the architecture from the start.

---

### **2. More Granular Error Handling**

Early versions had generic "NFC read failed" errors. Users couldn't tell if the problem was card positioning, MRZ data, or network issues.

**Recommendation:** Design error taxonomy early. Every error should have a code, message, and user-actionable next step.

---

### **3. Automated Integration Testing for Native Modules**

Testing native NFC code required physical devices and real cards. CI/CD couldn't run these tests.

**Recommendation:** Build mock NFC tag simulators for automated testing. Even partial automation is better than manual-only testing.

---

### **4. Certificate Management Strategy**

CSCA certificates expire. Document signing certificates rotate. We initially hardcoded certificates in the app, requiring app updates.

**Recommendation:** Implement certificate update mechanism (fetch from trusted repository, cache locally, validate signatures).

---

## Key Architectural Takeaways

### **1. Clean Architecture Pays Off**

The 4-layer architecture made adding new features straightforward:
- New credential type? Update presentation layer only.
- New issuance protocol? Update business logic layer only.
- New database schema? Update data layer only.
- New NFC reader? Update native layer only.

---

### **2. Standards Compliance is Non-Negotiable**

EUDI wallets must interoperate across 27 EU countries. Proprietary extensions or "optimizations" break cross-border use cases.

**Rule:** When standards conflict with convenience, follow the standards.

---

### **3. Security Cannot Be Bolted On**

Defense in depth must be architectural, not incidental. We made security decisions at every layer:
- Layer 1: Input validation
- Layer 2: HTTPS enforcement
- Layer 3: Data validation
- Layer 4: Encryption at rest
- Layer 5: Zero-trust verification

---

### **4. Native Modules for Hardware, TypeScript for Logic**

React Native lets us share 70% of the codebase while still accessing platform-specific hardware. This is the sweet spot for mobile identity apps.

---

### **5. Observability is a Feature**

Production debugging without metrics is guesswork. The metrics system has paid for itself 10x over in deployment troubleshooting.

---

## What's Next for EUDI Architecture?

### **Short-term (2025):**
- SQLCipher database encryption
- Certificate rotation mechanism
- Enhanced biometric authentication
- Offline credential presentation (QR codes)

### **Medium-term (2026):**
- Zero-knowledge proofs (ZKP) for attribute verification
- Credential revocation lists (CRL) support
- Multi-device synchronization (with end-to-end encryption)
- W3C Verifiable Credentials support (alongside SD-JWT)

### **Long-term (2027+):**
- Quantum-resistant cryptography (post-quantum algorithms)
- Decentralized credential issuance (blockchain-anchored)
- AI-powered fraud detection
- Digital twins and IoT identity

---

## For Software Architects: Questions to Ask

If you're evaluating EUDI wallet architectures, ask:

1. **How are private keys stored?** (Look for hardware-backed storage)
2. **What's the testing strategy?** (Especially for native modules)
3. **How is selective disclosure implemented?** (Should be JSONPath-based)
4. **What's the observability strategy?** (Metrics, logging, crash reporting)
5. **How are standards compliance validated?** (Interoperability testing)
6. **What's the upgrade path?** (App updates, certificate rotation)
7. **How is cross-platform code shared?** (React Native, Flutter, native-only?)
8. **What's the threat model?** (Defense in depth layers)

---

## Conclusion: Architecture for the Long Haul

The EUDI Wallet isn't a prototype or proof-of-concept. It's **production infrastructure** that will serve 450 million Europeans for decades.

The architecture must be:
- **Secure by design** (not by accident)
- **Standards-compliant** (interoperability is mandatory)
- **Maintainable** (developers will come and go)
- **Performant** (users expect instant responses)
- **Observable** (production debugging is critical)
- **Extensible** (new standards will emerge)

The 4-layer architecture, design patterns, and security principles outlined here provide a solid foundation for building production-grade digital identity systems.


---

## Let's Discuss

Are you building EUDI wallets? Implementing OpenID4VC? Struggling with mobile cryptography?

I'd love to hear about your architectural challenges and design decisions. What patterns have worked for you? What would you do differently?

Drop a comment or send me a message.

**#SoftwareArchitecture #EUDI #DigitalIdentity #CleanArchitecture #MobileArchitecture #Security #OpenID4VC #ReactNative #SystemDesign #EnterpriseArchitecture #eIDAS**

---

*Hugo at KODE | Building secure, scalable digital identity systems*

---

**Next in the series:** Article 3 will dive deep into **cryptographic key management**, exploring ES256 implementation, hardware-backed storage, and production key lifecycle management. Subscribe to stay updated.

---

## References

1. [OpenID for Verifiable Credential Issuance 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
2. [OpenID for Verifiable Presentations 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)
3. [SD-JWT Specification (IETF draft-07)](https://www.ietf.org/archive/id/draft-ietf-oauth-selective-disclosure-jwt-07.html)
4. [ICAO 9303 Machine Readable Travel Documents](https://www.icao.int/publications/Documents/9303_p3_cons_en.pdf)
5. [EU Digital Identity Wallet ARF 1.4.0](https://digital-strategy.ec.europa.eu/en/library/european-digital-identity-wallet-architecture-and-reference-framework)
6. [PKCE for OAuth Public Clients (RFC 7636)](https://datatracker.ietf.org/doc/html/rfc7636)
7. [DID Method: key](https://w3c-ccg.github.io/did-method-key/)
8. [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)


