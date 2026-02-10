# Advanced Analytics Layers

Systemic insight features added to CaliFraud. All data derived from public records. Formula-based, explainable.

## 1. Fraud Typology Classification

**Location:** Sidebar → Typology filter

- **Categories:** healthcare, relief, tax, employment, kickbacks, shell_entities, benefits, government_contracts, insurance
- **Mapping:** Deterministic from `scheme_type` (see `lib/typology.ts`)
- **Use:** Filter map, timeline, and stats by typology

## 2. Recidivism + Entity Network

**Location:** Sidebar → Systemic insight → Recidivism tab  
**API:** `GET /api/analytics/entity-network?min_cases=2`

- Links cases by shared providers, business names, NPIs, EINs
- Entity and CaseEntity tables store relationships
- Seed creates synthetic demo entities linked to 500 cases

## 3. Enforcement Lag Metrics

**Location:** Sidebar → Systemic insight → Enforcement lag tab  
**API:** `GET /api/analytics/enforcement-lag?group_by=county|agency|program`

- Median days from `date_filed` to `date_resolved`
- Group by county, enforcing agency, or program (scheme_type)

## 4. Fraud Risk Index (0–100)

**Location:** Sidebar → Systemic insight → Risk index tab  
**API:** `GET /api/analytics/risk-index?by=county|program`

**Formula:**
- Case density: 40%
- Dollar exposure: 30%
- Recidivism (entity-linked cases): 20%
- Enforcement delay: 10%

## 5. Still Operating Flag

**Location:** Case detail panel

- Flag for sanctioned entities that remain licensed or billing
- `stillOperating` (boolean) + `stillOperatingSource` (URL) for sourcing
- Shown as badge in case detail with source link

## Deployment

1. **Schema migration**
   ```bash
   npm run db:push
   ```

2. **Reseed** (populates new fields + entity network)
   ```bash
   npm run db:seed
   ```

3. **Regenerate Prisma client** (if needed)
   ```bash
   npx prisma generate
   ```
