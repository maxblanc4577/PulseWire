export interface Article {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  pillarId: string;
  region: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  imageCaption: string;
  featured?: boolean;
  breaking?: boolean;
  content: string[];
  keyFindings: string[];
  audioMinutes?: number;
}

export interface ImpactPillar {
  id: string;
  code: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  target2030: string;
  currentProgress: number; // percentage
  activeProjects: number;
  fundingTracked: string;
  keyMetrics: { label: string; value: string; change: string }[];
}

export interface RegionalDesk {
  id: string;
  name: string;
  bureauHead: string;
  location: string;
  activeNations: number;
  featuredStoriesCount: number;
  focusSummary: string;
  humanVitalityScore: number; // 0 - 100
  vitalityChange: string;
  priorityAlert: string;
  imageUrl: string;
}

export interface Publication {
  id: string;
  title: string;
  edition: string;
  category: string;
  pages: number;
  releaseDate: string;
  summary: string;
  downloadCount: string;
  coverImage: string;
  highlights: string[];
}

export interface LiveVitalityMetric {
  title: string;
  value: string;
  unit: string;
  change: string;
  status: 'positive' | 'warning' | 'critical' | 'neutral';
  descriptor: string;
}

export const VITALITY_METRICS: LiveVitalityMetric[] = [
  {
    title: "Dominica & Caribbean Clean Grid Share",
    value: "42.6",
    unit: "%",
    change: "+6.4% YoY",
    status: "positive",
    descriptor: "Paced by Dominica's Laudat geothermal project and decentralized island microgrids."
  },
  {
    title: "Climate Resilient Housing & Infrastructure Index",
    value: "78.2",
    unit: "%",
    change: "+5.1% YoY",
    status: "positive",
    descriptor: "Dominica CREAD building codes and OECS Category-5 shelter fortifications."
  },
  {
    title: "Marine Sanctuary & Coral Shield Coverage",
    value: "36.4",
    unit: "%",
    change: "+8.2% YoY",
    status: "positive",
    descriptor: "Dominica Offshore Sperm Whale Reserve and Soufrière coral restoration scaffolds."
  },
  {
    title: "Sovereign Debt Catastrophe Pause Adoption",
    value: "68.5",
    unit: "%",
    change: "+14.2% YoY",
    status: "positive",
    descriptor: "Bridgetown Initiative clauses integrated into Eastern Caribbean sovereign bond issues."
  }
];

export const IMPACT_PILLARS: ImpactPillar[] = [
  {
    id: "clean-energy",
    code: "PW-01",
    number: 1,
    title: "Decarbonized Grid & Clean Power",
    tagline: "Universal, affordable, and zero-carbon island energy access",
    description: "Accelerating geothermal enthalpy tapping in Dominica's Roseau Valley, solar microgrids, and battery storage across Caribbean island territories.",
    color: "#E59E00",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500",
    iconName: "Zap",
    target2030: "100% renewable power parity across Dominica and the Eastern Caribbean",
    currentProgress: 72,
    activeProjects: 68,
    fundingTracked: "$380M",
    keyMetrics: [
      { label: "Geothermal MW Drilled", value: "24 MW", change: "+100% YoY" },
      { label: "Island Microgrids Online", value: "340", change: "+34% YoY" },
      { label: "Diesel Imports Displaced", value: "48M gal", change: "+28% YoY" }
    ]
  },
  {
    id: "food-water",
    code: "PW-02",
    number: 2,
    title: "Resilient Food & Water Systems",
    tagline: "Agroecology, hillside stabilization, and watershed governance",
    description: "Equipping smallholder farming networks with climate-resistant root crops, Kalinago ancestral agroforestry, and hurricane-resilient water catchments.",
    color: "#16A34A",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500",
    iconName: "Droplets",
    target2030: "Zero catastrophic crop soil erosion in critical island watersheds",
    currentProgress: 64,
    activeProjects: 92,
    fundingTracked: "$210M",
    keyMetrics: [
      { label: "Hectares Terraced", value: "14,200", change: "+22% YoY" },
      { label: "Protected Watersheds", value: "48", change: "+15% YoY" },
      { label: "Local Food Independence", value: "+44%", change: "vs baseline" }
    ]
  },
  {
    id: "economic-equity",
    code: "PW-03",
    number: 3,
    title: "Economic Justice & Sovereign Finance",
    tagline: "Catastrophe clauses, nature-linked bonds, and Bridgetown reforms",
    description: "Disrupting predatory colonial debt cycles through automatic disaster debt pauses, local credit unions, and sovereign green wealth funds.",
    color: "#2563EB",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500",
    iconName: "TrendingUp",
    target2030: "Zero sovereign default penalties following extreme hurricane impacts",
    currentProgress: 78,
    activeProjects: 45,
    fundingTracked: "$620M",
    keyMetrics: [
      { label: "Disaster Pauses Integrated", value: "42 bonds", change: "100% compliant" },
      { label: "Emergency Liquidity Freed", value: "$420M", change: "Immediate relief" },
      { label: "Concessional Capital Leveraged", value: "$1.2B", change: "+38% YoY" }
    ]
  },
  {
    id: "digital-commons",
    code: "PW-04",
    number: 4,
    title: "Digital Public Infrastructure",
    tagline: "Open-source governance, early warning telemetry, and data sovereignty",
    description: "Building open sensor protocols, community-owned disaster communication channels, and digital logistics rails adapted to Caribbean archipelagos.",
    color: "#0284C7",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500",
    iconName: "Cpu",
    target2030: "100% interoperable early warning sensor nodes across Caribbean island coasts",
    currentProgress: 81,
    activeProjects: 38,
    fundingTracked: "$145M",
    keyMetrics: [
      { label: "Citizens on Open Rails", value: "3.4M", change: "+32% YoY" },
      { label: "Public API Transactions", value: "140M", change: "Zero fees" },
      { label: "Island Telemetry Stations", value: "620", change: "+84 new" }
    ]
  },
  {
    id: "climate-adaptation",
    code: "PW-05",
    number: 5,
    title: "Climate Defense & Disaster Shield",
    tagline: "Subterranean grids, Category-5 housing, and CREAD standards",
    description: "Deploying open sensor networks for hurricane tracking while constructing storm-hardened community shelters and underground power conduits.",
    color: "#DC2626",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500",
    iconName: "ShieldAlert",
    target2030: "World's first 100% climate-resilient national infrastructure in Dominica",
    currentProgress: 84,
    activeProjects: 110,
    fundingTracked: "$490M",
    keyMetrics: [
      { label: "Cat-5 Certified Shelters", value: "184", change: "+42% YoY" },
      { label: "Subterranean Conduits", value: "280 km", change: "Roseau & ports" },
      { label: "Lives Shielded", value: "1.2M", change: "Zero preventable loss" }
    ]
  },
  {
    id: "health-equity",
    code: "PW-06",
    number: 6,
    title: "Universal Island Health & Emergency Care",
    tagline: "Solar medical clinics, storm-proof cold chains, and decentralized triage",
    description: "Supporting decentralized solar-powered clinics, emergency maritime ambulances, and hurricane-resilient pharmaceutical cold storage across the Eastern Caribbean.",
    color: "#0D9488",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500",
    iconName: "Activity",
    target2030: "100% of island clinics operational with zero power interruption during category 5 storms",
    currentProgress: 76,
    activeProjects: 54,
    fundingTracked: "$195M",
    keyMetrics: [
      { label: "Resilient Health Nodes", value: "210", change: "+18% YoY" },
      { label: "Solar Cold Storage Hubs", value: "145", change: "100% uptime" },
      { label: "Island Medics Supported", value: "4,800", change: "+12% YoY" }
    ]
  },
  {
    id: "biodiversity",
    code: "PW-07",
    number: 7,
    title: "Ecological Restoration & Marine Sanctuaries",
    tagline: "Sperm whale protection, coral micro-fragmentation, and rainforest defense",
    description: "Funding satellite acoustic monitoring for Dominica's Sperm Whale Reserve, living coral accretion nurseries, and Morne Trois Pitons World Heritage protection.",
    color: "#059669",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500",
    iconName: "Globe",
    target2030: "100% of Dominica's western whale migration corridor and coastal reefs legally defended",
    currentProgress: 88,
    activeProjects: 62,
    fundingTracked: "$180M",
    keyMetrics: [
      { label: "Reserve Area Protected", value: "800 sq km", change: "Dominica Reserve" },
      { label: "Corals Outplanted", value: "84,000", change: "+54% YoY" },
      { label: "Resident Whale Clans", value: "200+ whales", change: "Stable population" }
    ]
  },
  {
    id: "civic-integrity",
    code: "PW-08",
    number: 8,
    title: "Accountable Governance & Public Budgets",
    tagline: "Open expenditure tracking, procurement transparency, and civic oversight",
    description: "Providing public ledger tracking for climate adaptation funds, civic oversight for infrastructure tenders, and open participatory planning across Caribbean municipalities.",
    color: "#7C3AED",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
    iconName: "Scale",
    target2030: "100% of sovereign climate adaptation grants published with verified milestones",
    currentProgress: 74,
    activeProjects: 40,
    fundingTracked: "$130M",
    keyMetrics: [
      { label: "Tenders Publicly Audited", value: "1,240", change: "$45M saved" },
      { label: "Civic Town Halls Held", value: "320", change: "+40% YoY" },
      { label: "Open Budget Portals", value: "12 island states", change: "+3 this year" }
    ]
  }
];

export const REGIONAL_DESKS: RegionalDesk[] = [
  {
    id: "commonwealth-of-dominica",
    name: "Commonwealth of Dominica",
    bureauHead: "Daphne Etienne",
    location: "Roseau Bureau & Portsmouth Center",
    activeNations: 1,
    featuredStoriesCount: 64,
    focusSummary: "The Nature Island's drive to become the world's first climate-resilient nation: 120MW geothermal transition in the Roseau Valley, 800 sq km Offshore Sperm Whale Reserve, and Kalinago agroforestry.",
    humanVitalityScore: 82.4,
    vitalityChange: "+3.8 pts",
    priorityAlert: "Laudat geothermal production test well delivers continuous 10MW commercial steam output.",
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1600&q=88"
  },
  {
    id: "eastern-caribbean-oecs",
    name: "Eastern Caribbean & OECS",
    bureauHead: "Caleb Sylvester",
    location: "Castries Hub & Kingstown Bureau",
    activeNations: 7,
    featuredStoriesCount: 88,
    focusSummary: "Lesser Antilles sub-regional clean power integration, maritime transport decarbonization, coastal coral reef nursery network, and CDEMA disaster response readiness.",
    humanVitalityScore: 78.6,
    vitalityChange: "+2.4 pts",
    priorityAlert: "OECS ocean governance framework ratifies joint marine protection zone across St. Lucia, St. Vincent, and Dominica.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=88"
  },
  {
    id: "caricom-coordination",
    name: "CARICOM Climate & Finance Desk",
    bureauHead: "Elena Morales-Cruz",
    location: "Bridgetown Hub & Kingston Bureau",
    activeNations: 15,
    featuredStoriesCount: 112,
    focusSummary: "Bridgetown Initiative debt-for-climate swap architecture, Caribbean Catastrophe Risk Insurance Facility (CCRIF) parametric triggers, and regional energy independence.",
    humanVitalityScore: 76.8,
    vitalityChange: "+2.1 pts",
    priorityAlert: "Multilateral development banks approve mandatory 24-month hurricane debt suspension clauses for Caribbean member states.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=88"
  },
  {
    id: "greater-antilles",
    name: "Greater Antilles Basin",
    bureauHead: "Dr. Ramon Mendez",
    location: "Kingston & Santo Domingo Bureau",
    activeNations: 5,
    featuredStoriesCount: 76,
    focusSummary: "Mangrove biosphere restoration, solar-powered community desalination, and sustainable agroforestry in mountainous watersheds across the northern Caribbean.",
    humanVitalityScore: 74.2,
    vitalityChange: "+1.6 pts",
    priorityAlert: "Coastal blue carbon credits certified for 12,000 hectares of restored Caribbean mangrove wetlands.",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=88"
  },
  {
    id: "southern-caribbean",
    name: "Southern Caribbean & Guianas",
    bureauHead: "Anil Persaud",
    location: "Port of Spain & Georgetown Bureau",
    activeNations: 4,
    featuredStoriesCount: 58,
    focusSummary: "Industrial decarbonization, green hydrogen pilot facilities, coastal sea defense dikes, and sovereign natural resource wealth funds in the southern Caribbean basin.",
    humanVitalityScore: 75.9,
    vitalityChange: "+1.9 pts",
    priorityAlert: "Trinidad and Guyana initiate joint regional food terminal to slash Caribbean agricultural import costs.",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=88"
  }
];

export const ARTICLES: Article[] = [
  {
    id: "dominica-geothermal-revolution",
    title: "The Volcanic Grid: How Dominica Is Tapping Roseau Valley Steam for 100% Clean Power",
    subtitle: "In the volcanic highlands of Laudat and Morne Prosper, deep production wells are unlocking 120MW of geothermal capacity—positioning the Nature Island to power its entire national grid and export clean electricity to Martinique and Guadeloupe.",
    excerpt: "An investigative field dispatch from Dominica's Roseau Valley geothermal production fields, exploring how subterranean volcanic enthalpy is replacing imported diesel and turning the Eastern Caribbean island into a sovereign green energy powerhouse.",
    category: "Energy Transition",
    pillarId: "clean-energy",
    region: "Commonwealth of Dominica",
    author: {
      name: "Daphne Etienne",
      role: "Senior Energy Correspondent, Roseau Bureau",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 25, 2026",
    readTime: "8 min read",
    audioMinutes: 10,
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Drilling engineers and geothermal specialists inspect production wellhead valves in the Laudat highlands of Dominica's Roseau Valley, where high-pressure steam temperatures exceed 240°C.",
    featured: true,
    breaking: false,
    keyFindings: [
      "Dominica's Laudat geothermal plant brings 10MW commercial phase online, meeting over 80% of national baseload demand.",
      "Undersea transmission interconnection cables to neighboring French departments Martinique and Guadeloupe projected to generate $45M in annual green sovereign export revenues.",
      "Electricity generation costs to Dominican domestic households and local businesses are modeled to decline by 52% compared to historical diesel benchmarks.",
      "Volcanic binary-cycle re-injection technology achieves zero net surface emissions and protects local watershed ecology in the Morne Trois Pitons buffer zone."
    ],
    content: [
      "In the emerald volcanic highlands of Laudat, where sulfur-tinted mist curls across the Morne Trois Pitons National Park buffer zone, heavy drill steel hums deep beneath the basalt bedrock. Here, nearly two thousand meters below the rainforest floor, superheated volcanic brine roars through geothermal fissures at temperatures exceeding 240 degrees Celsius.",
      "For decades, the Commonwealth of Dominica—like nearly every island in the Eastern Caribbean—spent upwards of 12% of its Gross Domestic Product purchasing imported foreign diesel to fuel thermal generation plants in Roseau and Portsmouth. Volatile oil tanker shipments left electricity tariffs among the highest in the hemisphere.",
      "Today, that vulnerability is being permanently extinguished. Pulsewire's investigative team traversed the Laudat production corridor alongside local Dominican engineers and hydrologists who have successfully tested production wells RV-P1 and RV-P2, validating high-enthalpy steam capable of generating dozens of megawatts of reliable, 24/7 baseload electricity.",
      "'When you flip the switch in Roseau, that light will not come from an oil tanker docked off the coast,' explains Daphne Etienne, chief operating engineer for the Dominica Geothermal Development Company. 'It will come directly from the volcanic heartbeat of our own island. No hurricane can blow subterranean steam away.'",
      "The engineering implications extend far beyond domestic self-sufficiency. Dominica's small population requires less than 20 megawatts of peak electrical power. By scaling the geothermal field to 60 and 120 megawatts, the Commonwealth is finalizing high-voltage direct current (HVDC) submarine power cables to supply Martinique to the south and Guadeloupe to the north.",
      "This green power export corridor represents the first regional inter-island renewable energy trade pact in the Eastern Caribbean, transforming Dominica from an energy-dependent micro-state into the clean energy battery of the Lesser Antilles.",
      "Crucially, the plant operates on a closed-loop binary cycle: 100% of geothermal fluid is injected back into the reservoir after steam extraction, ensuring zero mineral runoff into pristine Dominican rivers and safeguarding the island's celebrated rainforest water catchments."
    ]
  },
  {
    id: "dominica-cread-climate-resilience",
    title: "The Architecture of Survival: Dominica's Quest to Become the World's First Climate-Resilient Nation",
    subtitle: "Eight years after Category 5 Hurricane Maria decimated 226% of national GDP, Dominica's CREAD building codes, subterranean conduits, and reinforced coastal defenses are defying tropical storm extremes.",
    excerpt: "Inside Dominica's nationwide resilience transformation—from Portsmouth's reinforced community centers to underground electrical grids in Roseau that remain energized through 160-mph sustained winds.",
    category: "Climate Defense",
    pillarId: "climate-adaptation",
    region: "Commonwealth of Dominica",
    author: {
      name: "Marcus Bellevue",
      role: "Infrastructure & Resilience Lead, Portsmouth Bureau",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 23, 2026",
    readTime: "7 min read",
    audioMinutes: 9,
    imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Reinforced bridge abutments and engineered river catchments along the Roseau River in Dominica, built to withstand 500-year deluge flash floods.",
    featured: false,
    breaking: true,
    keyFindings: [
      "Over 7,200 hurricane-resilient homes built with reinforced concrete slab roofs and Category-5 tie-downs across Dominican parishes.",
      "Roseau municipal power and communications conduits placed underground, eliminating transmission line failure during tropical storm landfalls.",
      "Every Dominican citizen now lives within 15 minutes of a fortified shelter equipped with autonomous solar power, satellite links, and 14 days of water reserves.",
      "The Climate Resilience Execution Agency of Dominica (CREAD) benchmarks adopted by four neighboring OECS island territories."
    ],
    content: [
      "On September 18, 2017, Hurricane Maria slammed into Dominica with 160-mph sustained winds, stripping the Nature Island's lush rainforest canopy down to bare trunks and damaging 90% of the island's housing stock. Prime Minister Roosevelt Skerrit addressed the United Nations days later with a historic declaration: Dominica would not merely rebuild—it would become the world's first climate-resilient nation.",
      "Pulsewire's investigative audit of Dominica's national rebuilding benchmarks confirms that what began as an audacious sovereign pledge has crystallized into an unyielding science of survival.",
      "Across Roseau, the capital city, overhead utility poles that once snapped like toothpicks in tropical cyclones have disappeared. In their place, heavy-duty subterranean conduits encase high-voltage electrical lines, optical fiber, and potable water distribution pipes.",
      "In Portsmouth, Saint Joseph, and Grand Bay, community emergency centers are engineered with double-reinforced monolithic concrete envelopes capable of withstanding 200-mph winds. Each shelter incorporates rooftop rainwater filtration, autonomous solar microgrids, and satellite telemetry nodes.",
      "'Climate resilience is not an academic luxury for small island developing states,' states Marcus Bellevue, lead structural engineer. 'It is our sovereign border defense against an overheating Atlantic.'"
    ]
  },
  {
    id: "dominica-sperm-whale-reserve",
    title: "Sanctuary of the Giants: Inside Dominica's World-First Offshore Sperm Whale Reserve",
    subtitle: "By legally designating 800 square kilometers along its sheltered western coastline, Dominica is safeguarding 200 resident sperm whales—and proving ocean biomass is a premier blue carbon sink.",
    excerpt: "How marine biologists, local artisanal fishers, and indigenous water wardens created a permanent sanctuary in the deep offshore trenches of Dominica's leeward coast.",
    category: "Biosphere Defense",
    pillarId: "biodiversity",
    region: "Commonwealth of Dominica",
    author: {
      name: "Dr. Genevieve Royer",
      role: "Marine Ecology Specialist, Scotts Head Station",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 20, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "A resident sperm whale mother and calf cruise through the deep sapphire trenches off Dominica's western shelf, protected by satellite tracking and acoustic buoys.",
    featured: false,
    keyFindings: [
      "800 square kilometers of deep pelagic habitat legally gazetted with mandatory ship speed limits and acoustic sonar restrictions.",
      "Dominica's resident cetaceans cycle thousands of tons of deep-sea nutrients to surface waters, stimulating carbon-sequestering phytoplankton.",
      "Artisanal Dominican fishermen appointed as licensed marine stewards, generating sustainable ecotourism revenues that stay on the island.",
      "Real-time acoustic buoy network alerts incoming cargo vessels to whale pod coordinates, reducing vessel collision risk by 94%."
    ],
    content: [
      "Just two miles off the sheltered western coast of Dominica, the seabed plunges precipitously into deep oceanic trenches over a thousand meters deep. In these calm, leeward Caribbean waters, an extraordinary community of approximately 200 resident sperm whales (Physeter macrocephalus) nurse their calves, socialize, and dive for giant squid.",
      "Dominica has taken an unprecedented sovereign step: creating the planet's very first protected marine reserve dedicated specifically to sperm whales.",
      "The 800-square-kilometer reserve strictly regulates commercial shipping corridors, prohibits industrial fishing vessels, and enforces mandatory 10-knot speed caps to prevent fatal vessel strikes.",
      "The ecological dividends are global. When sperm whales feed in deep waters and defecate near the surface, they release massive concentrations of iron and nitrogen. This 'whale pump' fertilizes phytoplankton blooms that pull thousands of metric tons of carbon dioxide from the atmosphere every year.",
      "'A single whale over its lifespan sequesters as much carbon as thousands of mature trees,' says Dr. Genevieve Royer. 'By defending our whales, Dominica is defending the planet's atmosphere.'"
    ]
  },
  {
    id: "dominica-kalinago-agroforestry",
    title: "The Ancient Shield: Kalinago Forest Keepers Defend Dominica's Slopes with Ancestral Agroecology",
    subtitle: "Along the rugged Atlantic ridges of the Kalinago Territory, indigenous farmers blend multi-tiered cassava terracing with satellite soil moisture arrays to prevent catastrophic storm mudslides.",
    excerpt: "A deep dive into Dominica's 3,700-acre Kalinago Territory, where traditional botanical stewardship and seed-banking are preserving food sovereignty against escalating Atlantic storm seasons.",
    category: "Food Security",
    pillarId: "food-water",
    region: "Dominica (Kalinago Territory)",
    author: {
      name: "Lorenzo Sanford",
      role: "Indigenous Agroforestry Fellow, Salybia",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 17, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Kalinago agroforestry farmers tend to terrace plantings of heritage root vegetables and shade trees on the windward slopes of Salybia, Dominica.",
    featured: false,
    keyFindings: [
      "Multi-canopy traditional cassava, breadfruit, and vetiver planting has prevented slope slippage on 85% of monitored Atlantic ridges.",
      "Over 40 heritage seed and root varieties cataloged and preserved in the Salybia Community Seed Vault.",
      "Youth apprenticeships pair Kalinago botanical knowledge with handheld drone mapping to identify erosion hazards prior to hurricane season."
    ],
    content: [
      "Perched high on the windward Atlantic bluffs of Dominica, the Kalinago Territory encompasses 3,700 acres of steep volcanic ridgelines, ancestral territory of the Caribbean's only surviving indigenous population with collective land tenure.",
      "When tropical tempests unleash torrential rainfall, conventional monoculture farms across the region often slide into the sea as catastrophic mudslides. In the Kalinago Territory, the slopes remain anchored.",
      "The secret lies in the ancient practice of multi-tier agroforestry. Kalinago farmers interplant deep-rooting vetiver grasses, dwarf banana trees, heritage bitter cassava, and native forest canopies. The interwoven root networks form a living geotextile that holds topsoil against the most ferocious flash deluges.",
      "'Our ancestors knew that the mountain cannot be shaved clean without punishment,' says Lorenzo Sanford. 'When we combine our traditional agricultural wisdom with precision soil monitoring, our communities are never caught unprepared.'"
    ]
  },
  {
    id: "debt-reform-sovereign",
    title: "Breaking the Debt Collar: Caribbean States Enforce Catastrophe Clauses Across Global Finance",
    subtitle: "Spearheaded through the Bridgetown Initiative and unified under CARICOM, small island developing states secure automatic debt amortisation pauses whenever extreme hurricanes strike.",
    excerpt: "How Caribbean prime ministers and finance ministers transformed international climate negotiations from pleading for relief funds into sovereign financial protection shields that liberate hundreds of millions in post-disaster liquidity.",
    category: "Economic Justice",
    pillarId: "economic-equity",
    region: "Caribbean Community (CARICOM)",
    author: {
      name: "Elena Morales-Cruz",
      role: "Regional Financial Policy Correspondent, Bridgetown Bureau",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 14, 2026",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Finance ministers from Dominica, Barbados, Jamaica, and the OECS sign mutual sovereign financial covenants in Bridgetown.",
    featured: false,
    keyFindings: [
      "Catastrophe pause clauses have already been integrated into 42 sovereign bond issuances across CARICOM.",
      "Saved debt service payments were redirected immediately to reconstruct bridges and hospital power networks after Category 5 cyclones.",
      "Major multilateral development banks have agreed to triple low-interest concessional lending ratios for small island states."
    ],
    content: [
      "When a Category 5 hurricane strikes a Caribbean island state, wiping out 200% of its annual Gross Domestic Product in four hours, the international financial system has traditionally demanded interest payments on old debts uninterrupted.",
      "This structural cruelty is finally being dismantled.",
      "Through collective bargaining orchestrated across CARICOM and the Bridgetown Initiative, vulnerable island nations have inserted mandatory disaster clauses into all new bond issues. If verified satellite readings detect winds above 140 knots, principal and interest amortizations instantly freeze for 24 months with zero credit rating penalty.",
      "This mechanism frees up hundreds of millions of dollars in instant domestic cash flow, ensuring that emergency hospital rebuilding, water purification, and road clearing are financed immediately without waiting for foreign donor conferences."
    ]
  },
  {
    id: "caribbean-living-reefs",
    title: "The Living Coral Ramparts: How Eastern Caribbean Nurseries Are Rebuilding Island Reef Shields",
    subtitle: "From Dominica's Soufrière Scotts Head Marine Reserve to Grenada and St. Lucia, micro-fragmentation labs and low-voltage mineral accretion are doubling natural reef growth rates to blunt storm surges.",
    excerpt: "Examining how island marine biologists across the Lesser Antilles are deploying heat-resilient elkhorn corals to reinforce the natural breakwaters protecting coastal fishing communities.",
    category: "Biosphere Defense",
    pillarId: "biodiversity",
    region: "Eastern Caribbean & OECS",
    author: {
      name: "Anya Christopher",
      role: "Coastal Science Specialist, Soufrière Marine Center",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=400&h=400&q=90"
    },
    publishedAt: "September 10, 2026",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Scientific divers in the Soufrière Scotts Head Marine Reserve outplant micro-fragmented colonies of Acropora palmata onto natural volcanic rock ridges.",
    featured: false,
    keyFindings: [
      "Micro-fragmentation techniques accelerate coral growth rates from 1 cm to over 10 cm annually.",
      "Healthy offshore coral reefs dissipate up to 97% of ocean storm swell energy before it impacts Dominican shorelines.",
      "Community coral nurseries maintain 18 genetically distinct, heat-tolerant broodstocks to survive marine heatwaves."
    ],
    content: [
      "At the southern tip of Dominica, where the calm Caribbean Sea meets the surging Atlantic through the Scotts Head peninsula, an underwater revolution is underway in the Soufrière Scotts Head Marine Reserve.",
      "Marine biologists and local Dominican divers are culturing thousands of fragments of critically endangered elkhorn and staghorn corals. Using diamond-blade saws to slice corals into tiny micro-fragments, they stimulate the coral's innate healing response, accelerating growth up to forty times normal rates.",
      "These resilient colonies are grafted back onto submerged volcanic reefs, creating living, self-healing wave barriers that protect coastal villages like Soufrière and Pointe Michel from ferocious ocean swells.",
      "'A concrete seawall begins deteriorating the day it is poured,' explains Anya Christopher. 'A living coral reef grows stronger and taller as the sea rises, sheltering our fish nurseries while defending our homes.'"
    ]
  },
  {
    id: "caribbean-sargassum-biorefinery",
    title: "Turning the Golden Tide: Caribbean Bio-Refineries Transform Pelagic Sargassum into Clean Fuel",
    subtitle: "Cooperative pilot plants across Dominica, Barbados, and Antigua convert nuisance brown seaweed blooms into bio-methane gas and slow-release organic fertilizers for island farmers.",
    excerpt: "How Caribbean chemists and agro-entrepreneurs turned an ecological nuisance into a circular bio-economy dividend that replaces expensive imported chemical fertilizers.",
    category: "Food Security",
    pillarId: "food-water",
    region: "Wider Caribbean Basin",
    author: {
      name: "Caleb Sylvester",
      role: "Bio-Economy Correspondent, Castries Hub",
      avatar: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=88"
    },
    publishedAt: "September 06, 2026",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=88",
    imageCaption: "Technicians in Dominica's bio-processing facility inspect organic liquid fertilizer concentrates extracted from sustainably harvested coastal sargassum biomass.",
    featured: false,
    keyFindings: [
      "Pelagic sargassum harvests converted into 12,000 liters of high-potassium liquid plant stimulant monthly.",
      "Bio-methane digestion reactors provide clean cooking gas for 180 rural farming cooperative kitchens.",
      "Heavy metal filtration processes successfully reduce arsenic and cadmium levels below strict international agricultural thresholds."
    ],
    content: [
      "For over a decade, massive mats of pelagic sargassum seaweed drifting across the tropical Atlantic have choked Caribbean coastlines, smothering coral lagoons and releasing foul sulfur gases as they decompose on white-sand beaches.",
      "In Dominica and neighboring island territories, innovators have stopped treating sargassum as a disaster and started processing it as a valuable sovereign resource.",
      "Through decentralized anaerobic digestion and biorefining, community-led enterprises are harvesting incoming sargassum blooms offshore before they decay. The biomass is separated into methane gas for local power and nutrient-dense organic fertilizers that replace high-cost synthetic chemical imports for local banana, citrus, and root-crop growers.",
      "'By closing the loop on sargassum, we turn an ecological burden into clean island energy and agricultural self-reliance,' notes Caleb Sylvester."
    ]
  }
];

export const PUBLICATIONS: Publication[] = [
  {
    id: "pub-vitality-2026",
    title: "Dominica & Caribbean Climate Resilience Report 2026",
    edition: "SIDS Flagship Adaptation Monograph • Volume 14",
    category: "Flagship Data Report",
    pages: 184,
    releaseDate: "September 2026",
    summary: "The definitive independent assessment of climate resilience, geothermal energy transition, and disaster adaptation progress across Dominica and 15 Caribbean island territories. Explores how decentralized geothermal, Category-5 building codes, and sovereign catastrophe debt clauses are insulating island populations.",
    downloadCount: "48.2k",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=90",
    highlights: [
      "Comprehensive Climate Resilience Index scores for Dominica and Eastern Caribbean territories.",
      "Special Focus: The Roseau Valley 120MW Geothermal Project and undersea inter-island interconnection.",
      "Policy Blueprint: Mandatory 24-month Catastrophe Debt Pause clauses for small island states."
    ]
  },
  {
    id: "pub-climate-defense",
    title: "The Caribbean Climate Shield: Dominica's CREAD Blueprint",
    edition: "Special Island Intelligence Monograph",
    category: "Climate & Infrastructure",
    pages: 112,
    releaseDate: "August 2026",
    summary: "An in-depth empirical audit comparing Caribbean adaptation investments with actual field performance during tropical cyclones. Highlights the 6:1 return on investment for subterranean utility conduits, reinforced community shelters, and living coral breakwaters.",
    downloadCount: "32.6k",
    coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=90",
    highlights: [
      "Interactive GIS database of 420 storm-hardened shelters and subterranean grid routes across Dominica.",
      "Cost-benefit analysis of natural coral breakwaters vs concrete seawalls in the Lesser Antilles.",
      "Early warning sensor latency metrics across 40 Caribbean island communities."
    ]
  },
  {
    id: "pub-digital-commons",
    title: "The Blue Economy & Sargassum Circularity in CARICOM",
    edition: "Technical & Policy Briefing",
    category: "Bio-Economy & Oceans",
    pages: 96,
    releaseDate: "July 2026",
    summary: "How Caribbean island governments and local cooperatives can convert pelagic seaweed influxes into organic bio-fertilizer and methane power while preserving the world's first offshore sperm whale sanctuary in Dominica.",
    downloadCount: "29.1k",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=90",
    highlights: [
      "Technical blueprints for decentralized coastal sargassum anaerobic digestors.",
      "Dominica Offshore Sperm Whale Reserve acoustic monitoring and marine stewardship protocols.",
      "Financial models demonstrating 55% savings on island agricultural fertilizer imports."
    ]
  }
];

export const DESK_DISPATCHES_TICKER = [
  "ROSEAU: Dominica Geothermal Project begins high-capacity steam testing at Laudat production wells.",
  "BRIDGETOWN: CARICOM Climate Adaptation Facility secures $120M concessional funding for island microgrids.",
  "SALYBIA: Kalinago indigenous council completes 50-hectare agroforestry slope stabilization project.",
  "SOUFRIÈRE: Scotts Head Marine Reserve deploys next-gen micro-fragmentation coral nursery scaffolds.",
  "CASTRIES: OECS Sustainable Ocean Economy Council ratifies eastern archipelago marine patrol pact.",
  "PORTSMOUTH: Dominica CREAD certifies 42 new community shelters built to Category-5 resilience standards."
];
