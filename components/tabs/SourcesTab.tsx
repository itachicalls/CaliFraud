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
      name: 'California State Auditor',
      description: 'Investigates improper governmental activity, fraud, waste; Whistleblower Protection Act.',
      url: 'https://www.auditor.ca.gov/',
      dataUsed: 'State agency fraud, EDD oversight',
    },
    {
      name: 'California Attorney General / DOJ',
      description: 'State-level fraud enforcement, consumer protection, criminal prosecutions.',
      url: 'https://oag.ca.gov/',
      dataUsed: 'State fraud cases, enforcement actions',
    },
    {
      name: 'California Office of the Inspector General',
      description: 'Oversight of corrections and rehabilitation; misconduct reporting.',
      url: 'https://www.oig.ca.gov/',
      dataUsed: 'Corrections oversight',
    },
    {
      name: 'U.S. HHS Office of Inspector General',
      description: 'Federal oversight of Medicare, Medicaid, healthcare fraud.',
      url: 'https://oig.hhs.gov/',
      dataUsed: 'Medi-Cal, telemedicine, healthcare fraud',
    },
    {
      name: 'California EDD – Fraud',
      description: 'Unemployment, disability, paid family leave fraud reporting and archive.',
      url: 'https://edd.ca.gov/',
      dataUsed: 'EDD fraud cases, prevention data',
    },
    {
      name: 'EDD Fraud Archive',
      description: 'EDD response to fraud, enforcement updates.',
      url: 'https://edd.ca.gov/en/about_edd/Fraud-Archive/',
      dataUsed: 'EDD fraud statistics, enforcement',
    },
    {
      name: 'California Department of Social Services – Report Fraud',
      description: 'Report fraud in CalFresh, CalWORKs, foster care, and other programs.',
      url: 'https://www.cdss.ca.gov/Reporting/Report-Fraud',
      dataUsed: 'Benefits fraud reporting',
    },
    {
      name: 'CDSS – Fraud Data Tables',
      description: 'Research and data on fraud investigations, overpayments, collections.',
      url: 'https://www.cdss.ca.gov/inforesources/research-and-data/fraud-data-tables',
      dataUsed: 'Fraud investigation statistics',
    },
    {
      name: 'FBI',
      description: 'Federal fraud investigations including pandemic relief, healthcare, financial crimes.',
      url: 'https://www.fbi.gov/',
      dataUsed: 'Federal fraud cases',
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
