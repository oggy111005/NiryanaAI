const mongoose = require('mongoose');
require('dotenv').config();
const Standard = require('./models/Standard');

async function getPipeline() {
  const { pipeline } = await import('@xenova/transformers');
  return await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
}

async function generateEmbedding(text, extractor) {
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

const newStandards = [
  // --- CATEGORY 1: ROADS, HIGHWAYS & PAVEMENT ---
  {
    isNumber: "IS 73:2013",
    title: "Paving Bitumen - Specification",
    category: "Road Construction",
    scope: "Covers the requirements for viscosity-graded paving bitumen (VG-10, VG-20, VG-30, VG-40) used for road construction, highway pavements, asphalt surfacing, tack coats and road wearing courses.",
    latestVersion: "2013",
    amendments: ["Amendment 1 - 2018"],
    alliedStandards: [
      { isNumber: "IS 1203", title: "Determination of penetration of bituminous materials", type: "Test Method" },
      { isNumber: "IS 1205", title: "Determination of softening point of bitumen", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73",
    verifiedDate: new Date("2024-02-01T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "4.1",
        title: "Viscosity Grading and Pavement Classification",
        text: "Paving bitumen shall be classified into four viscosity grades: VG-10, VG-20, VG-30 and VG-40, suitable for varying climatic and traffic conditions in road and highway construction.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73#clause-4.1"
      },
      {
        clauseNumber: "5.2",
        title: "Kinematic Viscosity and Softening Point",
        text: "Kinematic viscosity at 135 °C shall not be less than 350 cSt for VG-30 grade bitumen, with softening point minimum 47 °C.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73#clause-5.2"
      }
    ]
  },
  {
    isNumber: "IS 15658:2006",
    title: "Precast Concrete Blocks for Paving - Specification",
    category: "Road Construction",
    scope: "Specifies requirements for precast concrete paver blocks for road pavements, footpaths, pedestrian areas, parking lots, industrial driveways, highway shoulders and bus terminals.",
    latestVersion: "2006",
    amendments: ["Amendment 1 - 2011"],
    alliedStandards: [
      { isNumber: "IS 269", title: "Ordinary Portland Cement", type: "Related Product" },
      { isNumber: "IS 383", title: "Coarse and fine aggregate for concrete", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15658",
    verifiedDate: new Date("2024-01-10T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "6.1",
        title: "Compressive Strength of Paving Blocks",
        text: "Average compressive strength of precast concrete paving blocks shall not be less than 30 MPa for pedestrian traffic and 50 MPa for heavy city roads and industrial traffic.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15658#clause-6.1"
      },
      {
        clauseNumber: "6.3",
        title: "Water Absorption and Abrasion Resistance",
        text: "Water absorption shall not exceed 6 percent by mass, and total wear in the abrasion test shall not exceed 2 mm for road paving applications.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15658#clause-6.3"
      }
    ]
  },
  {
    isNumber: "IS 383:2016",
    title: "Coarse and Fine Aggregate for Concrete - Specification",
    category: "Road & Civil Materials",
    scope: "Covers requirements for crushed stone, gravel and sand aggregates used in road sub-base, base courses, wet mix macadam, structural concrete and highway pavements.",
    latestVersion: "2016",
    amendments: ["Amendment 1 - 2021"],
    alliedStandards: [
      { isNumber: "IS 2386", title: "Methods of test for aggregates for concrete", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383",
    verifiedDate: new Date("2024-01-20T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "4.3",
        title: "Crushing Value and Impact Value for Pavements",
        text: "Aggregate impact value shall not exceed 30 percent for concrete wearing surfaces including runways and road pavements, and 45 percent for non-wearing surfaces.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383#clause-4.3"
      }
    ]
  },
  {
    isNumber: "IS 1203:1978",
    title: "Methods for Testing Tar and Bituminous Materials: Determination of Penetration",
    category: "Road Construction",
    scope: "Covers standard laboratory test method for determining the penetration of road bitumen and tar products, measuring consistency and grade hardness under specified load and temperature.",
    latestVersion: "1978",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 73", title: "Paving bitumen specification", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1203",
    verifiedDate: new Date("2023-11-15T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "3.1",
        title: "Penetration Measurement Procedure",
        text: "Penetration is expressed as the distance in tenths of a millimeter that a standard needle vertically penetrates the bituminous sample under 100g load for 5 seconds at 25 °C.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1203#clause-3.1"
      }
    ]
  },

  // --- CATEGORY 2: CIVIL & STRUCTURAL ENGINEERING ---
  {
    isNumber: "IS 456:2000",
    title: "Plain and Reinforced Concrete - Code of Practice",
    category: "Civil Construction",
    scope: "India's benchmark general structural design code for plain and reinforced concrete (RCC) in buildings, foundations, bridge decks, retaining walls and civil structures.",
    latestVersion: "2000",
    amendments: ["Amendment 1 - 2001", "Amendment 2 - 2005", "Amendment 3 - 2007", "Amendment 4 - 2013", "Amendment 5 - 2019"],
    alliedStandards: [
      { isNumber: "IS 269", title: "Ordinary Portland Cement", type: "Related Product" },
      { isNumber: "IS 1786", title: "High strength deformed steel bars", type: "Related Product" }
    ],
    certifications: ["BIS Certified Standard"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456",
    verifiedDate: new Date("2024-01-10T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "6.1",
        title: "Grades of Concrete",
        text: "Concrete shall be in designated grades M15, M20, M25, M30, M35, M40 through M80, where characteristic compressive strength is determined at 28 days on 150 mm cubes.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456#clause-6.1"
      },
      {
        clauseNumber: "26.4",
        title: "Nominal Cover to Reinforcement",
        text: "Nominal cover for concrete members to prevent corrosion of steel reinforcement shall be minimum 20 mm for slabs, 25 mm for beams, 40 mm for columns and 50 mm for foundations.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456#clause-26.4"
      }
    ]
  },
  {
    isNumber: "IS 800:2007",
    title: "General Construction in Steel - Code of Practice",
    category: "Steel & Civil",
    scope: "Code of practice for the design, fabrication and erection of structural steelwork in highway bridges, overpasses, industrial roof trusses, transmission towers and multistorey buildings.",
    latestVersion: "2007",
    amendments: ["Amendment 1 - 2012"],
    alliedStandards: [
      { isNumber: "IS 2062", title: "Hot rolled medium and high tensile structural steel", type: "Related Product" },
      { isNumber: "IS 1786", title: "High strength deformed steel bars", type: "Related Product" }
    ],
    certifications: ["BIS Certified Standard"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+800",
    verifiedDate: new Date("2024-01-15T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "5.1",
        title: "Structural Steel Material Properties",
        text: "All structural steel members shall conform to IS 2062. Design yield stress fy and ultimate tensile strength fu shall be verified from mill test certificates.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+800#clause-5.1"
      }
    ]
  },
  {
    isNumber: "IS 10262:2019",
    title: "Concrete Mix Proportioning - Guidelines",
    category: "Civil Construction",
    scope: "Provides mathematical and engineering design guidelines for proportioning ordinary, standard, high-strength and self-compacting concrete mixes using target water-cement ratios.",
    latestVersion: "2019",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 456", title: "Plain and reinforced concrete code", type: "Design Code" }
    ],
    certifications: ["BIS Certified Standard"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+10262",
    verifiedDate: new Date("2023-12-01T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "4.2",
        title: "Target Mean Strength Calculation",
        text: "Target mean compressive strength f'ck = fck + 1.65 x s, where s is standard deviation according to Table 1 based on quality control level.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+10262#clause-4.2"
      }
    ]
  },
  {
    isNumber: "IS 1077:1992",
    title: "Common Burnt Clay Building Bricks - Specification",
    category: "Civil Construction",
    scope: "Specifies dimensions, compressive strength classes (3.5 to 35 N/mm²), water absorption and efflorescence limits for common burnt clay masonry bricks.",
    latestVersion: "1992",
    amendments: ["Amendment 1 - 1997", "Amendment 2 - 2002"],
    alliedStandards: [
      { isNumber: "IS 3495", title: "Methods of tests of burnt clay building bricks", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1077",
    verifiedDate: new Date("2023-10-05T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "7.1",
        title: "Compressive Strength of Bricks",
        text: "Common burnt clay building bricks shall have minimum compressive strength of 3.5 N/mm² for class 3.5 up to 35 N/mm² for class 35.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1077#clause-7.1"
      },
      {
        clauseNumber: "7.2",
        title: "Water Absorption Limits",
        text: "Water absorption shall not be more than 20 percent by weight for bricks up to class 12.5 and 15 percent for higher classes after 24 hours cold water immersion.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1077#clause-7.2"
      }
    ]
  },

  // --- CATEGORY 3: WATER SUPPLY & PIPELINE ---
  {
    isNumber: "IS 4984:2016",
    title: "High Density Polyethylene (HDPE) Pipes for Water Supply - Specification",
    category: "Piping & Water Supply",
    scope: "Covers requirements for high density polyethylene (HDPE) pressure pipes (PE 63, PE 80, PE 100) intended for municipal drinking water supply, rural water projects, and industrial lines.",
    latestVersion: "2016",
    amendments: ["Amendment 1 - 2020"],
    alliedStandards: [
      { isNumber: "IS 2530", title: "Methods of test for polyethylene molding materials", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4984",
    verifiedDate: new Date("2024-01-25T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "5.1",
        title: "Raw Material Grade PE 100",
        text: "HDPE pipe shall be manufactured from carbon black compound PE 100 with minimum required strength (MRS) of 10.0 MPa at 20 °C for 50 years design life.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4984#clause-5.1"
      },
      {
        clauseNumber: "8.1",
        title: "Hydrostatic Pressure Resistance",
        text: "The pipe shall not burst or weep when subjected to internal hydrostatic pressure test for 100 hours at 80 °C and 165 hours at 80 °C.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4984#clause-8.1"
      }
    ]
  },
  {
    isNumber: "IS 8329:2000",
    title: "Centrifugally Cast (Ductile Iron) Pipes for Water, Gas and Sewage - Specification",
    category: "Piping & Water Supply",
    scope: "Specifies requirements for centrifugally cast ductile iron (DI) pressure pipes with socket and spigot ends, socket type Class K7, K9 and K12 for potable water and underground sewage lines.",
    latestVersion: "2000",
    amendments: ["Amendment 1 - 2005", "Amendment 2 - 2012"],
    alliedStandards: [
      { isNumber: "IS 12288", title: "Code of practice for use and laying of ductile iron pipes", type: "Installation Code" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+8329",
    verifiedDate: new Date("2023-12-10T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "9.1",
        title: "Tensile Strength and Elongation of DI Pipes",
        text: "Minimum tensile strength of centrifugally cast ductile iron pipe body shall be 420 MPa, with minimum elongation at break of 10 percent.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+8329#clause-9.1"
      }
    ]
  },
  {
    isNumber: "IS 1239(Part 1):2004",
    title: "Steel Tubes, Tubulars and Other Wrought Steel Fittings - Specification",
    category: "Piping & Water Supply",
    scope: "Specifies dimensions, weights and hydrostatic pressure testing for welded and seamless mild steel Galvanized Iron (GI) tubes and black steel pipes for water, gas and fire sprinkler lines.",
    latestVersion: "2004",
    amendments: ["Amendment 1 - 2007", "Amendment 2 - 2016"],
    alliedStandards: [
      { isNumber: "IS 4736", title: "Hot-dip zinc coatings on mild steel tubes", type: "Related Standard" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239",
    verifiedDate: new Date("2023-11-20T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "8.1",
        title: "Hydrostatic Test for Steel Tubes",
        text: "Each tube shall be tested hydrostatically at the manufacturer's works to a test pressure of 5.0 MPa without showing leakage or failure.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239#clause-8.1"
      }
    ]
  },

  // --- CATEGORY 4: ELECTRICAL & SOLAR ---
  {
    isNumber: "IS 694:2010",
    title: "Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables up to 1100 V - Specification",
    category: "Electrical Infrastructure",
    scope: "Requirements for PVC insulated single-core and multi-core copper/aluminium electrical cables and flexible cords for building wiring, power distribution and lighting up to 1100 V.",
    latestVersion: "2010",
    amendments: ["Amendment 1 - 2014"],
    alliedStandards: [
      { isNumber: "IS 8130", title: "Conductors for insulated electric cables", type: "Related Standard" },
      { isNumber: "IS 5831", title: "PVC insulation and sheath of electric cables", type: "Related Standard" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+694",
    verifiedDate: new Date("2024-02-05T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "6.1",
        title: "Conductor Resistance and Annealed Copper",
        text: "Conductors shall consist of plain annealed high-conductivity copper wires complying with IS 8130. Maximum electrical resistance shall not exceed specified table limits.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+694#clause-6.1"
      },
      {
        clauseNumber: "9.2",
        title: "High Voltage Spark Test",
        text: "Cables shall withstand a high voltage spark test of 6 kV AC RMS without insulation breakdown.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+694#clause-9.2"
      }
    ]
  },
  {
    isNumber: "IS 7098(Part 1):1988",
    title: "Crosslinked Polyethylene Insulated Thermoplastic Sheathed Cables up to 1100 V",
    category: "Electrical Infrastructure",
    scope: "Covers requirements for armoured and unarmoured XLPE insulated heavy-duty electrical cables for power transmission, street lighting, industrial power networks and substations.",
    latestVersion: "1988",
    amendments: ["Amendment 1 - 1998", "Amendment 2 - 2011"],
    alliedStandards: [
      { isNumber: "IS 3975", title: "Low carbon galvanized steel wires for armouring cables", type: "Related Standard" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+7098",
    verifiedDate: new Date("2023-10-15T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "15.1",
        title: "Armour Resistance and Mechanical Protection",
        text: "Armouring shall consist of galvanized steel strip or round wire providing complete mechanical protection against soil and mechanical compaction.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+7098#clause-15.1"
      }
    ]
  },
  {
    isNumber: "IS 14286:2010",
    title: "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules - Design Qualification and Type Approval",
    category: "Renewable Energy & Solar",
    scope: "Specifies requirements for design qualification and type approval of terrestrial crystalline silicon solar photovoltaic (PV) modules suitable for prolonged outdoor climate operation.",
    latestVersion: "2010",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS/IEC 61730-1", title: "Photovoltaic module safety qualification", type: "Safety Standard" }
    ],
    certifications: ["BIS CRS Mark", "MNRE Approved"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+14286",
    verifiedDate: new Date("2024-01-18T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "10.11",
        title: "Thermal Cycling and Damp Heat Testing",
        text: "Solar PV modules shall undergo 200 thermal cycles (-40 °C to +85 °C) and 1000 hours damp heat test at 85 °C / 85% RH with power degradation less than 5 percent.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+14286#clause-10.11"
      }
    ]
  },

  // --- CATEGORY 5: FIRE SAFETY & PPE ---
  {
    isNumber: "IS 15683:2018",
    title: "Portable Fire Extinguishers - Performance and Construction - Specification",
    category: "Fire Safety",
    scope: "Specifies requirements for design, construction, hydraulic pressure testing, and fire extinguishing rating of portable fire extinguishers (ABC powder, CO2, water, foam).",
    latestVersion: "2018",
    amendments: ["Amendment 1 - 2021"],
    alliedStandards: [
      { isNumber: "IS 4947", title: "Gas cartridges for use in fire extinguishers", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15683",
    verifiedDate: new Date("2024-01-30T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "6.2",
        title: "Burst Pressure and Hydraulic Test",
        text: "The cylinder body of the extinguisher shall withstand hydraulic test pressure of 3.0 MPa for minimum 30 seconds without leakage or distortion.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15683#clause-6.2"
      }
    ]
  },
  {
    isNumber: "IS 15298(Part 2):2016",
    title: "Personal Protective Equipment - Part 2: Safety Footwear - Specification",
    category: "Safety PPE",
    scope: "Specifies basic and additional requirements for safety footwear used in industrial, civil construction and airport environments, including steel toe-cap impact resistance and penetration resistance.",
    latestVersion: "2016",
    amendments: ["Amendment 1 - 2019"],
    alliedStandards: [
      { isNumber: "IS 15298(Part 1)", title: "Test methods for footwear", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15298",
    verifiedDate: new Date("2023-12-20T00:00:00.000Z"),
    status: "active",
    isDemo: false,
    clauses: [
      {
        clauseNumber: "5.3",
        title: "Toe Protection Impact Resistance",
        text: "Safety footwear toe caps shall withstand an impact energy of minimum 200 Joules and compression load of 15 kN with clearance under the cap meeting Table 4.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15298#clause-5.3"
      }
    ]
  }
];

async function seedExpanded() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend-changes';
  console.log(`[SEED-EXPANDED] Connecting to: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  console.log('[SEED-EXPANDED] Loading multilingual embedding pipeline...');
  const extractor = await getPipeline();
  console.log('[SEED-EXPANDED] Embedding pipeline ready.');

  console.log(`[SEED-EXPANDED] Seeding ${newStandards.length} authentic BIS standards...`);

  for (const item of newStandards) {
    const textToEmbed = `${item.isNumber} ${item.title}. ${item.scope} Category: ${item.category}`.trim();
    const embedding = await generateEmbedding(textToEmbed, extractor);

    const docData = {
      ...item,
      embedding
    };

    const stdDoc = new Standard(docData);
    await stdDoc.validate(); // Computes normalizedIsNumber and baseIsNumber via pre-validate hook

    const res = await Standard.findOneAndUpdate(
      { normalizedIsNumber: stdDoc.normalizedIsNumber },
      {
        $set: {
          isNumber: stdDoc.isNumber,
          title: stdDoc.title,
          category: stdDoc.category,
          scope: stdDoc.scope,
          latestVersion: stdDoc.latestVersion,
          amendments: stdDoc.amendments,
          alliedStandards: stdDoc.alliedStandards,
          certifications: stdDoc.certifications,
          embedding: stdDoc.embedding,
          sourceUrl: stdDoc.sourceUrl,
          verifiedDate: stdDoc.verifiedDate,
          publishedOn: stdDoc.publishedOn,
          latestReviewedYear: stdDoc.latestReviewedYear,
          clauses: stdDoc.clauses,
          status: stdDoc.status,
          isDemo: false,
          baseIsNumber: stdDoc.baseIsNumber,
          normalizedIsNumber: stdDoc.normalizedIsNumber
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`  ✓ Seeded [${res.isNumber}] -> "${res.title}" (${res.category})`);
  }

  const total = await Standard.countDocuments({ isDemo: { $ne: true } });
  console.log(`\n[SEED-EXPANDED COMPLETE] Total authentic standards in catalog: ${total}`);

  await mongoose.disconnect();
  console.log('[SEED-EXPANDED] Database connection closed.');
}

seedExpanded().catch(err => {
  console.error('[SEED-EXPANDED ERROR]', err);
  process.exit(1);
});
