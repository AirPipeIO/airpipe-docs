import {
  // Databases
  siPostgresql, siMysql, siMongodb, siRedis, siSqlite, siMariadb,
  siClickhouse, siElasticsearch, siSnowflake, siPlanetscale, siNeo4j,
  siPrisma, siCockroachlabs, siMinio,
  // Queues / streaming
  siApachekafka, siRabbitmq, siApachepulsar, siApacheflink, siApachespark,
  // Cloud / infra
  siGooglecloud, siVercel, siCloudflare, siFirebase, siSupabase,
  siDocker, siKubernetes, siTerraform, siNginx,
  // Storage
  siGoogledrive, siDropbox,
  // Dev tools
  siGithub, siGitlab, siJira, siLinear, siNotion, siConfluence,
  siPostman, siInsomnia, siSwagger, siGithubactions, siJenkins, siCircleci,
  // Monitoring / observability
  siGrafana, siPrometheus, siDatadog, siSentry, siOpentelemetry,
  // AI / ML
  siAnthropic, siClaude, siGooglegemini, siOllama, siLangchain,
  // Google products
  siGoogleanalytics, siGoogleads, siGoogleadsense, siGoogletagmanager,
  siGooglesearchconsole, siGooglesheets, siGoogledocs, siGoogleforms,
  siGooglecalendar, siGooglemeet, siGooglechat, siGooglemaps,
  siGooglebigquery, siGooglepubsub, siGoogletranslate, siGooglepay,
  siGoogleappsscript, siGooglecolab,
  // GraphQL
  siApollographql,
  // Auth / identity
  siAuth0, siOkta, siKeycloak,
  // Communication
  siDiscord, siTelegram, siWhatsapp, siGmail,
  siMailchimp, siMailgun, siResend, siBrevo,
  // Payments
  siStripe, siBraintree, siPayoneer,
  // eCommerce / CRM / ops
  siShopify, siHubspot, siAirtable, siAsana, siMixpanel, siZapier,
  // CMS
  siWordpress, siContentful, siSanity, siStrapi,
  // Data integration
  siAirbyte,
  // Social
  siX,
} from "simple-icons";

import {
  IconApi,
  IconWebhook,
  IconDatabase,
  IconCalendar,
  IconRefresh,
  IconFilter,
  IconChartBar,
  IconBell,
  IconLock,
  IconFile,
  IconUpload,
  IconDownload,
  IconRobot,
  IconMessage,
  IconUsers,
  IconCreditCard,
  IconMail,
  IconCloud,
  IconPackage,
  IconSearch,
  IconKey,
  IconEye,
  IconBrain,
  IconMicrophone,
  IconPhoto,
  IconShieldCheck,
  IconFileCode,
  IconTransform,
  IconActivity,
  IconBrandAws,
  IconBrandSlack,
  IconBrandLinkedin,
  IconBrandOpenai,
  IconBrandTwilio,
  IconBrandStripe,
  IconBrandDocker,
  IconBrandGraphql,
  IconBrandTerraform,
  IconShieldBolt,
  IconShieldLock,
  IconShieldX,
  IconRadar,
  IconMapPin,
  IconGlobe,
  IconSatellite,
  IconNetwork,
  IconFingerprintScan,
  IconBug,
} from "@tabler/icons-react";

// Helper: SI entry with auto-title from the icon object
const si = (icon) => ({ icon, label: icon.title });

// Helper: Tabler entry with explicit label
const tb = (icon, label) => ({ icon, label });

// ─── Brand / service keyword map — SI icons (most recognisable) ────────────────

const SI_MAP = {
  // Databases
  postgres: si(siPostgresql), postgresql: si(siPostgresql),
  mysql: si(siMysql),
  mongo: si(siMongodb), mongodb: si(siMongodb),
  redis: si(siRedis),
  sqlite: si(siSqlite),
  mariadb: si(siMariadb),
  clickhouse: si(siClickhouse),
  elasticsearch: si(siElasticsearch), elastic: si(siElasticsearch),
  snowflake: si(siSnowflake),
  planetscale: si(siPlanetscale),
  neo4j: si(siNeo4j),
  prisma: si(siPrisma),
  cockroachdb: si(siCockroachlabs), cockroach: si(siCockroachlabs),
  minio: si(siMinio),

  // Queues / streaming
  kafka: si(siApachekafka), apachekafka: si(siApachekafka),
  rabbitmq: si(siRabbitmq),
  pulsar: si(siApachepulsar),
  flink: si(siApacheflink),
  spark: si(siApachespark),

  // Cloud / infra
  // Google products
  googleanalytics: si(siGoogleanalytics), "google-analytics": si(siGoogleanalytics), ga4: si(siGoogleanalytics), ga: si(siGoogleanalytics),
  googleads: si(siGoogleads), "google-ads": si(siGoogleads), adwords: si(siGoogleads),
  googleadsense: si(siGoogleadsense), adsense: si(siGoogleadsense),
  googletagmanager: si(siGoogletagmanager), gtm: si(siGoogletagmanager), "tag-manager": si(siGoogletagmanager),
  googlesearchconsole: si(siGooglesearchconsole), gsc: si(siGooglesearchconsole), "search-console": si(siGooglesearchconsole),
  googlesheets: si(siGooglesheets), sheets: si(siGooglesheets),
  googledocs: si(siGoogledocs), docs: si(siGoogledocs),
  googleforms: si(siGoogleforms), forms: si(siGoogleforms),
  googlecalendar: si(siGooglecalendar),
  googlemeet: si(siGooglemeet), meet: si(siGooglemeet),
  googlechat: si(siGooglechat),
  googlemaps: si(siGooglemaps), maps: si(siGooglemaps),
  bigquery: si(siGooglebigquery),
  pubsub: si(siGooglepubsub), "google-pubsub": si(siGooglepubsub),
  googletranslate: si(siGoogletranslate), translate: si(siGoogletranslate),
  googlepay: si(siGooglepay), gpay: si(siGooglepay),
  appsscript: si(siGoogleappsscript), "apps-script": si(siGoogleappsscript),
  colab: si(siGooglecolab), "google-colab": si(siGooglecolab),

  // Google Cloud
  gcp: si(siGooglecloud), googlecloud: si(siGooglecloud),
  vercel: si(siVercel),
  cloudflare: si(siCloudflare),
  firebase: si(siFirebase),
  supabase: si(siSupabase),
  docker: si(siDocker), container: si(siDocker), containers: si(siDocker),
  kubernetes: si(siKubernetes), k8s: si(siKubernetes),
  terraform: si(siTerraform),
  nginx: si(siNginx),

  // Storage
  drive: si(siGoogledrive), googledrive: si(siGoogledrive),
  dropbox: si(siDropbox),

  // Dev tools
  github: si(siGithub),
  gitlab: si(siGitlab),
  jira: si(siJira),
  linear: si(siLinear),
  notion: si(siNotion),
  confluence: si(siConfluence),
  postman: si(siPostman),
  insomnia: si(siInsomnia),
  swagger: si(siSwagger), openapi: si(siSwagger),
  githubactions: si(siGithubactions), "github-actions": si(siGithubactions),
  jenkins: si(siJenkins),
  circleci: si(siCircleci),

  // Monitoring / observability
  grafana: si(siGrafana),
  prometheus: si(siPrometheus),
  datadog: si(siDatadog),
  sentry: si(siSentry),
  opentelemetry: si(siOpentelemetry), otel: si(siOpentelemetry),

  // AI / ML
  anthropic: si(siAnthropic),
  claude: si(siClaude),
  gemini: si(siGooglegemini), googlegemini: si(siGooglegemini),
  ollama: si(siOllama),
  langchain: si(siLangchain),

  // GraphQL
  apollo: si(siApollographql), graphql: si(siApollographql),

  // Auth / identity
  auth0: si(siAuth0),
  okta: si(siOkta),
  keycloak: si(siKeycloak),

  // Communication
  discord: si(siDiscord),
  telegram: si(siTelegram),
  whatsapp: si(siWhatsapp),
  gmail: si(siGmail),
  mailchimp: si(siMailchimp),
  mailgun: si(siMailgun),
  resend: si(siResend),
  brevo: si(siBrevo), sendinblue: si(siBrevo),

  // Payments
  stripe: si(siStripe),
  braintree: si(siBraintree),
  payoneer: si(siPayoneer),

  // eCommerce / CRM / ops
  shopify: si(siShopify),
  hubspot: si(siHubspot),
  airtable: si(siAirtable),
  asana: si(siAsana),
  mixpanel: si(siMixpanel),
  zapier: si(siZapier),

  // CMS
  wordpress: si(siWordpress), wp: si(siWordpress),
  contentful: si(siContentful),
  sanity: si(siSanity),
  strapi: si(siStrapi),

  // Data integration
  airbyte: si(siAirbyte),

  // Social
  twitter: si(siX), x: si(siX),
};

// ─── Tabler fallbacks — brands not in SI + generic concepts ───────────────────

const TABLER_MAP = {
  // Brands missing from this SI version
  slack: tb(IconBrandSlack, "Slack"),
  aws: tb(IconBrandAws, "AWS"), amazon: tb(IconBrandAws, "AWS"),
  s3: tb(IconBrandAws, "S3"), lambda: tb(IconBrandAws, "Lambda"),
  openai: tb(IconBrandOpenai, "OpenAI"), chatgpt: tb(IconBrandOpenai, "ChatGPT"), gpt: tb(IconBrandOpenai, "GPT"),
  linkedin: tb(IconBrandLinkedin, "LinkedIn"),
  twilio: tb(IconBrandTwilio, "Twilio"), sms: tb(IconBrandTwilio, "Twilio"),
  sendgrid: tb(IconMail, "SendGrid"),
  salesforce: tb(IconUsers, "Salesforce"),

  // AI / ML concepts
  llm: tb(IconBrain, "LLM"),
  rag: tb(IconBrain, "RAG"),
  embedding: tb(IconBrain, "Embeddings"), embeddings: tb(IconBrain, "Embeddings"),
  vector: tb(IconBrain, "Vector DB"), vectordb: tb(IconBrain, "Vector DB"),
  ml: tb(IconBrain, "Machine Learning"), "machine-learning": tb(IconBrain, "Machine Learning"),
  ai: tb(IconBrain, "AI"),
  inference: tb(IconBrain, "Inference"),
  completion: tb(IconBrain, "Completion"),

  // Vision / media
  vision: tb(IconEye, "Vision"),
  ocr: tb(IconEye, "OCR"),
  image: tb(IconPhoto, "Image"), images: tb(IconPhoto, "Images"),
  photo: tb(IconPhoto, "Photo"),
  audio: tb(IconMicrophone, "Audio"),
  speech: tb(IconMicrophone, "Speech"),
  tts: tb(IconMicrophone, "Text-to-Speech"),
  stt: tb(IconMicrophone, "Speech-to-Text"),
  transcription: tb(IconMicrophone, "Transcription"),

  // Schema / validation
  schema: tb(IconShieldCheck, "Schema"),
  validate: tb(IconShieldCheck, "Validation"),
  validation: tb(IconShieldCheck, "Validation"),
  validator: tb(IconShieldCheck, "Validator"),
  "json-schema": tb(IconFileCode, "JSON Schema"),
  avro: tb(IconFileCode, "Avro"),
  protobuf: tb(IconFileCode, "Protobuf"),
  spec: tb(IconFileCode, "Spec"),

  // APIs / protocols
  api: tb(IconApi, "API"), rest: tb(IconApi, "REST"), http: tb(IconApi, "HTTP"),
  webhook: tb(IconWebhook, "Webhook"), webhooks: tb(IconWebhook, "Webhooks"),
  grpc: tb(IconApi, "gRPC"),
  websocket: tb(IconActivity, "WebSocket"), ws: tb(IconActivity, "WebSocket"),

  // Data / ETL
  database: tb(IconDatabase, "Database"), db: tb(IconDatabase, "Database"),
  sql: tb(IconDatabase, "SQL"), query: tb(IconDatabase, "Query"),
  etl: tb(IconTransform, "ETL"),
  transform: tb(IconTransform, "Transform"), transformer: tb(IconTransform, "Transform"),
  pipeline: tb(IconTransform, "Pipeline"),
  streaming: tb(IconActivity, "Streaming"), stream: tb(IconActivity, "Stream"),
  batch: tb(IconDatabase, "Batch"),
  warehouse: tb(IconDatabase, "Data Warehouse"),
  lake: tb(IconDatabase, "Data Lake"),
  analytics: tb(IconChartBar, "Analytics"),
  chart: tb(IconChartBar, "Chart"), metrics: tb(IconChartBar, "Metrics"),
  report: tb(IconChartBar, "Report"),

  // Scheduling
  schedule: tb(IconCalendar, "Schedule"), cron: tb(IconCalendar, "Cron"),
  scheduled: tb(IconCalendar, "Scheduled"), daily: tb(IconCalendar, "Daily"),
  interval: tb(IconCalendar, "Interval"),

  // Sync
  sync: tb(IconRefresh, "Sync"), synchronize: tb(IconRefresh, "Sync"),
  mirror: tb(IconRefresh, "Mirror"), replication: tb(IconRefresh, "Replication"),

  // Filtering
  filter: tb(IconFilter, "Filter"),

  // Threat intelligence / security
  threat: tb(IconShieldBolt, "Threat Intelligence"),
  threats: tb(IconShieldBolt, "Threat Intelligence"),
  "threat-intelligence": tb(IconShieldBolt, "Threat Intelligence"),
  intelligence: tb(IconRadar, "Intelligence"),
  malware: tb(IconBug, "Malware"),
  vulnerability: tb(IconBug, "Vulnerability"), vulnerabilities: tb(IconBug, "Vulnerabilities"),
  firewall: tb(IconShieldLock, "Firewall"),
  intrusion: tb(IconShieldX, "Intrusion Detection"), ids: tb(IconShieldX, "IDS"),
  ddos: tb(IconShieldBolt, "DDoS Protection"),
  abuse: tb(IconShieldX, "Abuse Detection"),
  reputation: tb(IconShieldBolt, "Reputation"),
  scanning: tb(IconRadar, "Scanning"),
  fingerprint: tb(IconFingerprintScan, "Fingerprint"),
  abuseipdb: tb(IconShieldBolt, "AbuseIPDB"),
  shodan: tb(IconRadar, "Shodan"),
  virustotal: tb(IconShieldBolt, "VirusTotal"),

  // Geolocation / IP
  geolocation: tb(IconMapPin, "Geolocation"), geo: tb(IconMapPin, "Geolocation"),
  location: tb(IconMapPin, "Location"),
  coordinates: tb(IconMapPin, "Coordinates"), latitude: tb(IconMapPin, "Coordinates"),
  country: tb(IconGlobe, "Country"), region: tb(IconGlobe, "Region"),
  timezone: tb(IconGlobe, "Timezone"), continent: tb(IconGlobe, "Continent"),
  gps: tb(IconSatellite, "GPS"), satellite: tb(IconSatellite, "Satellite"),
  ipinfo: tb(IconMapPin, "IPinfo"), maxmind: tb(IconMapPin, "MaxMind"),
  ip: tb(IconNetwork, "IP"), ipaddress: tb(IconNetwork, "IP Address"),

  // Auth / security
  auth: tb(IconLock, "Auth"), authentication: tb(IconLock, "Authentication"),
  oauth: tb(IconLock, "OAuth"), sso: tb(IconLock, "SSO"),
  jwt: tb(IconLock, "JWT"), token: tb(IconLock, "Token"),
  encrypt: tb(IconLock, "Encryption"), encryption: tb(IconLock, "Encryption"),
  secret: tb(IconKey, "Secret"), secrets: tb(IconKey, "Secrets"),
  apikey: tb(IconKey, "API Key"), "api-key": tb(IconKey, "API Key"),

  // Alerts / notifications
  alert: tb(IconBell, "Alert"), notification: tb(IconBell, "Notification"),
  notify: tb(IconBell, "Notify"), monitor: tb(IconBell, "Monitor"),

  // Files
  file: tb(IconFile, "File"), files: tb(IconFile, "Files"),
  csv: tb(IconFile, "CSV"), pdf: tb(IconFile, "PDF"), xml: tb(IconFile, "XML"),
  upload: tb(IconUpload, "Upload"), import: tb(IconUpload, "Import"),
  download: tb(IconDownload, "Download"), export: tb(IconDownload, "Export"),

  // Automation / bots
  automation: tb(IconRobot, "Automation"), bot: tb(IconRobot, "Bot"),
  rpa: tb(IconRobot, "RPA"),

  // Messaging
  message: tb(IconMessage, "Message"), chat: tb(IconMessage, "Chat"),
  messaging: tb(IconMessage, "Messaging"),
  email: tb(IconMail, "Email"), mail: tb(IconMail, "Email"), smtp: tb(IconMail, "SMTP"),

  // Users / teams
  users: tb(IconUsers, "Users"), team: tb(IconUsers, "Team"),
  user: tb(IconUsers, "User"), members: tb(IconUsers, "Members"),

  // Payments / billing
  payment: tb(IconCreditCard, "Payment"), payments: tb(IconCreditCard, "Payments"),
  billing: tb(IconCreditCard, "Billing"), invoice: tb(IconCreditCard, "Invoice"),
  subscription: tb(IconCreditCard, "Subscription"),

  // Cloud / infra (generic)
  cloud: tb(IconCloud, "Cloud"), infra: tb(IconCloud, "Infrastructure"),
  serverless: tb(IconCloud, "Serverless"),

  // Search
  search: tb(IconSearch, "Search"),

  // GraphQL (tabler fallback if apollo SI doesn't match)
  "graphql-api": tb(IconBrandGraphql, "GraphQL"),
};

// Returns all unique matched icons with labels, SI brand logos first.
export function resolvePackIcons(name = "", tags = []) {
  const words = [
    ...name.toLowerCase().split(/[\s\-_/]+/),
    ...(tags || []).map((t) => t.toLowerCase()),
  ];

  const seenIcons = new Set();
  const results = [];

  const add = ({ icon, label, type }) => {
    if (seenIcons.has(icon)) return;
    seenIcons.add(icon);
    results.push({ type, icon, label });
  };

  // Pass 1: SI brand logos
  for (const word of words) {
    const entry = SI_MAP[word];
    if (entry) add({ ...entry, type: "si" });
  }

  // Pass 2: Tabler brand + concept icons
  for (const word of words) {
    const entry = TABLER_MAP[word];
    if (entry) add({ ...entry, type: "tabler" });
  }

  if (results.length === 0) {
    results.push({ type: "tabler", icon: IconPackage, label: "Pack" });
  }

  return results;
}
