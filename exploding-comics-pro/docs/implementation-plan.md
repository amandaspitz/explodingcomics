# Exploding Comics Pro

## Software Design and Implementation Plan

Document status:

- Version: 0.9
- Last updated: 2026-07-02
- Owner: Codex + Amanda
- Delivery model: incremental, milestone-based
- Implementation model: SDD with SOLID-first design
- Scope of this document: backend-first migration from static site to `Express + MySQL`, preserving the current production site until the new base is production-ready

## 1. Executive Summary

Exploding Comics currently runs as a static bilingual comic website whose primary business data is embedded directly in frontend JavaScript arrays. This works for small-scale publishing, but it is not an adequate foundation for:

- professional editorial workflow
- persistent likes
- persistent views
- structured multilingual content
- better text authoring
- administrative tooling
- long-term maintainability

The migration target is a new parallel platform in `D:\explodingcomics\exploding-comics-pro` with:

- Express API
- MySQL persistence
- future Vue frontend
- adapter path for the current frontend
- deterministic publishing and interaction flows

The current production project in `D:\explodingcomics` must remain untouched until the new base is functionally complete and ready for rollout.

## 2. Working Agreement

The following rules govern this migration:

- All implementation for the new architecture happens only inside `D:\explodingcomics\exploding-comics-pro`.
- The current production site is reference-only until the new system is stable.
- Design precedes implementation. Business rules, data ownership, contracts, and boundaries must be defined before feature coding.
- We avoid heuristics in core workflows. Validation, persistence rules, and side effects must be explicit.
- Every milestone must produce a reviewable, testable increment.
- Every work round must update this document with completed work, decisions, and difficulties found.
- Technical debt is not accepted as default. Temporary compromises must be named, isolated, and tracked.

## 3. Design Principles

### 3.1 SDD interpretation

For this project, SDD means:

- feature work starts from documented behavior and constraints
- modules are created from responsibilities, not convenience
- API contracts are defined before client integration
- data model is treated as a first-class design concern
- rollout is designed from day one, not left for the end

### 3.2 SOLID interpretation

- Single Responsibility Principle
  - controllers translate HTTP
  - services execute use cases
  - repositories persist/query state
  - mappers convert between layers
- Open/Closed Principle
  - new behaviors should be added by composing use cases and policies rather than rewriting central modules
- Liskov Substitution Principle
  - repository ports must allow database-backed and test-double implementations interchangeably
- Interface Segregation Principle
  - small contracts for read, write, publish, analytics, and asset concerns
- Dependency Inversion Principle
  - domain and application layers depend on abstractions, not Express, MySQL, or transport details

### 3.3 Additional engineering principles

- deterministic validation
- explicit error modeling
- idempotent interaction endpoints where applicable
- auditability for admin actions
- reproducible local development
- zero production mutation of the old system during migration

## 4. Current State Reference

### 4.1 Functional behavior today

The current production site is a static bilingual comic reader with:

- one main page shell
- theme toggle
- language toggle
- custom issue dropdown
- image carousel logic
- blog text below the comic
- static footer actions and share controls
- static share landing pages generated ahead of time

### 4.2 How content is modeled today

Comic content is stored directly in JavaScript arrays:

- English source: `D:\explodingcomics\js\localEng.js`
- Portuguese source: `D:\explodingcomics\js\localPt.js`

Each comic entry currently mixes content and presentation-facing data:

- `issueNumber`
- `issueTitle`
- `url`
- `text`

This means:

- the frontend is the source of truth
- content updates require code edits
- text formatting is limited
- persistence does not exist

### 4.3 Current repository reference map

| Current path | Current role | Migration relevance |
| --- | --- | --- |
| `D:\explodingcomics\index.html` | static shell | reference for future layout parity and integration adapter |
| `D:\explodingcomics\js\carousel.js` | main UI behavior | reference for current feature parity and API adapter planning |
| `D:\explodingcomics\js\localEng.js` | English content source | source dataset for migration/import |
| `D:\explodingcomics\js\localPt.js` | Portuguese content source | source dataset for migration/import |
| `D:\explodingcomics\assets\comics\eng` | English comic files | source asset inventory |
| `D:\explodingcomics\assets\comics\pt` | Portuguese comic files | source asset inventory |
| `D:\explodingcomics\share` | static share pages | reference for future dynamic share strategy |
| `D:\explodingcomics\assets\share` | share preview images | source share preview inventory |
| `D:\explodingcomics\assets\css\main.css` | site styling | reference only |
| `D:\explodingcomics\dist\bundle.js` | compiled frontend | not a source of truth, only compiled output |

### 4.4 Current technical characteristics

- frontend-only architecture
- bundled with Webpack
- no backend runtime
- no database
- no content service
- no admin workflow
- no persistent counters
- deployment optimized for static hosting

### 4.5 Current pain points

- publishing requires code editing
- content and presentation are coupled
- likes and views cannot be implemented robustly without a backend
- multilingual maintenance duplicates effort
- rich text is not supported
- encoding inconsistencies exist in current content
- no server-side validation or auditability exists

## 5. Product Vision for the New Platform

The new platform should enable:

- structured comic publication
- reuse of the same API by both the current frontend adapter and the future Vue frontend
- separation between comic metadata, translations, images, and interactions
- consistent public URLs for comics and share previews
- operational visibility into usage
- professional editorial evolution without rewriting the stack again

## 6. Scope

### 6.1 In scope for the backend-first migration

- Express API foundation
- MySQL schema
- public read endpoints
- admin content endpoints
- persistent likes
- persistent views
- import path from the current JS arrays
- compatibility path for the current frontend

### 6.2 Explicitly out of scope for the first implementation wave

- public comments
- public user accounts
- recommendation systems
- push notifications
- real-time counters
- full moderation tooling
- a finished admin dashboard UI

### 6.3 Deferred but planned

- Vue reader frontend
- Vue admin frontend
- richer editorial tooling
- smarter share image generation pipeline

## 7. Target Architecture

### 7.1 Chosen migration strategy

We will use a backend-first approach:

1. design the target domain and data model
2. build the API and persistence layer
3. import and normalize existing content
4. adapt the current frontend to the new API in the parallel workspace
5. later replace the old frontend with Vue

Reasoning:

- the real bottleneck is persistence and workflow, not the current visual layer
- a stable API lets the frontend evolve safely later
- this de-risks the project by avoiding simultaneous backend and frontend rewrites

### 7.2 Technology baseline

Primary choices for the new platform:

- Runtime: Node.js 24 LTS
- Backend language: TypeScript
- HTTP framework: Express
- Database: MySQL
- Future frontend: Vue 3

Assumption:

- TypeScript is selected for the API even though the current site is plain JavaScript, because this aligns better with SDD, explicit contracts, and long-term maintainability.

### 7.3 Official references used for this baseline

- Node.js releases page confirms production applications should target LTS releases, and as of 2026-07-02 the latest LTS listed is v24.x.
- Express production guidance recommends `NODE_ENV=production`, proper exception handling, restart strategy, clustering considerations, and proxy-aware deployment setup.
- Vue 3 documentation positions Vue as progressively adoptable and recommends Single-File Components for build-tool-enabled projects.
- MySQL official documentation provides current reference manuals for stable server branches including MySQL 8.4 and 9.x.

### 7.4 Proposed runtime architecture

```text
Browser / Future Vue App / Current Frontend Adapter
                |
                v
          Express REST API
                |
      ------------------------
      |          |           |
      v          v           v
   Domain    Application  Infrastructure
                |
                v
              MySQL
```

### 7.5 Layer boundaries

- Interfaces layer
  - Express routes
  - controllers
  - request validation adapters
  - response mappers
- Application layer
  - use cases
  - orchestration services
  - transaction coordination
- Domain layer
  - entities
  - value objects
  - domain policies
  - domain errors
- Infrastructure layer
  - MySQL repositories
  - database connection management
  - logging implementation
  - environment/config loading
  - clock/id providers

## 8. Proposed Monorepo Structure

Current parallel structure:

```text
exploding-comics-pro/
  README.md
  docs/
    implementation-plan.md
  apps/
    api/
    web/
```

Target structure after Milestone 1 and 2:

```text
exploding-comics-pro/
  README.md
  docs/
    implementation-plan.md
    adrs/
  apps/
    api/
      package.json
      tsconfig.json
      .env.example
      src/
        bootstrap/
        config/
        domain/
          comics/
          interactions/
          shared/
        application/
          comics/
          interactions/
          shared/
        infrastructure/
          database/
          repositories/
          logging/
          http/
        interfaces/
          http/
            controllers/
            routes/
            middleware/
            validators/
            mappers/
      migrations/
      scripts/
      tests/
        unit/
        integration/
        contract/
    web/
      README.md
```

## 9. Domain Model

### 9.1 Core aggregates

#### Comic

Represents the publishable comic unit.

Primary fields:

- id
- issueNumber
- slug
- status
- publishedAt
- createdAt
- updatedAt

Responsibilities:

- hold publication state
- guarantee unique issue number
- guarantee unique slug
- coordinate translation and asset attachment rules

#### ComicTranslation

Localized content for a comic.

Primary fields:

- comicId
- locale
- title
- bodyMarkdown
- excerpt
- seoTitle
- seoDescription

Responsibilities:

- own locale-specific text and metadata
- support rich text authoring
- enforce locale uniqueness per comic

#### ComicAsset

Represents a comic image or related asset.

Primary fields:

- id
- comicId
- locale
- assetType
- path
- mimeType
- width
- height
- sortOrder

Responsibilities:

- store ordered image references
- support per-locale or shared assets
- make rendering order deterministic

#### ComicShareMetadata

Share-specific localized metadata.

Primary fields:

- comicId
- locale
- shareTitle
- shareDescription
- previewImagePath

Responsibilities:

- decouple share previews from frontend markup
- support future dynamic share generation

### 9.2 Interaction aggregates

#### ComicLike

Represents a like action persisted for a comic and a visitor identity.

Primary fields:

- comicId
- visitorId
- createdAt

Primary invariant:

- one active like per comic per visitor

#### ComicView

Represents a view event or deduplicated view marker depending on the chosen storage strategy.

Primary fields:

- comicId
- visitorId
- viewedAt
- viewDateBucket

Primary invariant:

- count policy must be deterministic

### 9.3 Administrative aggregate

#### AdminUser

Represents a restricted internal administrative actor.

Initial assumption:

- no public account system in phase 1
- admin authentication exists only for editorial actions

### 9.4 Enumerations

- `ComicStatus`
  - `draft`
  - `scheduled`
  - `published`
  - `archived`
- `Locale`
  - `eng`
  - `pt`
- `AssetType`
  - `comic_page`
  - `share_preview`
  - `cover`

### 9.5 Business invariants

- issue numbers are unique globally
- slug is unique globally
- locale is unique per comic translation
- asset order is unique per comic, locale, and asset type
- a comic cannot be published without at least one translation and one renderable comic asset
- likes must be unique by `comicId + visitorId`
- view counting policy must be stable and documented
- admin actions must be auditable

## 10. Publishing Workflow Design

### 10.1 Desired editorial flow

1. create comic as draft
2. assign issue number and slug
3. add English and Portuguese translations
4. attach comic images
5. add share metadata
6. validate publishability
7. publish

### 10.2 Publication states

| State | Meaning | Allowed transitions |
| --- | --- | --- |
| `draft` | incomplete or not visible | `scheduled`, `published`, `archived` |
| `scheduled` | complete and waiting for date | `published`, `draft`, `archived` |
| `published` | public | `archived` |
| `archived` | hidden but preserved | `draft` |

### 10.3 Publishability rules

A comic can only become `published` if:

- issue number exists
- slug exists
- at least one comic asset exists
- at least one required translation exists
- share metadata is complete for intended public locales

### 10.4 Translation completeness rule

Initial rule:

- a comic may exist as draft with only one locale
- a comic may only be publicly published when both `eng` and `pt` are complete

This can be relaxed later if the editorial process changes.

## 11. Data Architecture

### 11.1 Database strategy

MySQL will be the system of record for:

- comic metadata
- translations
- assets metadata
- likes
- views
- admin users
- audit history

Files themselves may remain on disk or in object storage later, but the metadata must live in MySQL.

### 11.2 Initial relational model

#### `comics`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `issue_number` | int unique not null | public issue number |
| `slug` | varchar unique not null | stable URL slug |
| `status` | varchar not null | draft, scheduled, published, archived |
| `published_at` | datetime null | publication timestamp |
| `created_at` | datetime not null | creation timestamp |
| `updated_at` | datetime not null | update timestamp |

#### `comic_translations`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `comic_id` | bigint FK | references `comics.id` |
| `locale` | varchar not null | `eng` or `pt` |
| `title` | varchar not null | comic title |
| `body_markdown` | longtext not null | formatted body |
| `excerpt` | text null | short summary |
| `seo_title` | varchar null | optional SEO title |
| `seo_description` | text null | optional SEO description |
| `created_at` | datetime not null | creation timestamp |
| `updated_at` | datetime not null | update timestamp |

Unique index:

- `uq_comic_translation_comic_locale (comic_id, locale)`

#### `comic_assets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `comic_id` | bigint FK | references `comics.id` |
| `locale` | varchar not null | locale-specific or shared strategy later |
| `asset_type` | varchar not null | comic_page, share_preview, cover |
| `path` | varchar not null | logical or physical path |
| `mime_type` | varchar not null | image mime type |
| `width` | int null | optional metadata |
| `height` | int null | optional metadata |
| `sort_order` | int not null | render order |
| `created_at` | datetime not null | creation timestamp |
| `updated_at` | datetime not null | update timestamp |

Unique index:

- `uq_comic_asset_scope (comic_id, locale, asset_type, sort_order)`

#### `comic_share_metadata`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `comic_id` | bigint FK | references `comics.id` |
| `locale` | varchar not null | localized share metadata |
| `share_title` | varchar not null | preview title |
| `share_description` | text not null | preview description |
| `preview_image_path` | varchar not null | image used in OG tags |
| `created_at` | datetime not null | creation timestamp |
| `updated_at` | datetime not null | update timestamp |

Unique index:

- `uq_share_metadata_comic_locale (comic_id, locale)`

#### `comic_likes`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `comic_id` | bigint FK | references `comics.id` |
| `visitor_id` | char(36) not null | stable anonymous visitor identifier |
| `created_at` | datetime not null | creation timestamp |

Unique index:

- `uq_like_comic_visitor (comic_id, visitor_id)`

#### `comic_views`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `comic_id` | bigint FK | references `comics.id` |
| `visitor_id` | char(36) not null | anonymous visitor identifier |
| `view_date_bucket` | date not null | dedup bucket |
| `viewed_at` | datetime not null | event timestamp |

Unique index:

- `uq_view_comic_visitor_day (comic_id, visitor_id, view_date_bucket)`

#### `admin_users`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `email` | varchar unique not null | admin login identifier |
| `password_hash` | varchar not null | secure hash |
| `status` | varchar not null | active, disabled |
| `created_at` | datetime not null | creation timestamp |
| `updated_at` | datetime not null | update timestamp |

#### `audit_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | bigint PK | internal identity |
| `actor_admin_user_id` | bigint FK null | admin actor |
| `action` | varchar not null | semantic action name |
| `entity_type` | varchar not null | comic, translation, asset |
| `entity_id` | bigint not null | target entity |
| `payload_json` | json not null | change detail |
| `created_at` | datetime not null | audit timestamp |

### 11.3 Visitor identity strategy

Initial decision:

- likes and views will not require login
- the system will generate a stable anonymous `visitor_id`
- `visitor_id` is stored client-side
- API validates the supplied format

Rationale:

- low-friction interaction model
- enough identity stability for like/view deduplication
- public usage remains simple

### 11.4 View counting policy

Initial decision:

- count at most one view per comic per visitor per calendar day

Rationale:

- protects counters from simple refresh spam
- remains simple to explain and implement

### 11.5 Migration data normalization requirements

Before import, the current data source must be normalized for:

- encoding repair
- consistent locale codes
- consistent issue numbering
- consistent file extensions and paths
- long-form text cleanup
- share metadata completeness

## 12. API Design

### 12.1 API style

- REST over HTTP
- JSON payloads
- versioned under `/api/v1`
- clear resource naming
- stable route patterns

### 12.2 Response envelope policy

Success shape:

```json
{
  "data": {},
  "meta": {}
}
```

Error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": []
  }
}
```

### 12.3 Public endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/comics` | list public comics |
| `GET` | `/api/v1/comics/:issueOrSlug` | read one public comic |
| `GET` | `/api/v1/comics/:comicId/translations` | retrieve localized content |
| `GET` | `/api/v1/comics/:comicId/assets` | retrieve ordered assets |
| `GET` | `/api/v1/comics/:comicId/share` | retrieve share metadata |
| `GET` | `/api/v1/comics/:comicId/stats` | retrieve public counters |
| `POST` | `/api/v1/comics/:comicId/views` | register a view |
| `POST` | `/api/v1/comics/:comicId/likes` | register a like |
| `DELETE` | `/api/v1/comics/:comicId/likes/:visitorId` | remove a like |

### 12.4 Admin endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/admin/comics` | create draft comic |
| `PUT` | `/api/v1/admin/comics/:comicId` | update comic metadata |
| `POST` | `/api/v1/admin/comics/:comicId/translations` | create translation |
| `PUT` | `/api/v1/admin/comics/:comicId/translations/:locale` | update translation |
| `POST` | `/api/v1/admin/comics/:comicId/assets` | attach asset metadata |
| `POST` | `/api/v1/admin/comics/:comicId/share-metadata` | create or update share metadata |
| `POST` | `/api/v1/admin/comics/:comicId/publish` | publish comic |
| `POST` | `/api/v1/admin/comics/:comicId/unpublish` | unpublish or archive comic |

### 12.5 Request validation rules

Initial validation requirements:

- issue number must be a positive integer
- slug must match a defined URL-safe pattern
- locale must be one of `eng` or `pt`
- markdown body must not be empty for publishable translations
- asset order must be numeric and non-negative
- visitor ID must match UUID-like format

### 12.6 Pagination and filtering

Initial policy:

- list endpoints support pagination
- list endpoints support locale and status filters when relevant
- sort order defaults to descending `issue_number` for public listing

### 12.7 Idempotency expectations

- `POST /views` is idempotent per `comicId + visitorId + day`
- `POST /likes` is idempotent per `comicId + visitorId`
- publish operations must fail clearly when preconditions are not met

## 13. Authentication and Authorization

### 13.1 Public access

- public read endpoints are anonymous
- public interaction endpoints are anonymous but validated

### 13.2 Admin access

Initial phase direction:

- only internal editorial users
- no public registration
- admin endpoints protected separately from public API

### 13.3 Authentication decision for phase 1

Proposed approach:

- email + password for admin users
- JWT bearer access token for admin API calls
- refresh strategy can be added when the admin UI exists

Rationale:

- simple to integrate with future Vue admin panel
- easy to test before dashboard exists
- keeps public and admin concerns separate

### 13.4 Authorization policy

Initial role model:

- `admin`

Possible future roles:

- `editor`
- `publisher`
- `viewer`

## 14. Asset Strategy

### 14.1 Initial asset assumptions

- existing comic images remain source assets
- backend persists metadata first
- physical storage abstraction is introduced even if files initially remain on disk

### 14.2 Asset design rule

The API should never rely on frontend hardcoded path conventions as its source of truth.

Instead:

- asset metadata lives in MySQL
- resolved URLs are constructed from metadata and environment config
- the frontend reads resolved values from the API

### 14.3 Share previews

Short-term:

- preserve current preview assets where possible
- persist preview asset metadata

Later:

- generate share pages or metadata dynamically from backend-owned content

## 15. Current-to-Target Migration Map

| Current concern | Current location | Target ownership |
| --- | --- | --- |
| comic metadata | `localEng.js`, `localPt.js` | `comics` table |
| localized body text | `localEng.js`, `localPt.js` | `comic_translations` |
| image file names | `localEng.js`, `localPt.js` | `comic_assets` |
| public share metadata | static files in `share/` | `comic_share_metadata` + API |
| likes | not persisted | `comic_likes` |
| views | not persisted | `comic_views` |
| publication state | implicit/manual | `comics.status` |
| admin action history | nonexistent | `audit_logs` |

## 16. Non-Functional Requirements

### 16.1 Maintainability

- strict module boundaries
- no direct database access from controllers
- no business logic inside route handlers
- consistent naming conventions

### 16.2 Reliability

- startup must fail fast on invalid config
- unhandled errors must be surfaced through centralized error middleware
- database writes must be transaction-safe where multi-table mutation occurs

### 16.3 Performance

- public read endpoints should be optimized for high-read patterns
- counts should use indexed queries
- future caching can be added without contract changes

### 16.4 Security

- validated input only
- password hashing
- principle of least privilege for admin endpoints
- no sensitive data in logs

### 16.5 Observability

- structured logs
- request correlation IDs
- error classification
- health endpoint
- readiness strategy for future deployment

## 17. Testing Strategy

### 17.1 Test layers

- unit tests
  - entities
  - value objects
  - validators
  - domain services
- integration tests
  - repositories
  - database-backed use cases
  - transaction behavior
- contract tests
  - HTTP endpoint request/response shapes
- smoke tests
  - health endpoint
  - startup and configuration validation

### 17.2 What must be tested before rollout

- issue uniqueness enforcement
- translation uniqueness enforcement
- publishability rules
- like idempotency
- view deduplication
- asset ordering
- public listing and retrieval
- admin mutation flows

### 17.3 Testing philosophy

- test business rules before UI integration
- prefer deterministic fixtures
- use repository interfaces for domain/application tests
- keep end-to-end scope narrow until frontend migration begins

## 18. Logging and Observability Strategy

### 18.1 Logging

Planned behavior:

- structured JSON logs
- request log at HTTP boundary
- application event logs for publish, like, unlike, and import operations
- error logs with error code and request correlation

### 18.2 Health endpoints

Planned endpoints:

- `GET /health`
  - process is running
- `GET /ready`
  - dependencies required for serving are available

### 18.3 Metrics to track later

- request count by endpoint
- error rate by endpoint
- database latency
- publish action count
- like/view submission count

## 19. Environment and Configuration Strategy

### 19.1 Expected environments

- local
- test
- staging
- production

### 19.2 Configuration categories

- server port
- environment name
- database connection
- JWT secret and expiry
- public asset base URL
- logging level
- CORS allowlist

### 19.3 Configuration policy

- configuration must come from environment variables
- `.env.example` must document required values
- secrets must never be committed

## 20. Deployment Strategy

### 20.1 Deployment reality

The current production site is static-host friendly. The new backend requires a persistent Node runtime and database access.

This introduces an infrastructure decision:

- either current hosting supports Node apps and MySQL comfortably
- or the API must be hosted separately from the static site

### 20.2 Backend deployment requirements

- persistent Node process
- restart strategy
- environment injection
- database connectivity
- log access
- TLS termination or trusted reverse proxy

### 20.3 Production operational guidance

Based on Express production guidance:

- set `NODE_ENV=production`
- ensure automatic restart strategy
- handle exceptions centrally
- deploy behind a reverse proxy where appropriate

### 20.4 Rollout strategy

1. deploy API to staging
2. validate content import
3. validate current-frontend adapter in parallel environment
4. validate likes and views
5. validate admin content mutations
6. cut over only after parity and stability checks

## 21. Content Migration Strategy

### 21.1 Migration source

Primary source data:

- `D:\explodingcomics\js\localEng.js`
- `D:\explodingcomics\js\localPt.js`

Asset source data:

- `D:\explodingcomics\assets\comics\eng`
- `D:\explodingcomics\assets\comics\pt`
- `D:\explodingcomics\assets\share`

### 21.2 Migration steps

1. parse current JS arrays into structured records
2. repair encoding inconsistencies
3. normalize locale codes and issue mapping
4. map image references into asset metadata rows
5. generate or validate slug strategy
6. import into MySQL
7. validate record counts and sample outputs

### 21.3 Migration risks

- text encoding corruption
- missing or mismatched asset references
- inconsistent share metadata
- hidden assumptions inside the current frontend

### 21.4 Mitigation

- import script must be repeatable
- import must run against staging before any production action
- migration reports must include counts, skips, warnings, and mismatches

## 22. Milestones

### Milestone 0: Discovery and SDD Foundation

Goal:

- establish the design baseline and living documentation

Deliverables:

- parallel workspace
- implementation plan
- baseline architecture direction

Definition of done:

- current repo mapped
- migration target documented
- milestones documented

Status:

- completed

### Milestone 1: API Foundation

Goal:

- scaffold the backend project with clear layers and quality tooling

Planned deliverables:

- `package.json`
- `tsconfig.json`
- environment config module
- health route
- central error middleware
- project folder boundaries
- test runner setup

Acceptance criteria:

- API boots locally
- `GET /health` returns success
- invalid config fails startup
- lint/test/build commands are defined

Status:

- completed

### Milestone 2: Database and Persistence Foundation

Goal:

- define and wire the MySQL persistence layer

Planned deliverables:

- migration files
- repository interfaces
- repository implementations
- database connection management

Acceptance criteria:

- schema creates successfully
- repositories can read and write in integration tests
- transaction strategy is documented and tested

Status:

- completed

### Milestone 3: Public Read API

Goal:

- serve public comic data from MySQL

Planned deliverables:

- list comics endpoint
- get comic details endpoint
- get translations endpoint
- get assets endpoint
- get share metadata endpoint
- get stats endpoint

Acceptance criteria:

- API responses replace array reads conceptually
- public read contracts are documented
- contract tests pass

Status:

- completed
- list, detail, and stats public comic endpoints implemented and validated against the live local database
- translations, assets, and share metadata are currently exposed through the consolidated comic detail response instead of separate derivative public endpoints

### Milestone 4: Admin Content Management API

Goal:

- enable creation and maintenance of comic content without editing source code

Planned deliverables:

- create comic endpoint
- update comic endpoint
- create/update translation endpoints
- attach asset endpoint
- publish endpoint
- audit logging of admin actions

Acceptance criteria:

- a full comic can be created from admin flows
- publish preconditions are enforced
- audit logs are written

Status:

- in progress
- the first admin mutation slice is implemented: draft creation, metadata update, translation creation/update, asset creation, share metadata upsert, and publication
- publishability validation is enforced in the application layer and audit logs were validated against the live local database

### Milestone 5: Likes and Views

Goal:

- persist interaction data professionally and deterministically

Planned deliverables:

- like endpoint
- unlike endpoint
- view registration endpoint
- public stats endpoint updates

Acceptance criteria:

- likes are unique per visitor per comic
- views count once per visitor per day
- stats are stable across refresh patterns

### Milestone 6: Current Frontend Adapter

Goal:

- make the current reading experience work against the new API in the parallel workspace

Planned deliverables:

- adapter layer for current frontend
- replacement strategy for `localEng.js` and `localPt.js`
- staging-style validation flow

Acceptance criteria:

- old UI runs against API without production cutover
- comic reading flow remains functional

### Milestone 7: Vue Reader Frontend

Goal:

- create a new Vue reader frontend consuming the stable API

Planned deliverables:

- Vue app skeleton
- comic reader view
- language and theme state
- share-aware routing

Acceptance criteria:

- reader feature parity is reached for core flows
- Vue consumes only API data, not static arrays

### Milestone 8: Admin UI

Goal:

- provide a professional editorial interface

Planned deliverables:

- comic creation flow
- translation editing flow
- asset attachment flow
- publish action flow

Acceptance criteria:

- weekly publishing is manageable without code edits
- validation feedback is clear

### Milestone 9: Production Hardening and Rollout

Goal:

- make the new system safe to deploy

Planned deliverables:

- deployment checklist
- rollback checklist
- observability checklist
- staging signoff

Acceptance criteria:

- production cutover path is documented
- rollback is documented
- operational dependencies are validated

## 23. Definition of Ready and Definition of Done

### 23.1 Definition of Ready

Work is ready when:

- desired behavior is documented
- affected modules are known
- inputs and outputs are clear
- validation rules are known
- persistence implications are known

### 23.2 Definition of Done

Work is done when:

- implementation matches documented behavior
- tests cover the business rule changes
- this document is updated
- any temporary compromises are named
- rollout impact is recorded

## 24. Decision Register

### Confirmed decisions

- keep the current production site unchanged during migration
- build the new system in `exploding-comics-pro`
- backend first, frontend later
- choose Express for the API
- choose MySQL for persistence
- choose Vue for the future frontend
- choose TypeScript for backend implementation
- treat likes and views as persisted backend concerns, not frontend state

### Pending decisions

- final production hosting target for the Express app
- exact admin authentication UX
- whether assets stay on disk initially or move to dedicated storage immediately
- whether public comic URLs will be issue-based, slug-based, or both

## 25. Risks and Constraints

### 25.1 Known constraints

- writable workspace for this session is `D:\explodingcomics`, so the parallel project lives inside the current repository root instead of as an OS-level sibling folder
- current content contains visible encoding inconsistencies
- current hosting model is static-site oriented

### 25.2 Major risks

- hosting may not be ideal for long-running Node processes
- content import may surface hidden inconsistencies in the current dataset
- asset mapping may be less uniform than expected
- public share behavior may require redesign when data becomes dynamic

### 25.3 Mitigations

- keep API contracts stable
- stage import before any cutover
- document asset conventions explicitly
- preserve current system until new one is proven

## 26. Update Protocol

At the end of every implementation round, update this file with:

- completed tasks
- files created or changed in the new project
- decisions made
- difficulties found
- next recommended step

## 27. Update Log

### 2026-07-02 - Round 1

Completed:

- reviewed the current repository structure and key functional files
- identified the current production architecture as a static Webpack-bundled site with JavaScript arrays as the content source
- created an isolated parallel workspace under `exploding-comics-pro`
- created the first version of this living implementation plan
- defined the initial milestone map for the migration to Express + MySQL, with Vue reserved for a later phase

Difficulties found:

- the safe writable workspace available in this session is `D:\explodingcomics`, so the new project was created as an isolated top-level folder inside the current repository rather than outside it as an OS-level sibling directory
- the current content model mixes presentation concerns, content, and asset references, which will require a careful extraction step before persistence work begins
- Portuguese source content includes visible encoding inconsistencies that must be normalized before professional persistence is finalized

Decisions made:

- do not alter the current production implementation during the planning and foundation phase
- start with backend-first migration
- use the existing repository only as a functional reference, not as the implementation base for the new architecture

### 2026-07-02 - Round 2

Completed:

- expanded this document from a milestone outline into a fuller software design and implementation plan
- documented the target domain model, relational schema direction, API conventions, security baseline, observability baseline, and migration strategy
- established a concrete milestone ladder from backend foundation through production rollout
- recorded the working assumption that the API will be implemented in TypeScript on Node.js LTS, while preserving Express + MySQL + future Vue as the platform direction

Difficulties found:

- the current project contains several implicit conventions that are enforced only by frontend code and file naming, not by formal domain rules
- the final production hosting target for the future Express app remains an infrastructure decision that can affect deployment shape
- admin authentication details are still partially deferred because the first implementation wave is backend-first rather than dashboard-first

Decisions made:

- this file becomes the canonical SDD and execution plan for the migration
- the new backend will own publication state, share metadata, likes, views, and text persistence
- the old frontend will eventually be adapted to API reads before the Vue migration is considered complete

### 2026-07-02 - Round 3

Completed:

- scaffolded the backend project in `D:\explodingcomics\exploding-comics-pro\apps\api`
- installed the initial runtime and developer dependencies for Express, TypeScript, validation, logging, testing, and MySQL connectivity
- created the layered source structure with `application`, `config`, `infrastructure`, and `interfaces`
- implemented environment parsing with fail-fast validation
- implemented `GET /health` and `GET /ready`
- implemented request ID assignment, request logging, centralized error mapping, and not-found handling
- added baseline contract and unit tests
- validated `lint`, `typecheck`, `test`, and `build`

Difficulties found:

- PowerShell script execution policy prevented direct `npm` usage, so commands had to be executed via `cmd /c npm ...`
- the sandbox blocked creation of the compiled `dist` output during normal command execution, so the final build validation had to run with elevated permissions for write access to generated build artifacts
- TypeScript 6 surfaced stricter configuration and typing constraints, requiring a dedicated build tsconfig and a small logger typing adjustment

Decisions made:

- use TypeScript strict mode from the start
- use ESLint for baseline static analysis
- use Vitest and Supertest for the first automated checks
- keep health and readiness endpoints at top-level routes (`/health` and `/ready`) rather than behind API versioning
- compile production output from `src` only, while keeping tests in the main typecheck flow

### 2026-07-02 - Round 4

Completed:

- added MySQL configuration to the API environment model
- implemented MySQL pool creation and a database health checker
- upgraded `/ready` to depend on a real readiness use case with dependency checks
- created the first migration SQL file `0001_initial_schema.sql`
- implemented a filesystem migration source and a MySQL migration runner
- added `npm run db:check` and `npm run migrate`
- introduced repository contracts and first read-oriented use cases for published comics
- implemented the first MySQL-backed comic read repository
- added unit tests for readiness, migration file loading, and comic repository mapping
- revalidated `lint`, `typecheck`, `test`, and `build`

Difficulties found:

- no MySQL instance or connection credentials were available in this workspace session, so live execution of `db:check` and `migrate` against a real database could not be completed yet
- strict TypeScript settings surfaced several boundary issues around optional properties, regex parsing, and generic row typing, which required explicit modeling rather than implicit assumptions
- build output still depends on elevated write access in this session because of the sandbox constraint around generated `dist` artifacts

Decisions made:

- keep the database layer explicit and lightweight with `mysql2` plus a custom migration runner instead of introducing an ORM at this stage
- model published comic reads separately from future write flows
- treat readiness as an application concern that checks infrastructure dependencies, not merely an HTTP hardcoded response
- preserve migration execution as an explicit operator action via scripts rather than hidden startup behavior

### 2026-07-02 - Round 5

Completed:

- prepared a dedicated local MySQL setup guide for Windows in `D:\explodingcomics\exploding-comics-pro\docs\mysql-local-setup.md`
- added a local database bootstrap SQL script for creating the database and application user
- added a recommended local environment template for the API
- updated the API documentation to point to the new local setup guide
- changed the generic `.env.example` to recommend a dedicated application user instead of `root`

Difficulties found:

- MySQL client tools are not currently installed on this machine, so live bootstrap and migration execution still depend on the user completing local MySQL installation first
- Docker is not available on this machine right now, so the recommended unblock path remains native MySQL installation on Windows

Decisions made:

- local developer setup should prefer a dedicated application user instead of running the API as `root`
- database bootstrap is treated as a separate operator step from application migrations
- the setup path should optimize for speed of unblocking on the current machine, which means native MySQL first and optional containerization later

### 2026-07-02 - Round 6

Completed:

- created the local API `.env` and connected the application to the newly installed MySQL server
- validated database connectivity successfully with `npm run db:check`
- executed the initial migration successfully with `npm run migrate`
- verified the API against the live database through `/health` and `/ready`
- revalidated `lint`, `typecheck`, `test`, and `build` after fixing real-MySQL compatibility issues
- completed the live validation needed to close Milestone 2

Difficulties found:

- the initial application password in `.env` did not match the password actually set in the Workbench bootstrap script, which caused an `ER_ACCESS_DENIED_ERROR`
- MySQL 8.0 rejected the `UTC_TIMESTAMP()` default expressions used in the migration bootstrap and initial schema, requiring compatibility adjustments to `CURRENT_TIMESTAMP`
- build output still requires elevated write permission in this session because of sandbox constraints around generated artifacts

Decisions made:

- align the local app credentials with the dedicated MySQL application user created in Workbench
- treat MySQL 8.0 compatibility as the current local baseline while preserving the design for later production alignment
- use `CURRENT_TIMESTAMP` in schema defaults for broader compatibility with the local Windows MySQL installation

### 2026-07-02 - Round 7

Completed:

- implemented public comic read routes under `/api/v1/comics`
- added public controllers and response mappers for list and detail responses
- wired the public comic routes into the application bootstrap
- added a legacy import script to load the current static comic source into MySQL
- imported the existing comic dataset into the local database
- validated the public endpoints against the live local database for both slug and issue-based lookup
- revalidated `lint`, `typecheck`, `test`, and `build`

Difficulties found:

- the current legacy dataset is not fully asset-complete, so issue `#11` was imported as `draft` because the English comic image file is missing from the current source asset folder
- the public read API is only partially complete relative to the full milestone scope, because separate endpoints for stats and other derivative read surfaces have not been added yet
- build output still depends on elevated write permission in this session because of sandbox constraints around generated artifacts

Decisions made:

- public comic slugs are derived deterministically from `issueNumber + English title slug`
- the import path should preserve incomplete records as non-public drafts instead of silently discarding them
- the current live local database now acts as the working validation source for public read endpoint development

### 2026-07-02 - Round 8

Completed:

- fixed the public comic list pagination bug so `LIMIT/OFFSET` are applied to published comics rather than translation join rows
- added a public comic stats read flow with explicit contract, use case, MySQL repository, HTTP mapper, route, and contract tests
- implemented `GET /api/v1/comics/:issueOrSlug/stats`
- validated the corrected comic pagination against the live local database:
  - default `limit=20` returned 20 comics
  - second page returned the remaining 9 published comics
  - `limit=100` returned 29 published comics total
- validated the new stats endpoint against the live local database, returning zeroed counts for the current imported dataset
- revalidated `lint`, `typecheck`, `test`, and `build`
- closed Milestone 3 as functionally complete for the current backend-first wave

Difficulties found:

- the first public list implementation paginated over joined translation rows, which caused partial comic pages and required a query redesign around a paged comic subquery
- build output still requires elevated write permission in this session because of sandbox constraints around generated artifacts

Decisions made:

- public pagination must always be comic-based, never translation-row-based
- public translations, assets, and share metadata are served through the consolidated comic detail endpoint for now instead of separate dedicated read endpoints
- public stats are exposed as aggregate counts by comic and can safely evolve later when like/view write endpoints are introduced

### 2026-07-02 - Round 9

Completed:

- added migration `0002_allow_nullable_draft_metadata.sql` so draft comics can exist without `issue_number` and `slug`
- introduced the first admin command contract and use-case set for:
  - draft comic creation
  - comic metadata update
  - translation creation and update
  - asset creation
  - share metadata upsert
  - comic publication
- implemented explicit publishability validation in the application layer for required locales, comic-page assets, share metadata, slug, and issue number
- implemented MySQL-backed admin command persistence with transactional writes and audit log insertion
- added admin HTTP routes under `/api/v1/admin/comics`
- added route contract tests for the admin mutation surface
- added unit coverage for the publishability validator
- validated the admin workflow end-to-end against the live local database by:
  - creating a draft comic with null metadata
  - assigning issue number and slug
  - adding English and Portuguese translations
  - adding English and Portuguese comic-page assets
  - adding English and Portuguese share metadata
  - publishing the comic successfully
  - confirming the new comic became available on the public read API
- validated that the resulting audit log entries were written for the full mutation chain in MySQL
- revalidated `lint`, `typecheck`, `test`, `migrate`, and `build`

Difficulties found:

- the original schema required `issue_number` and `slug` for all comics, which conflicted with the intended draft-first editorial workflow and required a corrective migration
- `createApp` and the HTTP controllers were initially typed against concrete use-case classes, which reduced testability because of private class members and had to be relaxed to public `execute` contracts
- build output still requires elevated write permission in this session because of sandbox constraints around generated artifacts

Decisions made:

- draft comics are allowed to start with null `issueNumber` and null `slug`, but publication still requires both fields
- publishability rules live in the application layer as explicit validation rather than being inferred from database errors
- each admin mutation writes its corresponding `audit_logs` record in the same transactional repository operation

## 28. Next Recommended Step

Begin Milestone 4 with:

- admin authentication and authorization for the new mutation surface
- admin read endpoints for editorial inspection and listing
- archive/unpublish flows and tighter editorial status transitions

After that:

- move into Milestone 5 interaction write endpoints for likes and views
- or start the current frontend adapter if integration priority changes

## 29. Open Questions

- What will be the target production host for the future Express application?
- Should public comic detail URLs prioritize `issue_number`, `slug`, or support both?
- Do we want the first admin workflow to be API-only, or should we reserve time earlier for a minimal internal interface?

## 30. References

Official sources used or relevant for this plan:

- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance/)
- [Express Installing](https://expressjs.com/en/starter/installing.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vue 3 Introduction](https://vuejs.org/guide/introduction.html)
- [MySQL Documentation](https://dev.mysql.com/doc/)
