'use client'

const SOURCES = {
  voterFraud: [
    {
      name: 'Heritage Foundation Election Fraud Database',
      description: 'Searchable database of proven election fraud cases nationwide; filter by California.',
      url: 'https://electionfraud.heritage.org/search?state=CA',
      dataUsed: 'Notable case details, conviction records',
    },
    {
      name: 'California Secretary of State – Elections',
      description: 'Official state elections division; voter complaint forms, post-election audits.',
      url: 'https://www.sos.ca.gov/elections',
      dataUsed: 'Election procedures, complaint process',
    },
    {
      name: 'CA SOS – Post-Election Audits',
      description: 'Official post-election audit reports and procedures.',
      url: 'https://sos.ca.gov/elections/post-election-audits',
      dataUsed: 'Audit methodology, county reporting',
    },
    {
      name: 'CA SOS – Voter Complaint Form',
      description: 'Official form to report election fraud and code violations.',
      url: 'https://sos.ca.gov/elections/election-voter-complaint-form',
      dataUsed: 'Referral process',
    },
    {
      name: 'The Transparency Foundation',
      description: '2023 California election integrity audit; 14.17% fraud rate sample, signature rejection disparities, 6.6M stale registrations.',
      url: 'https://thetransparencyfoundation.org/',
      dataUsed: 'Audit findings, fraud rate, uncured signatures, voter roll accuracy',
    },
    {
      name: 'Transparency Foundation – 2022 CA Election Audit',
      description: 'Full audit report on California 2022 election practices.',
      url: 'https://thetransparencyfoundation.org/news/audit-reveals-evidence-of-voter-fraud-in-californias-2022-election',
      dataUsed: '14.17% fraud rate, 56% uncured, Sacramento vs San Joaquin disparity',
    },
    {
      name: 'U.S. Department of Justice – Eastern District of California',
      description: 'Federal prosecutions including noncitizen voting, identity theft, EDD fraud.',
      url: 'https://www.justice.gov/usao-edca',
      dataUsed: 'Federal voter fraud convictions (e.g., Lerma)',
    },
    {
      name: 'U.S. Department of Justice',
      description: 'National fraud enforcement, COVID-19 Fraud Strike Force.',
      url: 'https://www.justice.gov/',
      dataUsed: 'Federal prosecution records',
    },
  ],
  countyDAs: [
    { name: 'Los Angeles County District Attorney', url: 'https://da.lacounty.gov/', county: 'LA' },
    { name: 'San Diego County District Attorney', url: 'https://www.sdcda.org/', county: 'San Diego' },
    { name: 'Orange County District Attorney', url: 'https://orangecountyda.org/', county: 'Orange' },
    { name: 'Sacramento County District Attorney', url: 'https://www.sacda.org/', county: 'Sacramento' },
    { name: 'San Joaquin County District Attorney', url: 'https://sjcda.org/', county: 'San Joaquin' },
    { name: 'Monterey County District Attorney', url: 'https://www.countyofmonterey.gov/government/departments-a-h/district-attorney', county: 'Monterey' },
    { name: 'Ventura County Government', url: 'https://www.ventura.org/', county: 'Ventura' },
    { name: 'San Luis Obispo County Government', url: 'https://www.slocounty.ca.gov/', county: 'San Luis Obispo' },
    { name: 'Sonoma County District Attorney', url: 'https://da.sonomacounty.ca.gov/', county: 'Sonoma' },
    { name: 'Madera County District Attorney', url: 'https://www.maderada.org/', county: 'Madera' },
    { name: 'Del Norte County District Attorney', url: 'https://www.co.del-norte.ca.us/departments/DA', county: 'Del Norte' },
  ],
  generalFraud: [
    {
      name: 'DOJ – 2025 National Health Care Fraud Takedown',
      description: 'Largest HCF takedown in US history: 324 defendants, $14.6B alleged fraud. Case summaries by district including CA.',
      url: 'https://www.justice.gov/criminal/criminal-fraud/2025-national-health-care-fraud-takedown',
      dataUsed: 'Healthcare fraud case details, amounts, defendants',
    },
    {
      name: 'DOJ – 2025 HCF Case Summaries',
      description: 'Full case summaries for all 324 defendants including Central, Northern, Southern District of California.',
      url: 'https://www.justice.gov/criminal/criminal-fraud/health-care-fraud-unit/2025-national-hcf-case-summaries',
      dataUsed: 'Monte Vista $269M, Vincent Thayer $68M, Kaiser, hospice, DME cases',
    },
    {
      name: 'DOJ – Criminal Fraud Cases',
      description: 'Chronological list of federal criminal fraud prosecutions.',
      url: 'https://www.justice.gov/criminal/criminal-fraud-cases',
      dataUsed: 'Federal fraud prosecution records',
    },
    {
      name: 'DOJ – False Claims Act Recoveries',
      description: 'FY2025: $6.8B recoveries (record). Healthcare $5.7B. Whistleblower qui tam data.',
      url: 'https://www.justice.gov/opa/pr/false-claims-act-settlements-and-judgments-exceed-68b-fiscal-year-2025',
      dataUsed: 'National recovery totals, enforcement trends',
    },
    {
      name: 'California State Auditor',
      description: 'Investigates improper governmental activity, fraud, waste. EDD high-risk. 2025-601 report.',
      url: 'https://www.auditor.ca.gov/',
      dataUsed: 'State agency fraud, EDD oversight, high-risk list',
    },
    {
      name: 'CA State Auditor – EDD Reports',
      description: 'All reports related to Employment Development Department.',
      url: 'https://information.auditor.ca.gov/reports/agency/30',
      dataUsed: 'EDD audit findings',
    },
    {
      name: 'California Attorney General',
      description: 'Medi-Cal fraud, healthcare settlements, enforcement press releases.',
      url: 'https://oag.ca.gov/',
      dataUsed: 'Kaiser $556M, CVS $18.2M, QOL $47M, Shangri-La, Santillan',
    },
    {
      name: 'California Stops Fraud',
      description: 'Official state fraud prevention statistics: unemployment, EBT, hospice, financial aid.',
      url: 'https://www.stopfraud.ca.gov/',
      dataUsed: 'State fraud prevention data',
    },
    {
      name: 'U.S. HHS Office of Inspector General',
      description: 'Medicare, Medicaid fraud. LEIE exclusions. Enforcement actions.',
      url: 'https://oig.hhs.gov/',
      dataUsed: 'Healthcare exclusions, enforcement',
    },
    {
      name: 'HHS-OIG – 2025 HCF Takedown',
      description: 'OIG media materials for 2025 National Health Care Fraud Takedown.',
      url: 'https://oig.hhs.gov/newsroom/media-materials/2025-national-health-care-fraud-takedown/',
      dataUsed: 'Healthcare fraud enforcement data',
    },
    {
      name: 'California EDD – Fraud Response',
      description: 'EDD fraud prevention, $1.4B recovered, task force data.',
      url: 'https://edd.ca.gov/en/about_edd/fraud-response/',
      dataUsed: 'EDD fraud recovery, prevention',
    },
    {
      name: 'EDD Fraud Archive',
      description: 'EDD response to fraud, enforcement updates, COVID fraud.',
      url: 'https://edd.ca.gov/en/about_edd/Fraud-Archive/',
      dataUsed: 'EDD fraud statistics',
    },
    {
      name: 'CDSS – Fraud Data Tables',
      description: 'DSS 466, CA 812, DPA 482. CalWORKs, CalFresh fraud investigations by fiscal year.',
      url: 'https://www.cdss.ca.gov/inforesources/research-and-data/fraud-data-tables',
      dataUsed: 'Benefits fraud investigation statistics',
    },
    {
      name: 'CDSS – DSS 466 Fraud Investigation Activity',
      description: 'Quarterly fraud investigation report: dispositions, overpayments, criminal complaints.',
      url: 'https://www.cdss.ca.gov/inforesources/research-and-data/fraud-data-tables/dss466',
      dataUsed: 'CalWORKs/CalFresh fraud data',
    },
    {
      name: 'CDSS – Report Fraud',
      description: 'Report fraud in CalFresh, CalWORKs, foster care. Fraud hotline.',
      url: 'https://www.cdss.ca.gov/Reporting/Report-Fraud',
      dataUsed: 'Fraud reporting',
    },
    {
      name: 'USAO – Central District of California',
      description: 'Federal prosecutions in LA, Orange, Ventura, San Bernardino, Riverside, San Luis Obispo, Santa Barbara.',
      url: 'https://www.justice.gov/usao-cdca',
      dataUsed: 'Monte Vista, hospice, substance abuse, Homekey cases',
    },
    {
      name: 'USAO – Northern District of California',
      description: 'Federal prosecutions in Bay Area, Sacramento, Central Valley.',
      url: 'https://www.justice.gov/usao-ndca',
      dataUsed: 'Vincent Thayer $68M, DME fraud, telemedicine',
    },
    {
      name: 'USAO – Southern District of California',
      description: 'Federal prosecutions in San Diego, Imperial.',
      url: 'https://www.justice.gov/usao-sdca',
      dataUsed: 'EDD, La Jolla Recovery, healthcare fraud',
    },
    {
      name: 'SBA – COVID Fraud Cases',
      description: 'SBA Office of Inspector General COVID relief fraud prosecutions.',
      url: 'https://www.sba.gov/',
      dataUsed: 'PPP, EIDL fraud case references',
    },
    {
      name: 'FBI',
      description: 'Federal fraud investigations: pandemic relief, healthcare, financial crimes.',
      url: 'https://www.fbi.gov/',
      dataUsed: 'Federal fraud cases',
    },
    {
      name: 'data.ca.gov',
      description: 'California open data portal. Search for fraud, EDD, CDSS datasets.',
      url: 'https://data.ca.gov/dataset',
      dataUsed: 'State open data',
    },
    {
      name: 'Courthouse News',
      description: 'Legal news: California fraud prosecutions, EDD $20B.',
      url: 'https://www.courthousenews.com/',
      dataUsed: 'Case coverage',
    },
    {
      name: 'KCRA / CBS Sacramento',
      description: 'California EDD fraud coverage, $20B estimate.',
      url: 'https://kcra.com/',
      dataUsed: 'EDD fraud reporting',
    },
    {
      name: 'LA Times – California',
      description: 'Shangri-La, Homekey, Kaiser, Medi-Cal fraud coverage.',
      url: 'https://www.latimes.com/california',
      dataUsed: 'Major fraud case reporting',
    },
  ],
}

function SourceLink({
  name,
  url,
  description,
  dataUsed,
}: {
  name: string
  url: string
  description?: string
  dataUsed?: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-card bg-california-white border border-california-border hover:border-california-poppy/50 hover:shadow-card transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-california-poppy mt-0.5" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary group-hover:text-california-poppy transition-colors">
            {name}
          </p>
          {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
          {dataUsed && (
            <p className="text-xs text-text-tertiary mt-2">
              <span className="font-medium">Data used:</span> {dataUsed}
            </p>
          )}
        </div>
      </div>
    </a>
  )
}

function CountyDALink({ name, url, county }: { name: string; url: string; county: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg bg-california-white border border-california-border hover:border-california-poppy/50 transition-colors group"
    >
      <span className="font-medium text-text-primary group-hover:text-california-poppy transition-colors">{name}</span>
      <span className="text-xs text-text-tertiary">{county} County</span>
    </a>
  )
}

export default function SourcesTab() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-120px)]">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Sources</h1>
        <p className="text-text-secondary mt-2">
          Verifiable links to every source we use. Click through to confirm our numbers and data.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-california-poppy" />
          Voter Fraud
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Election fraud data, referrals, convictions, and audit findings (2020–2025).
        </p>
        <div className="space-y-3">
          {SOURCES.voterFraud.map((s) => (
            <SourceLink key={s.url} {...s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-california-redwood" />
          County District Attorneys
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          County prosecutors who handle voter fraud and other election-related cases.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SOURCES.countyDAs.map((s) => (
            <CountyDALink key={s.url} {...s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-california-pacific" />
          General Fraud (EDD, Healthcare, Benefits, etc.)
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          State and federal agencies that investigate and report on fraud across California programs.
        </p>
        <div className="space-y-3">
          {SOURCES.generalFraud.map((s) => (
            <SourceLink key={s.url} {...s} />
          ))}
        </div>
      </section>

      <section className="text-sm text-text-tertiary border-t border-california-border pt-4">
        <p>
          Court records and news articles (LA Times, Press Democrat, VC Star, SLO Tribune, etc.) are cited in individual case summaries. 
          Data reflects public records as of our last update. Links open in a new tab.
        </p>
      </section>
    </div>
  )
}
