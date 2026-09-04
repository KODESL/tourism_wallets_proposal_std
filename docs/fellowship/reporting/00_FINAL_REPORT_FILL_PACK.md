# StandICT.eu 2029 — Final report fill pack

Fellowship **2029-01-1530** (contract also writes 2029-09-1530 — use **2029-01-1530**, as on D1.1–D2.2).

**Project:** Standardizing Non-Custodial Wallet Infrastructure for Tourism  
**Fellow:** Hugo Perez · KODE DE HUGO A PEREZ SOLORZANO S.L. (Spain)  
**Type:** Long Term · up to **€10,000** · Open Call 1  
**Submit only on Trust-Grants.** This Word template is a working copy.

Workplan in the deliverables: Phase 1 months 1–3 (analysis) · Phase 2 months 4–6 (contributions + reference implementation). D1.1–D2.2 are dated **May 2026 (mid-term)**. Formal WG submission and the OSS demo were still open then; that is the delay to report honestly.

---

## 0. What is done vs still open

| Planned | Status | Evidence |
|---|---|---|
| D1.1 State of the art & 14 gaps | **Done** (May 2026, v1.0 Final) | `Tourism_Wallets_SoTA_Gaps_D1.1.docx` |
| D1.2 20 requirements + SDO packages | **Done** (May 2026, v1.0 Final) | `Tourism_Wallets_Requirements_D1.2.docx` |
| D2.1 Six draft contributions | **Drafted, not formally submitted** | `Tourism_Wallets_Draft_Contributions_D2.1.docx` |
| D2.2 Interoperability concepts | **Done** (May 2026); OSS “in progress” | `Tourism_Wallets_Interoperability_Concepts_D2.2.docx` |
| Open-source reference implementation | **In progress** (not finished in D2.2) | D2.2 §9 |
| Present / inform a WG/TC of StandICT funding | **Not yet** (UNE email drafted, not sent) | — |
| Join UNE CTN 71/SC 307 → ISO/TC 307, CEN JTC 19 | **Not yet** | — |
| Join ETSI ISG PDL / W3C CCG | **Not yet** | — |
| Mentorship / Academy | **Not yet** | — |

**Recommended 2.4 choice:** *Some of the actions outlined in the application form have been completed.*  
Do **not** pick “all completed”. Avoid “delayed” as the only box if you can: the contract can reduce payment for incomplete work. “Some completed” is true and safer; 2.4.1 then states what remains.

---

## 1. Section 1 — Profile

**1.1 Profile up to date?**  
Yes — unless Trust-Grants still shows old affiliation. If anything is wrong, write: organisation legal name **KODE DE HUGO A PEREZ SOLORZANO S.L.**, short name KODE / BOGOWALLET, Tenerife, Spain.

**1.2 Photo**  
Use `hugo-photo-800x800.png` (800×800, cropped from `hugo-id.png`). Check the crop before upload.

**1.3 Dissemination agreement**  
Yes. EU-funded activity must be communicated. D1.1–D2.2 are already marked Public.

---

## 2. Section 2 — Progress (draft answers)

### 2.1 Is WG/TC management aware of StandICT funding?

**No** (until UNE/ETSI/W3C acknowledge in writing).

If you send the UNE email and they reply before you submit the report, switch to **Yes**.

### 2.1.1 How you informed them / what restrained you (600 chars)

> Phase 1 produced D1.1 and D1.2 (May 2026). Phase 2 drafted six contributions (D2.1) and an interoperability architecture (D2.2) aimed at ISO/TC 307 (TS 23516, AWI 7603, JWG 4), W3C VCWG/CCG and ETSI ISG PDL / TC ESI. Formal circulation was held until the drafts were stable. Access to ISO/CEN is via UNE CTN 71/SC 307 (Spanish SME). The application to UNE, with D2.1 (C2, C6) and a request for a guest slot, is ready; StandICT funding is stated in that letter. Until the secretariat confirms, the group has not been formally notified.

*(~590 characters)*

### 2.2.1 Leading to a new or revised standard?

**Both new and revised standard**

- **Revised:** inputs to ISO/TS 23516 (interoperability framework), ISO/AWI 7603 (decentralized identity), ISO 22739 vocabulary revision, ETSI GS PDL 027/033.  
- **New (profiles / notes, not a new TC):** tourism-entitlement credential profile, credential–token binding, offline verification profile, EUDI tourism attestation, data-minimisation profile (D2.1 C1–C6).

### 2.2.2 Key efforts (multi-select)

Tick:

- Drafting documentation (standard proposal or a draft standard)
- Providing comments or technical inputs
- Reporting, liaison and outreach support

Do **not** tick: managing ballots, moderating meetings, chairing a WG — unless that happened.

If they force “Other”: *Preparation of six self-contained draft contributions (D2.1) and a reference architecture (D2.2); UNE application to join CTN 71/SC 307.*

### 2.3 Main impacted standard or working group

Put the **primary** ISO item here (evaluators like one clear home). Mention the others in 2.16 / 2.12.

| Field | Fill |
|---|---|
| **Standard / Working group title** | ISO/TS 23516 Blockchain and distributed ledger technologies — Interoperability framework (ISO/TC 307 WG 7), with related input to ISO/AWI 7603 (decentralized identity) and ISO/IEC JTC 1/SC 27–ISO/TC 307 JWG 4 (security, privacy and identity) |
| **Related landscape report** | D1.1 *State of the Art and Standards Gaps for Non-Custodial Tourism Wallets* (May 2026); mapped to Rolling Plan 2026 Blockchain/DLT, eID/trust services, data interoperability |
| **ICT Rolling plan topic** | Innovation for the Digital Single Market — **Blockchain and Distributed Ledger Technologies** (also eID and trust services 3.1.5; data interoperability 3.1.3) |
| **Publication date** | Leave blank (TS 23516 and AWI 7603 still under development as of May 2026) |
| **Related SDO** | ISO/IEC (also W3C, ETSI) |
| **Is this a standard, a WG or a TC?** | **Working Group** (ISO/TC 307 WG 7 / JWG 4). If the form allows only one: Working Group |
| **Standard number** | ISO/TS 23516; related ISO/AWI 7603 |
| **Latest published version** | Work in progress (May 2026). Published related: ISO 22739 (vocabulary), ISO 23257 (reference architecture) |

Secondary venues (for 2.12 / 2.16): W3C VCWG + CCG; ETSI ISG PDL (GS PDL 027, 033); ETSI TC ESI; EUDI/eIDAS expert group; OpenID Foundation / ISO/IEC 18013.

### 2.4 Status of the activity

**Some of the actions outlined in the application form have been completed.**

### 2.4.1 Elaborate vs milestones / KPIs (1000 chars)

> Phase 1 (analysis) is complete. D1.1 inventories the landscape and 14 gaps (G1–G14), prioritising G1 binding, G2 offline verification, G3 time/venue rights, G8 data minimisation, G10 EUDI attestation. D1.2 specifies 20 normative requirements (TW-F/NF/SP/TL) and SDO submission packages. Phase 2 drafting is complete as discussion texts: D2.1 has six contributions (C1 W3C use cases; C2 ISO/TC 307 interoperability; C3 credential–token binding; C4 offline profile; C5 EUDI tourism attestation; C6 JWG 4 data minimisation). D2.2 defines nine interoperability dimensions, a Tourism Interoperability Profile and the OSS architecture. Not yet done versus the application KPIs: formal submission and progression inside an SDO; presentation to a WG; finished open-source reference implementation (D2.2 §9: in progress). Next: UNE CTN 71/SC 307 membership, circulation of C2/C6, then ISO/CEN nomination and ETSI PDL / W3C CCG input.

*(~980 characters)*

### 2.5 Mentorship / Academy

**No** — unless you register before submitting.  
Register: https://standict.eu/mentorship-programme-registration (mentees). Then you can change to Yes.

### 2.6 Connected to an R&I project?

**No** — unless you want to cite internal KODE/BOGOWALLET work. There is **no Horizon grant number** for BOGOWALLET itself.  
Do **not** list Open Horizons (different programme, not awarded here).  
Camino €50k is a network grant, not a numbered HE GA — skip unless they insist.

### 2.7 Joined a new TC/WG since the fellowship started?

**No** (until UNE/ETSI/W3C accept you).  
After UNE confirms: **Yes** — *UNE CTN 71/SC 307 (mirror of ISO/TC 307 and CEN/CLC/JTC 19); requested GT 1 and GT 4.*

### 2.8 Presented in new events, webinars or publications?

**No** unless you have a talk. D1.1–D2.2 are deliverables, not events.  
If you get a UNE/GT guest slot before the deadline, switch to **Yes** and name the meeting.

### 2.9 Standardisation deliverables produced

Tick:

- Technical Report: Recommendations for new/revised standards
- Technical Report: Development of a new standard *(profiles C1, C4, C5, C6)*
- Technical Report: Common Terminology *(G11 / TW-F-02 / ISO 22739)*
- Technical Report: Other → *Gap analysis (D1.1); requirements specification (D1.2); interoperability concepts (D2.2); six draft contributions (D2.1)*

Do **not** tick Technical Specifications unless an SDO adopted one.

### 2.10 Recommendations for pursuing the work

**Suggest continuation of action**  
**and** **Additional EU experts are needed to support the EU position better**

### 2.10.1 Elaborate (1000 chars)

> Continue: the connective tissue is still missing. W3C VC 2.0, EUDI ARF 2.4.0 and Ethereum token interfaces are mature; tourism still lacks a standard binding between credentials and ledger tokens, an offline gate-verification profile, a data-minimisation profile, and an EUDI-compatible tourism attestation. D2.1 C1–C6 are ready to enter ISO/TC 307 (TS 23516, AWI 7603, JWG 4), W3C CCG/VCWG, ETSI ISG PDL and TC ESI. Continuation should take those drafts from “discussion” to working-group documents, plus the OSS testbed (D2.2). Additional EU experts are needed because tourism is SME-heavy and cross-border: operators, venues, DPAs and wallet implementers must co-define minimal attribute sets (TW-SP-01) and sector-scale issuer/verifier trust (TW-SP-03). Without more EU voices, profiles will be set by large platforms or non-EU wallet ecosystems.

*(~990 characters)*

### 2.11 Medium- to long-term impact, especially EU SMEs (1000 chars)

> Impact is interoperability and lower integration cost for SME-dominated tourism (hotels, attractions, tour operators). Today each operator rebuilds ticketing, loyalty and gate checks in incompatible apps. A tourism-entitlement profile on W3C VC / EUDI / ISO TS 23516 would let an SME issue and verify passes without a 12–18 month wallet build or handing keys to a custodian. Binding credentials to optional ledger tokens (C3) keeps anti-fraud and redemption with GDPR minimisation (C6). Offline verification (C4) works at real gates. For the EU: cross-border reuse of the same entitlement; EUDI Wallet alignment (C5) instead of closed non-European wallets; royalty-free artefacts so SMEs are not vendor-locked. Uptake: operators on the profile, EUDI-compatible attestations, and independent implementations passing D2.2 test vectors.

*(~980 characters)*

### 2.12 Objective evidence / URLs (600 chars)

> Public catalogues used in D1.1 (status as of May 2026): ISO/TC 307 https://www.iso.org/committee/6266604.html ; ISO/TS 23516 (WG 7 interoperability); ISO/AWI 7603; JWG 4. W3C VC 2.0 https://www.w3.org/TR/vc-data-model-2.0/ ; DID 1.1. ETSI ISG PDL https://www.etsi.org/technologies/permissioned-distributed-ledgers (GS PDL 027, 033). EUDI ARF v2.4.0. UNE mirror: CTN 71/SC 307 https://www.une.org/encuentra-tu-norma/comites-tecnicos-de-normalizacion/comite/?c=CTN%2071/SC%20307 . Fellowship artefacts: D1.1, D1.2, D2.1, D2.2 (attached).

*(~590 characters)*

### 2.13 Alumni

**Yes**

### 2.14 Drafts at odds with EU values / obstruction

**No** — unless you observed something specific. Do not invent.

### 2.15 Why colleagues should use StandICT (600 chars)

> StandICT paid for the time SMEs never have: reading ISO/TC 307, W3C VC 2.0 and ETSI PDL against real tourism gates, then writing contributions those groups can actually use. Without the fellowship, KODE could ship a product but not a vendor-neutral gap analysis, 20 requirements and six drafts mapped to TS 23516, AWI 7603, JWG 4, CCG and PDL. The Academy and mentorship (when used) shorten the path into UNE/ISO. If you are an SME with production experience and no secretariat, this is how that experience becomes European standards input instead of remaining locked in one stack.

*(~590 characters)*

### 2.16 Additional items (600 chars)

> Companion targets besides ISO/TS 23516: W3C VCWG/CCG (C1, C3); ETSI ISG PDL GS PDL 027/033 (NFT/SSI, C3); ETSI TC ESI and EUDI ARF (C5); OpenID Foundation and ISO/IEC 18013 (C4 offline). D2.2 proposes a Tourism Interoperability Profile and nine dimensions (issuance, presentation, formats, semantics, trust, status, binding, recovery, cross-border). OSS reference implementation is scoped, not finished. National entry: UNE CTN 71/SC 307 GT 1 (decentralised identity) and GT 4 (trusted asset exchange). Application ID 2029-01-1530.

*(~590 characters)*

### 2.17 Attachments (max 5 MB each)

Upload, in this order:

1. `Tourism_Wallets_SoTA_Gaps_D1.1.docx`  
2. `Tourism_Wallets_Requirements_D1.2.docx`  
3. `Tourism_Wallets_Draft_Contributions_D2.1.docx`  
4. `Tourism_Wallets_Interoperability_Concepts_D2.2.docx`  
5. `hugo-photo-800x800.png` only if the photo field does not already take it  

Skip contracts (internal). Skip CV unless the platform asks again. If the 5 MB limit blocks D1.1, export that one to PDF.

---

## 3. One-line facts for dropdowns

- **Main topic:** Innovation for the Digital Single Market — Blockchain and DLT  
- **Target SSOs (application):** W3C/ERCIM; ISO/IEC (ISO/TC 307); ETSI  
- **Added in D1.1:** ETSI ISG PDL (not in original application)  
- **Rolling Plan 2026:** Blockchain/DLT; 3.1.5 eID/trust; 3.1.3 data interoperability; 3.0.2 cybersecurity; 3.0.1 data economy; 3.2.10 ePrivacy  
- **Priority gaps:** G1, G2, G3, G8, G10  
- **Priority requirements:** TW-F-03, TW-F-04, TW-NF-01, TW-SP-01, TW-TL-04  

---

## 4. You must confirm before submit

| # | Item | Why |
|---|---|---|
| A | Send UNE email + keep the reply | Turns 2.1 and 2.7/2.8 from No toward Yes |
| B | Photo crop OK? | 800×800 from hugo-id.png |
| C | Mentorship Yes/No | 2.5 |
| D | Any talk/webinar since start? | 2.8 |
| E | Any Horizon GA to cite? | 2.6 |
| F | Prefer 2.4 = “some completed” (recommended) vs “delayed” | Payment risk |
| G | Legal name spelling on Trust-Grants | KODE DE HUGO A PEREZ SOLORZANO S.L. |

---

## 5. Suggested sequence this week

1. Send UNE email (CV + D2.1).  
2. Register StandICT mentorship as mentee.  
3. Paste Section 2 answers into Trust-Grants.  
4. Upload D1.1, D1.2, D2.1, D2.2 + photo.  
5. If UNE replies, edit 2.1 / 2.1.1 / 2.7 / 2.8 before hitting submit.
