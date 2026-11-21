# Credentials, Permissions & Legal Launch Checklist

Before opening **Nyamora** to production public traffic, the operator must obtain documented legal advice, rights agreements, and configure production credentials as outlined below:

---

## 1. Legal & Regulatory Approvals

- [ ] **Jurisdiction-Specific Age-Assurance**:
  - Review applicable age-verification laws for target operating countries (e.g. US state age-verification statutes, UK Online Safety Act, EU AVMSD).
  - Determine whether a self-attestation clickthrough modal suffices or if a certified zero-knowledge age verification provider (e.g., AgeID, Yoti) is required.
  - Establish a policy minimizing identity data retention.
- [ ] **Content Eligibility & Zero Tolerance**:
  - Verify that 100% of indexed records strictly exclude minors, minor-coded characters, or ambiguous-age subjects.
  - Establish documented SOPs for emergency quarantine and takedown within 24 hours of receiving a complaint.
- [ ] **Designated DMCA / Copyright Agent**:
  - File formal designation with the relevant copyright office (e.g. US Copyright Office DMCA agent directory).
  - Publish designated contact email in the website footer.

---

## 2. Catalogue & Asset Rights Clearances

- [ ] **Indie Creator & Circle Licenses**:
  - Document signed written licensing agreements for every work made available via the integrated reader (`availabilityMode: integrated_licensed`).
  - Verify territory permissions (e.g., Worldwide vs. Japan-only).
- [ ] **Partner Affiliate / Store Agreements**:
  - If linking out to DLsite, FANZA, or official indie distribution circles, review and sign official partner terms.
  - Verify deep-linking permissions and brand usage rules.
- [ ] **Reddit Outbound Link Compliance**:
  - Ensure references remain outbound links opening `https://reddit.com/...` directly in a new window.
  - Do not scrape or mirror Reddit user comments without commercial API agreements.

---

## 3. Production Environment Credentials & Provider Configuration

Configure the following secrets in your production deployment platform (Vercel / AWS / Google Cloud Secrets Manager) — **never commit real values to Git**:

| Setting | Variable Name | Purpose |
| :--- | :--- | :--- |
| **Database** | `DATABASE_URL` / `POSTGRES_URL` | PostgreSQL with `pgvector` extension for high-scale vector indexing |
| **Authentication** | `AUTH_SECRET`, `NEXT_PUBLIC_AUTH_URL` | Supabase Auth or Auth0 secret keys |
| **AI LLM API** | `LLM_API_KEY`, `LLM_MODEL` | Google Gemini API key (`gemini-1.5-flash`) or OpenAI key |
| **Embeddings** | `EMBEDDING_API_KEY`, `EMBEDDING_MODEL` | Text embedding model API key (`text-embedding-004`) |
| **Object Storage** | `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ACCESS_KEY`, `OBJECT_STORAGE_SECRET_KEY` | Private S3 / Cloudflare R2 bucket for serving signed short-lived URLs for licensed reader pages |
| **Feature Flags** | `ENABLE_INTEGRATED_READER` | Toggle `true` only after storage and licensing agreements are finalized |
| **Feature Flags** | `ENABLE_REDDIT_API` | Keep `false` unless commercial Reddit Data API agreement is signed |
| **Feature Flags** | `ENABLE_USER_UPLOADS` | Keep `false` per MVP scope |
