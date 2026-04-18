// Seed script to populate the R129 tracker with research data
const BASE = "http://127.0.0.1:5000";

async function post(path: string, data: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function seed() {
  console.log("Seeding phases...");

  const phase1 = await post("/api/phases", {
    name: "Assessment & Reliability",
    description: "Safety inspection, address critical wiring harness, ignition, cooling, and electrical issues. Make the car safe and reliable.",
    order: 0,
    status: "planned",
    color: "#dc2626",
  });

  const phase2 = await post("/api/phases", {
    name: "Suspension & Brakes",
    description: "Convert from ADS to coilovers, Silver Arrow brake upgrade, new bushings and braided lines.",
    order: 1,
    status: "planned",
    color: "#2563eb",
  });

  const phase3 = await post("/api/phases", {
    name: "Engine Performance",
    description: "M119 refresh or M113K swap, exhaust upgrade, ECU tuning, drivetrain improvements.",
    order: 2,
    status: "planned",
    color: "#d4a017",
  });

  const phase4 = await post("/api/phases", {
    name: "Interior Modernization",
    description: "CarPlay head unit, audio upgrade, instrument cluster rebuild, upholstery refresh, LED lighting.",
    order: 3,
    status: "planned",
    color: "#16a34a",
  });

  const phase5 = await post("/api/phases", {
    name: "Exterior & Finishing",
    description: "Rust remediation, paint correction or respray, AMG body kit, wheels, exterior lighting, soft top.",
    order: 4,
    status: "planned",
    color: "#9333ea",
  });

  console.log("Seeding tasks...");
  const now = new Date().toISOString();

  // === PHASE 1 TASKS ===
  const p1Tasks = [
    { title: "Inspect engine wiring harness for biodegradable insulation", category: "electrical", priority: "critical", estimatedCost: 0, notes: "1994 uses soy-based harness that crumbles. MOST URGENT ISSUE. Arcing can destroy $2,500 ECU." },
    { title: "Replace engine wiring harness", category: "electrical", priority: "critical", estimatedCost: 800, notes: "OEM-spec harness ~$500-800 DIY. Buy from r129shop.com or PeachParts. Consider buying two sets." },
    { title: "Check/replace OVP relay", category: "electrical", priority: "high", estimatedCost: 50, notes: "Under hood, passenger side. Cracked solder joints cause ABS light, cruise failure, erratic idle. Resolder or replace ~$40." },
    { title: "Replace corroded blade fuses with copper", category: "electrical", priority: "medium", estimatedCost: 30, notes: "Original aluminum fuses corrode. White=8A, Red=16A." },
    { title: "Inspect brake lines for corrosion (esp. rear subframe)", category: "brakes", priority: "critical", estimatedCost: 0, notes: "R129's killer structural issue. 1 in 2 cars affected. Lines hidden under subframe." },
    { title: "Inspect front shock tower mounts", category: "suspension", priority: "critical", estimatedCost: 0, notes: "Safety issue — mounts deteriorate to almost nothing. YouTube: R129 shock tower mounts seconds from failure." },
    { title: "Full cooling system inspection", category: "cooling", priority: "high", estimatedCost: 600, notes: "Expansion tank (plastic/steel joint leaks), all hoses, thermostat, radiator condition. CSF all-aluminum upgrade recommended." },
    { title: "Hydraulic roof — inspect fluid & check for leaks", category: "electrical", priority: "medium", estimatedCost: 100, notes: "Check header rail latch cylinders first (drips from sun visors). Flush with Dexron III ATF or CHF 11S." },
    { title: "Transmission fluid sample/change + filter", category: "transmission", priority: "high", estimatedCost: 300, notes: "1994 uses 722.5 (not 722.6). Shell ATF 134 or MB 236.14 mandatory." },
    { title: "Clean/replace ICV + replace all vacuum hoses", category: "engine", priority: "high", estimatedCost: 200, notes: "ICV clogged with carbon. Rubber hoses rock-hard and cracked. #1 cause of rough idle on M119." },
    { title: "Replace distributor caps, rotors, plugs & wires", category: "engine", priority: "high", estimatedCost: 400, notes: "MUST use Bosch F8DC4 NON-RESISTOR plugs. Resistor plugs destroy the $2,500 ignition control unit." },
    { title: "Inspect timing chain guides via valve covers", category: "engine", priority: "medium", estimatedCost: 0, notes: "Plastic guides are fragile. Broken pieces can fall into sump. Replace proactively if age/mileage unknown." },
    { title: "Read all fault codes across all modules", category: "electrical", priority: "high", estimatedCost: 0, notes: "1994 uses OBD1 with round connector. Need Mercedes STAR or iCarsoft MB II." },
    { title: "Inspect roof micro-switches", category: "electrical", priority: "medium", estimatedCost: 0, notes: "20+ micro-switches in roof frame. One failed switch stops entire operation." },
    { title: "Install SRS seat occupancy emulator", category: "electrical", priority: "low", estimatedCost: 50, notes: "Plug-and-play from eBay. Clears SRS light. Do NOT use child seat in passenger seat with emulator." },
    { title: "Instrument cluster capacitor replacement", category: "electrical", priority: "medium", estimatedCost: 50, notes: "3 capacitors (1x470µF 16V, 2x100µF 16V). Fixes flashing dash lights." },
    { title: "Odometer gear replacement", category: "electrical", priority: "low", estimatedCost: 40, notes: "Plastic gears disintegrate. Parts SEP-R02 and SEP-R31 from Minitools.com." },
    { title: "Document all rust areas", category: "exterior", priority: "medium", estimatedCost: 0, notes: "Check: rear subframe, wheel wells, door sills, door bottoms, front fenders, trunk floor." },
  ];

  for (const t of p1Tasks) {
    await post("/api/tasks", { ...t, phaseId: phase1.id, status: "todo", createdAt: now });
  }

  // === PHASE 2 TASKS ===
  const p2Tasks = [
    { title: "Decide: ADS retain vs. coilover conversion", category: "suspension", priority: "high", estimatedCost: 0, notes: "Options: Bilstein B6 + H&R springs ($600-900), CubeSpeed coilovers ($1200-1800), KW V3 ($2500+)" },
    { title: "Convert to Bilstein B6 + H&R springs OR CubeSpeed coilovers", category: "suspension", priority: "high", estimatedCost: 1500, notes: "H&R: Front pad #1, Rear pad #3 for 1.5\" drop. CubeSpeed: 32-way dampening, divorced front setup." },
    { title: "Replace all worn bushings (front control arm, rear 5-link, subframe)", category: "suspension", priority: "high", estimatedCost: 500, notes: "Comprehensive bushing replacement needed with coilover conversion." },
    { title: "Replace front strut top mounts", category: "suspension", priority: "critical", estimatedCost: 200, notes: "Safety critical. Inspect and replace during suspension work." },
    { title: "Silver Arrow brake upgrade — front Brembo 4-piston + 335mm rotors", category: "brakes", priority: "high", estimatedCost: 800, notes: "2001 SL500 calipers + rotors. Requires 2000-2002 lower control arms (shorter ball joint)." },
    { title: "Silver Arrow brake upgrade — rear calipers + larger rotors", category: "brakes", priority: "high", estimatedCost: 500, notes: "2001 SL500 rear calipers with ~300mm rotors." },
    { title: "Order 2000-2002 lower control arms", category: "suspension", priority: "high", estimatedCost: 500, notes: "Required for Silver Arrow brake clearance. Shorter ball joint avoids rotor contact. ~$200-300/side from MB." },
    { title: "Install stainless braided brake lines (all 4 corners)", category: "brakes", priority: "medium", estimatedCost: 150, notes: "Better pedal feel and safety. Available from FCP Euro and ECS Tuning." },
    { title: "Flush brake fluid (Motul RBF600 or equiv DOT 4+)", category: "brakes", priority: "medium", estimatedCost: 50, notes: "Always flush after brake hardware changes." },
    { title: "4-wheel alignment", category: "suspension", priority: "medium", estimatedCost: 150, notes: "Camber, toe, caster after all suspension work complete." },
  ];

  for (const t of p2Tasks) {
    await post("/api/tasks", { ...t, phaseId: phase2.id, status: "todo", createdAt: now });
  }

  // === PHASE 3 TASKS ===
  const p3Tasks = [
    { title: "Decide: M119 refresh vs. M113K swap vs. LS swap", category: "engine", priority: "high", estimatedCost: 0, notes: "M119 refresh: $2-4K. M113K swap: $12-25K (near bolt-in, 493hp). LS swap: $20-40K (requires custom fab)." },
    { title: "Replace timing chain guides + upgrade cam oiler tubes to metal", category: "engine", priority: "high", estimatedCost: 400, notes: "Parts 119-050-02-16, 119-050-03-16, 119-052-09-16 from Pelican Parts." },
    { title: "Replace valve cover gaskets", category: "engine", priority: "medium", estimatedCost: 200, notes: "Check rear corners of each bank. DIY $100-200." },
    { title: "Fix oil leaks (front crank seal, PS hoses)", category: "engine", priority: "medium", estimatedCost: 300, notes: "Front crank seal visible with flashlight. PS hoses deteriorate from inside out." },
    { title: "Exhaust upgrade — Supersprint or custom cat-back", category: "engine", priority: "medium", estimatedCost: 2000, notes: "Supersprint offers complete system. RENNtech muffler reportedly sounds like a Pagani. Custom: ~$1200-2500." },
    { title: "Install Quaife or Wavetrac LSD", category: "transmission", priority: "medium", estimatedCost: 1500, notes: "R129 never had factory LSD. Quaife ATB: gear-type, progressive. Wavetrac ATD similar. 210mm ring gear diff." },
    { title: "722.6 conductor plate + blue-top solenoids + 150% valve body (if upgrading trans)", category: "transmission", priority: "low", estimatedCost: 800, notes: "150% valve body 'one of the best mods ever for 722.6'. Reset adaptations via STAR after service." },
  ];

  for (const t of p3Tasks) {
    await post("/api/tasks", { ...t, phaseId: phase3.id, status: "todo", createdAt: now });
  }

  // === PHASE 4 TASKS ===
  const p4Tasks = [
    { title: "Install CarPlay head unit (Pioneer/Sony/Continental TR7412UB)", category: "interior", priority: "medium", estimatedCost: 500, notes: "Continental TR7412UB looks period-correct. Sony AX6050 has wireless CarPlay. Solar glass may interfere with DAB." },
    { title: "Upgrade speakers + add compact active subwoofer", category: "interior", priority: "low", estimatedCost: 800, notes: "Replace dash speakers with 4\" coaxials. Eton 6\" active sub in passenger kick panel. Audison for premium." },
    { title: "Instrument cluster full rebuild", category: "electrical", priority: "medium", estimatedCost: 150, notes: "Capacitors + odometer gears + climate display pixel ribbon (pixelfix.net)." },
    { title: "Interior deep clean — headliner, carpets, door cards", category: "interior", priority: "low", estimatedCost: 200, notes: "Professional steam clean or DIY. Assess leather condition for retrim decision." },
    { title: "Decide: partial leather refresh vs. full retrim", category: "interior", priority: "low", estimatedCost: 0, notes: "Partial: clean + condition. Full retrim: $3000-8000. BMW Parchment leather popular for R129." },
    { title: "New OEM-spec floor mats", category: "interior", priority: "low", estimatedCost: 150, notes: "SLSHOP Velour mats made by original MB supplier." },
    { title: "LED interior lighting upgrade", category: "interior", priority: "low", estimatedCost: 100, notes: "Map lights, footwell lights, trunk light." },
    { title: "Heater control display pixel repair", category: "electrical", priority: "low", estimatedCost: 30, notes: "Ribbon cable delaminates. Repair ribbon from pixelfix.net." },
  ];

  for (const t of p4Tasks) {
    await post("/api/tasks", { ...t, phaseId: phase4.id, status: "todo", createdAt: now });
  }

  // === PHASE 5 TASKS ===
  const p5Tasks = [
    { title: "Rust remediation — address all documented areas", category: "exterior", priority: "high", estimatedCost: 2000, notes: "Door sills, wheel wells, subframe if needed. Annual Fluid Film application recommended after." },
    { title: "Decide: paint correction vs. full respray", category: "exterior", priority: "medium", estimatedCost: 0, notes: "Correction: $500-1500 DIY / $1500-3000 shop. Respray: $8000-18000." },
    { title: "AMG body kit — source and install", category: "exterior", priority: "low", estimatedCost: 3000, notes: "OEM AMG: $2000-5000 used. Aftermarket: ClassicEuroParts ~$800-1500 + paint prep. Duraflex fiberglass budget option." },
    { title: "Wheel selection and tire fitment", category: "exterior", priority: "medium", estimatedCost: 2500, notes: "17-19\". OEM AMG Aero 1 iconic. 19x11 squared setups with custom offsets popular. May need fender rolling." },
    { title: "Headlight upgrade — LED projector or Xenon retrofit", category: "exterior", priority: "low", estimatedCost: 500, notes: "1994 has halogen H1/H7. Maintain OEM housing aesthetics." },
    { title: "LED tail light conversion", category: "exterior", priority: "low", estimatedCost: 400, notes: "Late-model R129 LED tails or custom LED units." },
    { title: "Soft top inspection/replacement", category: "exterior", priority: "medium", estimatedCost: 1500, notes: "Sources: Car Cover World, Robbins, Mercedes OEM." },
    { title: "Replace all exterior seals and weatherstripping", category: "exterior", priority: "medium", estimatedCost: 800, notes: "Hood seal, window seals, trunk seals. Critical for water intrusion prevention." },
    { title: "Chrome trim — polish or rechrome", category: "exterior", priority: "low", estimatedCost: 500, notes: "Assess condition and decide on polish vs. replace." },
  ];

  for (const t of p5Tasks) {
    await post("/api/tasks", { ...t, phaseId: phase5.id, status: "todo", createdAt: now });
  }

  console.log("Seeding parts...");

  const partsData = [
    // Phase 1 critical parts
    { name: "OEM Engine Wiring Harness (M119)", partNumber: null, category: "electrical", vendor: "r129shop.com", vendorUrl: "https://www.r129shop.com", estimatedPrice: 900, isOem: true, notes: "CRITICAL for 1994. Biodegradable soy harness replacement." },
    { name: "OVP Relay", partNumber: null, category: "electrical", vendor: "RockAuto", vendorUrl: "https://www.rockauto.com", estimatedPrice: 40, isOem: true, notes: "Resolder if cracked, or replace." },
    { name: "Bosch F8DC4 Spark Plugs (8x)", partNumber: "F8DC4", category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 80, isOem: true, notes: "NON-RESISTOR only. Resistor plugs destroy ICU ($2500)." },
    { name: "Distributor Caps (2x, different L/R)", partNumber: null, category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 120, isOem: true, notes: "Left and right NOT interchangeable." },
    { name: "Distributor Rotors (2x)", partNumber: null, category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 60, isOem: true, notes: "Replace as set with caps and wires." },
    { name: "Plug Wire Set (M119)", partNumber: null, category: "engine", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 150, isOem: false, notes: "Cannot buy as assembly from MB. Bulk wire + correct sleeves." },
    { name: "Idle Control Valve (ICV)", partNumber: null, category: "engine", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 150, isOem: true, notes: "Clean first; replace if seized." },
    { name: "Intake-to-ICV Hoses (set)", partNumber: null, category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 80, isOem: true, notes: "Original rubber rock-hard. Causes vacuum leaks." },
    { name: "CSF All-Aluminum Radiator (R129)", partNumber: null, category: "cooling", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 350, isOem: false, notes: "Upgrade from plastic-tanked OEM. Top off ATF after swap." },
    { name: "Expansion Tank", partNumber: null, category: "cooling", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 80, isOem: true, notes: "Plastic/steel joint leaks. Use OEM, not generic aftermarket." },
    { name: "Thermostat", partNumber: null, category: "cooling", vendor: "RockAuto", vendorUrl: "https://www.rockauto.com", estimatedPrice: 25, isOem: true, notes: "Replace at every coolant service." },
    { name: "Coolant Hose Set", partNumber: null, category: "cooling", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 200, isOem: true, notes: "Replace all coolant hoses during cooling refresh." },
    { name: "Copper Blade Fuse Set", partNumber: null, category: "electrical", vendor: "Amazon", vendorUrl: "https://www.amazon.com", estimatedPrice: 15, isOem: false, notes: "Replace all corroded aluminum fuses." },
    { name: "Instrument Cluster Capacitors (3-pack)", partNumber: "470µF/100µF", category: "electrical", vendor: "Amazon", vendorUrl: "https://www.amazon.com", estimatedPrice: 10, isOem: false, notes: "1x 470µF 16V, 2x 100µF 16V." },
    { name: "Odometer Gears (SEP-R02 + SEP-R31)", partNumber: "SEP-R02", category: "electrical", vendor: "Minitools", vendorUrl: "https://store.minitools.com", estimatedPrice: 30, isOem: false, notes: "Fixes non-working odometer." },
    { name: "SRS Seat Occupancy Emulator", partNumber: null, category: "electrical", vendor: "eBay", vendorUrl: "https://www.ebay.com", estimatedPrice: 40, isOem: false, notes: "Plug-and-play. Do not use child seat in passenger seat." },
    // Phase 2 parts
    { name: "Bilstein B6 Shocks (set of 4)", partNumber: null, category: "suspension", vendor: "Bilstein Shop", vendorUrl: "https://www.bilstein-shop.com/mercedes-sl-r129-c-89773.html", estimatedPrice: 500, isOem: false, notes: "Sport shocks for coilover conversion." },
    { name: "H&R Lowering Springs (set)", partNumber: null, category: "suspension", vendor: "ECS Tuning", vendorUrl: "https://www.ecstuning.com", estimatedPrice: 300, isOem: false, notes: "Front pad #1, Rear pad #3 for ~1.5\" drop." },
    { name: "2001 SL500 Brembo 4-Piston Calipers (front pair)", partNumber: null, category: "brakes", vendor: "MB Dealer / eBay", vendorUrl: null, estimatedPrice: 400, isOem: true, notes: "Silver Arrow upgrade. 335mm rotors included or separate." },
    { name: "335mm Front Rotors (drilled/slotted pair)", partNumber: null, category: "brakes", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 250, isOem: false, notes: "For Silver Arrow upgrade." },
    { name: "2000-2002 Lower Control Arms (pair)", partNumber: null, category: "suspension", vendor: "MB Dealer", vendorUrl: null, estimatedPrice: 500, isOem: true, notes: "Required for Silver Arrow brake clearance. Shorter ball joint." },
    { name: "Stainless Braided Brake Lines (set of 4)", partNumber: null, category: "brakes", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 150, isOem: false, notes: "Better pedal feel. Front + rear available." },
    // Phase 3 parts
    { name: "Upper Timing Chain Guides (pair)", partNumber: "119-050-02-16", category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 100, isOem: true, notes: "Plastic guides fragile. Replace proactively." },
    { name: "Lower Timing Chain Guides (L+R)", partNumber: "119-050-03-16", category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 100, isOem: true, notes: "Left and right. Replace with uppers." },
    { name: "Metal Cam Oiler Tubes (upgrade from plastic)", partNumber: "119-052-09-16", category: "engine", vendor: "Pelican Parts", vendorUrl: "https://www.pelicanparts.com", estimatedPrice: 80, isOem: false, notes: "Plastic originals pop out causing valve ticking at cold start." },
    { name: "Valve Cover Gaskets (pair)", partNumber: null, category: "engine", vendor: "FCP Euro", vendorUrl: "https://www.fcpeuro.com", estimatedPrice: 80, isOem: true, notes: "Check rear corners of each bank." },
    { name: "Quaife ATB LSD", partNumber: null, category: "transmission", vendor: "Quaife", vendorUrl: "https://www.quaife.co.uk", estimatedPrice: 1200, isOem: false, notes: "Gear-type LSD for 210mm diff. Progressive torque bias." },
    // Phase 4 parts
    { name: "Sony AX6050 Wireless CarPlay Head Unit", partNumber: "AX6050", category: "interior", vendor: "Amazon", vendorUrl: "https://www.amazon.com", estimatedPrice: 400, isOem: false, notes: "Single-DIN, wireless CarPlay/Android Auto. Direct fit with adapter." },
    { name: "Eton 6\" Active Subwoofer", partNumber: null, category: "interior", vendor: "Amazon", vendorUrl: "https://www.amazon.com", estimatedPrice: 250, isOem: false, notes: "Built-in amp. Fits passenger kick panel." },
    { name: "Heater Control Pixel Repair Ribbon", partNumber: null, category: "electrical", vendor: "pixelfix.net", vendorUrl: "https://www.pixelfix.net", estimatedPrice: 25, isOem: false, notes: "Fixes delaminated climate control LCD." },
  ];

  for (const p of partsData) {
    await post("/api/parts", { ...p, status: "needed" });
  }

  console.log("Seeding vendors...");

  const vendorsData = [
    { name: "Pelican Parts", url: "https://www.pelicanparts.com", specialty: "OEM & aftermarket; extensive R129 tech articles", rating: 5 },
    { name: "FCP Euro", url: "https://www.fcpeuro.com", specialty: "OEM-grade parts, lifetime guarantee; 722.6 service kits, brake parts", rating: 5 },
    { name: "ECS Tuning", url: "https://www.ecstuning.com", specialty: "Performance and OEM parts; braided brake lines, suspension", rating: 4 },
    { name: "RockAuto", url: "https://www.rockauto.com", specialty: "Budget-friendly OEM and aftermarket maintenance items", rating: 4 },
    { name: "r129shop.com", url: "https://www.r129shop.com", specialty: "European R129 specialist; wiring harnesses, hard-to-find items", rating: 5 },
    { name: "The SL Shop", url: "https://parts.theslshop.com", specialty: "UK-based R129 specialist; OEM parts, seal kits, wiring loom service", rating: 5 },
    { name: "ClassicEuroParts", url: "https://www.classiceuroparts.com", specialty: "R129 AMG/Brabus-style body kits and exterior parts", rating: 3 },
    { name: "Bilstein Shop", url: "https://www.bilstein-shop.com", specialty: "Direct Bilstein fitment lookup for R129; B4, B6, B12 kits", rating: 5 },
    { name: "Supersprint", url: "https://www.supersprint.com", specialty: "Performance exhaust systems for R129 SL500", rating: 4 },
    { name: "CubeSpeed", url: "https://www.cubespeed.com", specialty: "Custom R129 coilover suspension setups", rating: 4 },
    { name: "RENNtech", url: "https://www.renntechclassics.com", specialty: "Premier Mercedes performance shop; ECU tuning, full restomods", rating: 5, notes: "Built multiple R129 restomods including twin-turbo M119 6.0L builds." },
    { name: "Minitools", url: "https://store.minitools.com", specialty: "Instrument cluster repair parts (odometer gears)", rating: 4 },
    { name: "Auto Computer Specialist (ACS)", url: "https://autocomputerspecialist.com/wiring-harness", specialty: "Wire harness restoration: strip, ultrasonic clean, rebuild, test", rating: 4 },
  ];

  for (const v of vendorsData) {
    await post("/api/vendors", v);
  }

  console.log("Seeding knowledge base...");

  const kbEntries = [
    // Known Issues
    {
      title: "CRITICAL: Biodegradable Wiring Harness (1992-1995 only)",
      content: "The 1994 SL500 uses a soy-based biodegradable wiring harness. The insulation crumbles and falls off, leaving bare copper. Affects engine harness, throttle body harness, lower engine harness, and MAF sensor harness.\n\nSymptoms: ASR warning light, hesitation, erratic idle, electrical gremlins, potential ECU damage from arcing ($2,500+ to replace ECU).\n\nReplacement cost: ~$500-800 for OEM-spec engine harness (DIY). Buy from r129shop.com (~€850) or source via PeachParts forum.\n\nRECOMMENDED: Replace immediately. Buy two sets if keeping long-term.",
      category: "known_issue",
      tags: JSON.stringify(["wiring", "electrical", "critical", "1994-specific"]),
      sourceUrl: "http://www.peachparts.com/shopforum/tech-help/112613-wiring-harness-r129-sl500-94-a.html",
    },
    {
      title: "NON-RESISTOR Spark Plugs Only (Bosch F8DC4)",
      content: "The 1994 M119 (engine code 119.960) with twin distributors MUST use non-resistor spark plugs (Bosch F8DC4).\n\nUsing resistor plugs (those with 'R' in designation) can destroy the ignition control unit — ~$2,500 to replace.\n\nDistributor caps are two different types, NOT interchangeable between banks. Coil-to-cap leads cannot be purchased as an assembly from Mercedes; must be made from bulk wire.",
      category: "known_issue",
      tags: JSON.stringify(["ignition", "engine", "critical", "M119"]),
      sourceUrl: "https://forums.mercedesclub.org.uk/index.php?threads/r129-sl500-m119-ignition-problems.147228/",
    },
    {
      title: "Rear Subframe Rust — The R129 Killer",
      content: "According to The SLSHOP, 1 in 2 R129s has a corroded rear subframe. US cars are typically better than UK, but coastal/Southern cars affected.\n\nThe rear subframe conceals hydraulic and brake lines. Rust spreads underneath hidden sections and lines corrode through. Full rear subframe removal required (full day of labor) to access all affected areas.\n\nInspect thoroughly. If corroded, remove, sandblast, powdercoat, and replace all concealed brake/hydraulic lines.",
      category: "known_issue",
      tags: JSON.stringify(["rust", "subframe", "safety", "structural"]),
      sourceUrl: "https://www.theslshop.com/journal/2022/04/07/the-r129-sl-killer/",
    },
    {
      title: "Hydraulic Roof Failure Guide",
      content: "11-12 hydraulic cylinders, most complex convertible roof of its era.\n\nFailure hierarchy:\n1. Roof Control Module (50% of issues) — under rear seats. Fails from water ingress. NEVER jump-start the car (kills module + central locking)\n2. Micro-switches (20+) — one failure stops everything. Pre-1996: flash codes via owner's manual. 1996+: STAR diagnostic\n3. Header rail latch rams — most prone to leaking. Diagnostic: drips from sun visors\n4. Hydraulic lines — hard lines along sills develop pinhole leaks\n\nFluid: Dexron III ATF or CHF 11S. O-ring rebuild requires 4mm Allen wrench.",
      category: "known_issue",
      tags: JSON.stringify(["roof", "hydraulic", "convertible"]),
      sourceUrl: "https://www.theslshop.com/journal/2021/11/19/common-mercedes-r129-sl-issues-episode-1/",
    },
    {
      title: "OVP Relay — Check This First",
      content: "The OVP (Overvoltage Protection) relay is a small relay under the hood (passenger side, under plastic cover). Cracked solder joints cause:\n- ABS light\n- Cruise control failure\n- Erratic idle\n- 'Crazy' electrical behavior\n- SRS light\n\nFix: Resolder or replace (~$40). Check this BEFORE any expensive diagnosis.",
      category: "known_issue",
      tags: JSON.stringify(["electrical", "relay", "cheap-fix"]),
      sourceUrl: "http://www.peachparts.com/shopforum/mercedes-benz-sl-discussion-forum/407244-r129-electrical-gremlins.html",
    },
    {
      title: "Window Re-Index Procedure After Battery Disconnect",
      content: "R129 windows must auto-index (roll down ~1\") before door opens to clear frameless seal. After battery disconnect, windows lose index.\n\nRe-index: Car running, hold window DOWN button ~5 seconds until fully down, then hold UP button ~5 seconds until fully up. Repeat for each window.",
      category: "tip",
      tags: JSON.stringify(["windows", "electrical", "procedure"]),
      sourceUrl: "https://www.youtube.com/watch?v=9j5kD8qTg6g",
    },
    // Mod Guides
    {
      title: "M113K Engine Swap — The Recommended Path",
      content: "The M113K from the SL55 AMG (493 hp stock) is the most popular R129 restomod engine swap. Near bolt-in with the same basic block architecture, engine mounts, and transmission bolt pattern.\n\nRequired:\n- M113K donor engine + ECU (from SL55, C55, E55 AMG)\n- EGS2 transmission control unit (P/N 031-545-07-32)\n- Tiptronic shifter (from 2001-2004 SLK320 or Chrysler Crossfire)\n- Intercooler and oil cooler from donor car\n- Hood clearance modification for intercooler stack\n\nAdvantages: Modern ME engine management, no distributor, no biodegradable harness, higher reliability, massive aftermarket tune support (RENNtech, Kleemann Stage 1-3).\n\nCost: $3,000-8,000 parts / $12,000-25,000 shop installed.",
      category: "mod_guide",
      tags: JSON.stringify(["engine-swap", "M113K", "performance"]),
      sourceUrl: "https://www.youtube.com/watch?v=wfkNtA19ySA",
    },
    {
      title: "Silver Arrow Brake Upgrade Guide",
      content: "Community-proven upgrade using late-model R129 (2000-2002 V8/V12) brake components.\n\nFront: 2001 SL500 Brembo 4-piston aluminum calipers + 335mm rotors (vs stock ~290mm)\nRear: 2001 SL500 rear calipers with ~300mm rotors\n\nCRITICAL: Larger front rotors require 2000-2002 lower control arms (shorter ball joint) to avoid rotor contact. ~$200-300/side from Mercedes.\n\nAdd: Drilled/slotted rotors + stainless braided lines for complete upgrade.\n\nTotal cost: ~$800-1,400 DIY / $1,500-2,500 shop.",
      category: "mod_guide",
      tags: JSON.stringify(["brakes", "upgrade", "Silver-Arrow"]),
      sourceUrl: "https://www.youtube.com/watch?v=FboJWRaygmk",
    },
    {
      title: "ADS-to-Coilover Conversion Options",
      content: "Three main options for eliminating the hydraulic ADS system:\n\n1. Bilstein B6 + H&R Springs ($600-900 DIY)\n   - H&R: Front pad #1, Rear pad #3 for ~1.5\" drop\n   - Best budget option\n\n2. CubeSpeed Coilovers ($1,200-1,800)\n   - 'Divorced' front setup (spring + shock separate) due to R129 geometry\n   - 32-way dampening adjustment\n   - Rubber isolated top mounts for daily driving\n   - If dropping >1.5\" front, order camber plates\n\n3. KW V1/V2/V3 ($2,500+)\n   - V3 preferred for track use (adjustable compression + rebound)\n\nNote: Evacuate and flush ADS hydraulic fluid. Address ADS warning light.",
      category: "mod_guide",
      tags: JSON.stringify(["suspension", "coilovers", "ADS-delete"]),
      sourceUrl: "https://www.youtube.com/watch?v=g1eh8eRsS4M",
    },
    {
      title: "150% Valve Body — Best 722.6 Mod",
      content: "The 150% valve body upgrade for the 722.6 is described as 'one of the best mods ever for a car with a 722.6'. Shifts noticeably faster and more decisively.\n\nCombine with: Fresh conductor plate + blue-top solenoids for comprehensive transmission refresh.\n\nImportant: Reset adaptations via STAR or equivalent scanner after any transmission service.",
      category: "mod_guide",
      tags: JSON.stringify(["transmission", "722.6", "performance"]),
      sourceUrl: "https://mbworld.org/forums/sl-class-r129/850209-r129-m113-modifications.html",
    },
    // Reference
    {
      title: "1994 SL500 vs. Other R129 Model Years",
      content: "Key differences for the 1994 car:\n\n| Feature | 1994 | 1996-1998 | 1999-2001 |\n|---------|------|-----------|----------|\n| Engine | M119.960 (KE-Jetronic) | M119.980 (ME/DIS) | M113 5.0L |\n| Ignition | Twin distributors | Coil-on-plug | Coil-on-plug |\n| Harness | Biodegradable (CRITICAL) | Conventional | Conventional |\n| OBD | OBD1 (round connector) | OBD1/2 transition | OBD2 |\n| Trans | 722.5 | 722.6 | 722.6 |\n\nBottom line: Wiring harness most urgent. Twin distributors require non-resistor plugs. KE-Jetronic less tunable than later ME cars.",
      category: "reference",
      tags: JSON.stringify(["model-years", "comparison", "1994-specific"]),
      sourceUrl: null,
    },
    {
      title: "Budget Tiers — R129 Restomod Cost Guide",
      content: "Tier 1: Maintenance Refresh ($3,000-$6,000)\nSafe, reliable, sorted. All critical issues addressed.\n\nTier 2: Moderate Restomod ($12,000-$22,000)\nImproved dynamics, modern amenities. Coilovers, Silver Arrow brakes, CarPlay, exhaust, LSD.\n\nTier 3: Full Restomod ($35,000-$60,000+)\nMechanically transformed. M113K swap, KW V3 suspension, AMG body kit, full interior retrim.\n\nTier 4: High-End Build ($80,000-$200,000+)\nRENNtech-level. Custom forced induction, fabricated headers, carbon-ceramic brakes, frame-up paint.",
      category: "reference",
      tags: JSON.stringify(["budget", "cost", "planning"]),
      sourceUrl: null,
    },
    {
      title: "Essential Forums and Communities",
      content: "PeachParts SL Discussion — #1 US resource, decades of technical threads\nhttp://www.peachparts.com/shopforum/mercedes-benz-sl-discussion-forum/\n\nMBWorld R129 Forum — Active community, 1990-2002 SL\nhttps://mbworld.org/forums/sl-class-r129/\n\n500Eboard — M119/M120/W140-era focus, excellent M119 technical depth\nhttps://www.500eboard.co/forums/\n\nFacebook: Mercedes SL R129 (main global group)\nhttps://www.facebook.com/groups/slr129/",
      category: "reference",
      tags: JSON.stringify(["forums", "community", "resources"]),
      sourceUrl: null,
    },
    // Tips
    {
      title: "Never Jump-Start an R129",
      content: "Voltage spikes from jump-starting destroy the Roof Control Module AND the central locking system simultaneously. Always use a trickle charger (CTEK or similar) for battery maintenance and storage.",
      category: "tip",
      tags: JSON.stringify(["battery", "roof", "prevention"]),
      sourceUrl: null,
    },
    {
      title: "When Replacing Radiator — Top Off ATF",
      content: "The R129 radiator has an integral ATF cooler. When replacing the radiator, transmission fluid will be lost. Remember to top off with Shell ATF 134 (or MB 236.14 equivalent) after radiator replacement.",
      category: "tip",
      tags: JSON.stringify(["cooling", "transmission", "procedure"]),
      sourceUrl: null,
    },
    {
      title: "Heater Control Valve Access Shortcut",
      content: "On LHD cars, access the heater control valve (behind firewall) by removing the pseudo-firewall plate (4 bolts) rather than the entire wiper assembly. Saves significant time.",
      category: "tip",
      tags: JSON.stringify(["cooling", "heater", "shortcut"]),
      sourceUrl: null,
    },
  ];

  for (const entry of kbEntries) {
    await post("/api/knowledge", { ...entry, createdAt: now });
  }

  console.log("Seed complete!");
}

seed().catch(console.error);
