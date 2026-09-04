const mongoose = require('mongoose');
require('dotenv').config();
const Standard = require('./models/Standard');
const User = require('./models/User');

// Dynamically import the transformers package
async function getPipeline() {
  const { pipeline } = await import('@xenova/transformers');
  // Load the feature extraction pipeline, which generates embeddings (Multilingual)
  return await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
}

const seedData = [
  {
    isNumber: "IS 269:2015",
    title: "Ordinary Portland Cement - Specification",
    category: "Cement",
    scope: "This standard covers the manufacture and chemical and physical requirements of ordinary Portland cement (OPC) of 33, 43 and 53 grades.",
    latestVersion: "2015",
    amendments: ["Amendment 1 - 2017", "Amendment 2 - 2019"],
    alliedStandards: [
      { isNumber: "IS 4031", title: "Methods of physical tests for hydraulic cement", type: "Test Method" },
      { isNumber: "IS 4032", title: "Method of chemical analysis of hydraulic cement", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+269",
    verifiedDate: new Date("2024-01-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Field of Application",
        text: "Covers the manufacture and chemical and physical requirements of ordinary Portland cement (OPC) of 33, 43 and 53 grades.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+269#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Chemical Composition Criteria",
        text: "The ratio of percentage of lime to percentages of silica, alumina and iron oxide shall be not less than 0.66 and not more than 1.02. Insoluble residue shall not exceed 5.0 percent.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+269#clause-4.1"
      },
      {
        clauseNumber: "5.4",
        title: "Compressive Strength Requirements",
        text: "Specifies minimum compressive strength at 72 hours, 168 hours, and 672 hours for 33, 43, and 53 grade cement.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+269#clause-5.4"
      },
      {
        clauseNumber: "9.2",
        title: "Packaging and Mandatory BIS ISI Marking",
        text: "Cement bags shall be marked with grade, net mass, month/year of manufacture, and the standard BIS Certification ISI Mark.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+269#clause-9.2"
      }
    ]
  },
  {
    isNumber: "IS 1786:2008",
    title: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
    category: "Steel",
    scope: "Specifies requirements for high strength deformed steel bars and wires for concrete reinforcement, covering grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D and Fe 600.",
    latestVersion: "2008",
    amendments: ["Amendment 1 - 2012"],
    alliedStandards: [
      { isNumber: "IS 226", title: "Structural steel", type: "Related Product" },
      { isNumber: "IS 2062", title: "Hot rolled medium and high tensile structural steel", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1786",
    verifiedDate: new Date("2024-01-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Product Specification",
        text: "Specifies requirements for high strength deformed steel bars and wires for concrete reinforcement in grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D and Fe 600.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1786#clause-1.1"
      },
      {
        clauseNumber: "3.2",
        title: "Chemical Composition and Maximum Carbon Equivalent",
        text: "Limits carbon, sulphur, and phosphorus concentrations and mandates maximum carbon equivalent values for weldability.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1786#clause-3.2"
      },
      {
        clauseNumber: "7.1",
        title: "Mechanical Properties and Yield Strength",
        text: "Specifies 0.2 percent proof stress/yield stress, tensile strength, and minimum percentage elongation for Fe 415 through Fe 600 grades.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1786#clause-7.1"
      },
      {
        clauseNumber: "8.3",
        title: "Bend and Rebend Test Compliance",
        text: "Requires standard test piece to withstand bending through 180 degrees without transverse cracking on the outer bent surface.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1786#clause-8.3"
      }
    ]
  },
  {
    isNumber: "IS 302-1:2008",
    title: "Safety of Household and Similar Electrical Appliances",
    category: "Electrical Appliances",
    scope: "Deals with the safety of electrical appliances for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances and 415 V for other appliances.",
    latestVersion: "2008",
    amendments: ["Amendment 1 - 2013", "Amendment 2 - 2015"],
    alliedStandards: [
      { isNumber: "IS 1293", title: "Plugs and socket-outlets of rated voltage up to and including 250 volts", type: "Safety" }
    ],
    certifications: ["BIS ISI Mark", "CRS"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+302-1",
    verifiedDate: new Date("2024-01-20T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Voltage Limits",
        text: "Deals with the safety of electrical appliances for household and similar purposes with rated voltage not exceeding 250 V single-phase and 415 V other appliances.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+302-1#clause-1.1"
      },
      {
        clauseNumber: "8.1",
        title: "Protection Against Electric Shock",
        text: "Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+302-1#clause-8.1"
      },
      {
        clauseNumber: "13.2",
        title: "Leakage Current and Electric Strength at Operating Temperature",
        text: "Leakage current shall not be excessive and dielectric strength shall be adequate under steady normal operating conditions.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+302-1#clause-13.2"
      },
      {
        clauseNumber: "22.11",
        title: "Construction and Mechanical Hazards",
        text: "Moving parts shall be positioned or enclosed to provide adequate protection against personal injury during normal use.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+302-1#clause-22.11"
      }
    ]
  },
  {
    isNumber: "IS 16102(Part 1):2012",
    title: "Self-Ballasted LED Lamps for General Lighting Services",
    category: "LED Lighting",
    scope: "Specifies the safety and interchangeability requirements, together with the test methods and conditions, required to show compliance of LED-lamps with integrated means for stable operation.",
    latestVersion: "2012",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 16102(Part 2)", title: "Self-Ballasted LED Lamps - Performance Requirements", type: "Test Method" },
      { isNumber: "IS 16103", title: "LED Modules for General Lighting", type: "Related Product" }
    ],
    certifications: ["CRS"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16102(Part+1)",
    verifiedDate: new Date("2024-02-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Application",
        text: "Specifies the safety and interchangeability requirements, together with the test methods and conditions, required to show compliance of LED-lamps with integrated means for stable operation.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16102(Part+1)#clause-1.1"
      },
      {
        clauseNumber: "6.1",
        title: "Interchangeability and Dimensions",
        text: "Lamps shall conform to standard cap dimensions and gauges specified in relevant international and Indian standard sheets.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16102(Part+1)#clause-6.1"
      },
      {
        clauseNumber: "8.2",
        title: "Insulation Resistance and Dielectric Withstand",
        text: "Insulation resistance between current-carrying metal parts and accessible parts shall be not less than 4 MOhm.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16102(Part+1)#clause-8.2"
      }
    ]
  },
  {
    isNumber: "IS 15822:2008",
    title: "Textiles - High Visibility Warning Clothing",
    category: "Textiles",
    scope: "Specifies requirements for high visibility warning clothing, capable of signaling the user's presence visually. Intended to provide conspicuity of the user in hazardous situations under any light conditions.",
    latestVersion: "2008",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 15823", title: "Textiles - Method of test for high visibility warning clothing", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15822",
    verifiedDate: new Date("2024-02-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Conspicuity",
        text: "Specifies requirements for high visibility warning clothing, capable of signaling the user's presence visually under any light conditions.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15822#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Photometric Performance of Retroreflective Material",
        text: "Specifies the minimum coefficient of retroreflection for retroreflective material when illuminated at various observation angles.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15822#clause-4.1"
      },
      {
        clauseNumber: "5.2",
        title: "Colorimetric and Luminance Factors",
        text: "Defines chromaticity coordinates and luminance factor requirements for background fluorescent materials.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+15822#clause-5.2"
      }
    ]
  },
  {
    isNumber: "IS 16982:2018",
    title: "Stainless Steel Cookware - Specification",
    category: "Kitchenware",
    scope: "Covers the requirements for stainless steel cookware including utensils and vessels used for cooking and serving food.",
    latestVersion: "2018",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 5522", title: "Stainless steel sheets and strips for utensils", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16982",
    verifiedDate: new Date("2024-03-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Applicability",
        text: "Covers the requirements for stainless steel cookware including utensils and vessels used for cooking and serving food.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16982#clause-1.1"
      },
      {
        clauseNumber: "4.2",
        title: "Material Grades and Food Contact Safety",
        text: "Cookware shall be fabricated from food-grade stainless steel conforming to specified austenitic or ferritic grades.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16982#clause-4.2"
      },
      {
        clauseNumber: "6.3",
        title: "Thermal Shock and Handle Attachment Strength",
        text: "Handles and attachments shall withstand specified torque, tensile stress, and repeated thermal cycling without loosening or failure.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+16982#clause-6.3"
      }
    ]
  },
  {
    isNumber: "IS 9873(Part 1):2019",
    title: "Safety of Toys - Part 1: Safety Aspects Related to Mechanical and Physical Properties",
    category: "Toys",
    scope: "Specifies acceptable criteria for structural characteristics of toys, such as shape, size, contour, spacing as well as acceptable criteria for properties peculiar to certain categories of toys.",
    latestVersion: "2019",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 9873(Part 2)", title: "Safety of Toys - Flammability", type: "Safety" },
      { isNumber: "IS 9873(Part 3)", title: "Safety of Toys - Migration of certain elements", type: "Safety" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+9873(Part+1)",
    verifiedDate: new Date("2024-03-10T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Mechanical Safety",
        text: "Specifies acceptable criteria for structural characteristics of toys, such as shape, size, contour, spacing, and properties peculiar to certain categories of toys.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+9873(Part+1)#clause-1.1"
      },
      {
        clauseNumber: "4.4",
        title: "Small Parts and Choking Hazard Prevention",
        text: "Toys intended for children under 36 months shall not contain or detach small parts capable of fitting entirely inside the small parts cylinder.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+9873(Part+1)#clause-4.4"
      },
      {
        clauseNumber: "4.8",
        title: "Edges, Points and Projections",
        text: "Accessible sharp edges and points shall not pose laceration or puncture hazards when tested according to specified sharp edge testers.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+9873(Part+1)#clause-4.8"
      }
    ]
  },
  {
    isNumber: "IS 4151:2015",
    title: "Protective Helmets for Two Wheeler Riders - Specification",
    category: "Helmets",
    scope: "Specifies the requirements regarding the material, construction, workmanship, finish, and performance for protective helmets for everyday use by two wheeler riders.",
    latestVersion: "2015",
    amendments: ["Amendment 1 - 2020"],
    alliedStandards: [
      { isNumber: "IS 2553(Part 2)", title: "Safety glass for road vehicles", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4151",
    verifiedDate: new Date("2024-03-25T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Application",
        text: "Specifies the requirements regarding the material, construction, workmanship, finish, and performance for protective helmets for everyday use by two wheeler riders.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4151#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Shock Absorption and Impact Deceleration",
        text: "The helmet shall attenuate impact energy such that peak headform acceleration does not exceed 300g during drop tests onto flat and kerbstone anvils.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4151#clause-5.1"
      },
      {
        clauseNumber: "6.2",
        title: "Retention System and Chin Strap Strength",
        text: "Retention system components shall not undergo dynamic displacement exceeding 35 mm under specified drop load tests.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4151#clause-6.2"
      }
    ]
  },
  {
    isNumber: "IS 1445:1977",
    title: "Porcelain Insulators for Overhead Power Lines with a Nominal Voltage up to and including 1000 V",
    category: "Electrical",
    scope: "Specifies requirements and tests for porcelain insulators for overhead power lines with a nominal voltage up to and including 1000 V.",
    latestVersion: "1977",
    amendments: [],
    alliedStandards: [],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1445",
    verifiedDate: new Date("2024-04-05T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Nominal Voltage",
        text: "Specifies requirements and tests for porcelain insulators for overhead power lines with a nominal voltage up to and including 1000 V.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1445#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Porcelain Quality and Glazing",
        text: "Porcelain shall be sound, thoroughly vitrified, free from defects and uniformly glazed brown or white.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1445#clause-4.1"
      },
      {
        clauseNumber: "6.2",
        title: "Mechanical Failing Load and Flashover Voltage",
        text: "Insulators shall withstand specified transverse mechanical failing load and dry/wet one-minute power frequency flashover voltages.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1445#clause-6.2"
      }
    ]
  },
  {
    isNumber: "IS 374:2019",
    title: "Electric Ceiling Type Fans and Regulators - Specification",
    category: "Electrical Appliances",
    scope: "Specifies the requirements and methods of tests for electric ceiling type fans and their associated regulators intended for use on single-phase ac circuits at voltages not exceeding 250 V.",
    latestVersion: "2019",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 1169", title: "Electric pedestal type fans and regulators", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+374",
    verifiedDate: new Date("2024-04-18T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Field of Application",
        text: "Specifies the requirements and methods of tests for electric ceiling type fans and their associated regulators intended for use on single-phase ac circuits at voltages not exceeding 250 V.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+374#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Air Delivery and Service Value",
        text: "Fans shall deliver the minimum air delivery (m3/min) specified for each sweep size, with energy service value meeting star rating criteria.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+374#clause-5.1"
      },
      {
        clauseNumber: "8.4",
        title: "Suspension System and Safety Fastening",
        text: "Ceiling fan downrods, shackles, and clamps shall incorporate secondary safety wire or locking mechanisms preventing fall hazards.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+374#clause-8.4"
      }
    ]
  },
  // ─── 18 ADDITIONAL REAL BIS STANDARDS ────────────────────────────────────────
  {
    isNumber: "IS 73:2013",
    title: "Paving Bitumen - Specification",
    category: "Roads & Highways",
    scope: "Specifies requirements for paving bitumen derived from petroleum, used for road construction, airfield pavements and other paving applications. Covers viscosity grades VG-10, VG-20, VG-30 and VG-40.",
    latestVersion: "2013",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 217", title: "Cutback bitumen", type: "Related Product" },
      { isNumber: "IS 1205", title: "Methods for testing tar and bituminous materials", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73",
    verifiedDate: new Date("2024-03-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Paving Grade Bitumen",
        text: "Specifies requirements for paving bitumen (viscosity grades VG-10, VG-20, VG-30, VG-40) derived from petroleum for road and airfield pavement construction.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73#clause-1.1"
      },
      {
        clauseNumber: "4.2",
        title: "Absolute Viscosity at 60 degrees C",
        text: "Absolute viscosity measured at 60 degrees C shall meet minimum values of 800 Poise for VG-10 to 3200 Poise for VG-40 grade as per IS 1206 Part 2.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73#clause-4.2"
      },
      {
        clauseNumber: "5.1",
        title: "Flash Point and Safety Requirements",
        text: "Flash point determined by Cleveland open cup method shall be not less than 220 degrees C for all paving bitumen grades.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+73#clause-5.1"
      }
    ]
  },
  {
    isNumber: "IS 383:2016",
    title: "Coarse and Fine Aggregates for Concrete - Specification",
    category: "Civil Engineering",
    scope: "Specifies requirements for coarse and fine aggregates obtained by crushing natural stone, gravel, slag, or manufactured from sand for use in concrete. Includes crushed stone, gravel, and natural sand.",
    latestVersion: "2016",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 2386", title: "Methods of test for aggregates for concrete", type: "Test Method" },
      { isNumber: "IS 516", title: "Method of test for strength of concrete", type: "Test Method" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383",
    verifiedDate: new Date("2024-03-10T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Classification of Aggregates",
        text: "Specifies requirements for coarse and fine natural and manufactured aggregates for concrete, classifying them into natural, crushed, and manufactured categories.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383#clause-1.1"
      },
      {
        clauseNumber: "4.3",
        title: "Grading Requirements for Fine Aggregate",
        text: "Fine aggregate shall be graded within Zone I to Zone IV grading bands as per sieve analysis test, controlling particle size distribution for concrete workability.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383#clause-4.3"
      },
      {
        clauseNumber: "6.1",
        title: "Deleterious Materials and Organic Impurities",
        text: "Maximum permissible limits of clay, silt and other deleterious materials in aggregates: 3 percent for coarse aggregate and 15 percent for fine aggregate by mass.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+383#clause-6.1"
      }
    ]
  },
  {
    isNumber: "IS 456:2000",
    title: "Plain and Reinforced Concrete - Code of Practice",
    category: "Civil Engineering",
    scope: "Covers the general structural use of plain and reinforced concrete. Deals with materials, workmanship, inspection and testing of concrete structures. Applicable to buildings, bridges and all civil structures.",
    latestVersion: "2000",
    amendments: ["Amendment 1 - 2005", "Amendment 2 - 2013", "Amendment 3 - 2019"],
    alliedStandards: [
      { isNumber: "IS 269", title: "Ordinary Portland Cement", type: "Material" },
      { isNumber: "IS 1786", title: "High strength deformed steel bars", type: "Material" },
      { isNumber: "IS 383", title: "Aggregates for concrete", type: "Material" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456",
    verifiedDate: new Date("2024-03-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "6.1",
        title: "Characteristic Strength and Grade Designation",
        text: "Concrete shall be designated by grades M10 to M80, representing minimum characteristic compressive strength in N/mm2 at 28 days.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456#clause-6.1"
      },
      {
        clauseNumber: "8.2",
        title: "Cover to Reinforcement",
        text: "Nominal cover to reinforcement based on exposure conditions: mild 25mm, moderate 30mm, severe 45mm, very severe 50mm, extreme 75mm.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456#clause-8.2"
      },
      {
        clauseNumber: "13.1",
        title: "Water-Cement Ratio for Durability",
        text: "Maximum free water-cement ratio shall not exceed 0.45 for moderate exposure and 0.40 for severe exposure to ensure long-term durability.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+456#clause-13.1"
      }
    ]
  },
  {
    isNumber: "IS 1239(Part 1):2004",
    title: "Mild Steel Tubes, Tubulars and Other Wrought Steel Fittings - Specification",
    category: "Pipes & Plumbing",
    scope: "Specifies requirements for mild steel tubes in light, medium and heavy classes for water, gas and steam services. Also covers threaded fittings for use with mild steel tubes.",
    latestVersion: "2004",
    amendments: ["Amendment 1 - 2009"],
    alliedStandards: [
      { isNumber: "IS 1239(Part 2)", title: "Mild Steel Tubulars and Fittings", type: "Related Product" },
      { isNumber: "IS 3589", title: "Steel pipes for water and sewage", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239",
    verifiedDate: new Date("2024-03-20T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Mild Steel Tubes for Water and Gas",
        text: "Specifies requirements for mild steel tubes in light, medium and heavy classes for water supply, gas distribution, and steam service pipelines.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239#clause-1.1"
      },
      {
        clauseNumber: "5.2",
        title: "Wall Thickness and Mass Tolerances",
        text: "Wall thickness for medium grade tubes 15mm to 150mm NB ranges from 2.65mm to 5.0mm with tolerance of plus or minus 12.5 percent on individual tube measurements.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239#clause-5.2"
      },
      {
        clauseNumber: "7.1",
        title: "Hydraulic Test Pressure",
        text: "All tubes shall withstand the hydraulic test at the specified test pressure without showing signs of leakage, sweating or rupture.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1239#clause-7.1"
      }
    ]
  },
  {
    isNumber: "IS 458:2003",
    title: "Precast Concrete Pipes (With and Without Reinforcement) - Specification",
    category: "Water & Sewerage",
    scope: "Specifies requirements for precast concrete pipes with and without reinforcement for use in drainage, irrigation, water supply and sewerage. Covers pipes of internal diameter 80mm to 1800mm.",
    latestVersion: "2003",
    amendments: ["Amendment 1 - 2010"],
    alliedStandards: [
      { isNumber: "IS 783", title: "Code of practice for laying concrete pipes", type: "Related Practice" },
      { isNumber: "IS 3597", title: "Methods of test for concrete pipes", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+458",
    verifiedDate: new Date("2024-04-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Precast Concrete Pipes for Drainage and Sewerage",
        text: "Specifies requirements for precast concrete pipes (NP1 to NP4 classes) and reinforced concrete pipes for drainage, irrigation, water supply and sewerage infrastructure.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+458#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Three-Edge Bearing Test Load",
        text: "Pipes shall withstand the proof load without cracking during the three-edge bearing strength test. Load is calculated as pipe diameter multiplied by the class factor.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+458#clause-5.1"
      },
      {
        clauseNumber: "6.2",
        title: "Hydrostatic Test for Water Tightness",
        text: "All concrete pipes shall be tested by internal hydrostatic pressure with no leakage permitted through the pipe wall for at least 2 minutes under the specified pressure.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+458#clause-6.2"
      }
    ]
  },
  {
    isNumber: "IS 2932:2021",
    title: "Enamel, Synthetic, Exterior (a) Undercoating, (b) Finishing - Specification",
    category: "Paints & Coatings",
    scope: "Specifies requirements for synthetic enamel paints for exterior use comprising undercoating and finishing coats for protection and decoration of metal and wood surfaces exposed to weather.",
    latestVersion: "2021",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 101", title: "Methods of sampling and testing of paints, varnishes and related products", type: "Test Method" },
      { isNumber: "IS 5", title: "Colours for ready mixed paints and enamels", type: "Related Standard" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2932",
    verifiedDate: new Date("2024-04-05T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Exterior Synthetic Enamel Paint",
        text: "Specifies requirements for synthetic enamel paints for exterior applications on metals and wood surfaces providing protection against weathering and corrosion.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2932#clause-1.1"
      },
      {
        clauseNumber: "4.2",
        title: "Gloss and Finish Properties",
        text: "Finishing coat when dried shall have a high-gloss finish with no sagging, wrinkling or running defects. Specular gloss at 60 degrees shall be not less than 90.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2932#clause-4.2"
      },
      {
        clauseNumber: "5.3",
        title: "Accelerated Weathering Resistance",
        text: "After 500 hours of accelerated weathering test, the paint shall show no cracking, flaking or blistering and shall retain satisfactory gloss retention.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2932#clause-5.3"
      }
    ]
  },
  {
    isNumber: "IS 4770:1991",
    title: "Rubber Gloves - Electrical Purposes - Specification",
    category: "Personal Protective Equipment",
    scope: "Specifies requirements for natural rubber gloves for electrical insulation protection during electrical work. Covers classes 00, 0, 1, 2, 3 and 4 based on maximum use voltage.",
    latestVersion: "1991",
    amendments: ["Amendment 1 - 2007"],
    alliedStandards: [
      { isNumber: "IS 6994(Part 1)", title: "Rubber leather safety gloves", type: "Related PPE" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4770",
    verifiedDate: new Date("2024-04-10T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Electrical Insulating Rubber Gloves",
        text: "Specifies requirements for rubber gloves providing electrical insulation protection. Classes range from Class 00 at 500V AC maximum use voltage to Class 4 at 36000V AC maximum use voltage.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4770#clause-1.1"
      },
      {
        clauseNumber: "7.1",
        title: "Electrical Test - AC Proof Voltage",
        text: "Gloves shall withstand the specified AC proof voltage test for 3 minutes without breakdown, measured by leakage current not exceeding the limit.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+4770#clause-7.1"
      }
    ]
  },
  {
    isNumber: "IS 2062:2011",
    title: "Hot Rolled Medium and High Tensile Structural Steel - Specification",
    category: "Steel",
    scope: "Specifies requirements for hot rolled steel plates, sections and bars for structural purposes in bridges, buildings, transmission towers and general structural applications.",
    latestVersion: "2011",
    amendments: ["Amendment 1 - 2014"],
    alliedStandards: [
      { isNumber: "IS 1786", title: "High strength deformed steel bars", type: "Related Product" },
      { isNumber: "IS 800", title: "Code of Practice for General Construction in Steel", type: "Related Practice" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2062",
    verifiedDate: new Date("2024-04-12T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Grades of Structural Steel",
        text: "Covers hot rolled steel products in grades E165, E250, E300, E350, E410 and E450 for use in structural steel work, bridges and general construction.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2062#clause-1.1"
      },
      {
        clauseNumber: "5.2",
        title: "Tensile Properties and Elongation",
        text: "Yield strength, tensile strength and percentage elongation shall conform to requirements specified for each grade, tested in accordance with IS 1608.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2062#clause-5.2"
      },
      {
        clauseNumber: "6.1",
        title: "Chemical Composition for Weldability",
        text: "Maximum permissible carbon, sulphur, phosphorus and carbon equivalent values specified for each grade to ensure weldability and ductility in structural applications.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2062#clause-6.1"
      }
    ]
  },
  {
    isNumber: "IS 1554(Part 1):1988",
    title: "PVC Insulated Heavy Duty Electric Cables for Working Voltages up to 1100 V",
    category: "Electrical Cables",
    scope: "Specifies requirements for PVC insulated electric cables for working voltages up to 1100 V used in general purpose power wiring in buildings, industrial installations and switchboards.",
    latestVersion: "1988",
    amendments: ["Amendment 1 - 1994"],
    alliedStandards: [
      { isNumber: "IS 694", title: "PVC insulated cables for working voltage up to 1100V", type: "Related Product" },
      { isNumber: "IS 5831", title: "Specification for PVC insulation and sheath of electric cables", type: "Material" }
    ],
    certifications: ["BIS ISI Mark", "CRS"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1554",
    verifiedDate: new Date("2024-04-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - PVC Power Cables up to 1100V",
        text: "Specifies requirements for PVC insulated and PVC sheathed cables with copper or aluminium conductors for working voltages up to 1100V in buildings and industrial wiring.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1554#clause-1.1"
      },
      {
        clauseNumber: "7.2",
        title: "High Voltage Dielectric Test",
        text: "Completed cables shall withstand 3000V AC rms for 5 minutes applied between conductors with all other conductors earthed, without insulation breakdown.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1554#clause-7.2"
      }
    ]
  },
  {
    isNumber: "IS 12330:1988",
    title: "Sulphate Resisting Portland Cement - Specification",
    category: "Cement",
    scope: "Specifies requirements for sulphate resisting Portland cement for use in concrete exposed to severe sulphate conditions such as marine environments, sewage systems and alkaline soil.",
    latestVersion: "1988",
    amendments: ["Amendment 1 - 1999"],
    alliedStandards: [
      { isNumber: "IS 269", title: "Ordinary Portland Cement", type: "Related Product" },
      { isNumber: "IS 4031", title: "Methods of physical tests for hydraulic cement", type: "Test Method" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+12330",
    verifiedDate: new Date("2024-04-20T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Sulphate Resisting Cement for Aggressive Environments",
        text: "Specifies requirements for sulphate resisting Portland cement for use in foundations, marine structures and sewage systems where aggressive sulphate attack is expected.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+12330#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Tricalcium Aluminate Content Limit",
        text: "The content of tricalcium aluminate shall not exceed 5 percent by mass. This is the key requirement conferring sulphate resistance to the cement.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+12330#clause-4.1"
      }
    ]
  },
  {
    isNumber: "IS 10500:2012",
    title: "Drinking Water - Specification",
    category: "Water Quality & Testing",
    scope: "Specifies quality requirements of water intended for human consumption (drinking water). Covers physical, chemical and microbiological parameters with acceptable and permissible limits.",
    latestVersion: "2012",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 3025", title: "Methods of sampling and test for water and wastewater", type: "Test Method" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+10500",
    verifiedDate: new Date("2024-04-25T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "4.1",
        title: "Physical Requirements - Turbidity and Colour",
        text: "Turbidity of drinking water shall not exceed 1 NTU (acceptable) and 5 NTU (permissible). True colour shall not exceed 5 (acceptable) and 15 Hazen units (permissible).",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+10500#clause-4.1"
      },
      {
        clauseNumber: "4.3",
        title: "Bacteriological Safety Requirements",
        text: "E. coli or thermotolerant coliform bacteria shall not be detectable in any 100ml sample. Total coliform count shall be zero per 100ml in treated piped water supply.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+10500#clause-4.3"
      }
    ]
  },
  {
    isNumber: "IS 1893(Part 1):2016",
    title: "Criteria for Earthquake Resistant Design of Structures - General Provisions and Buildings",
    category: "Civil Engineering",
    scope: "Deals with earthquake resistant design of structures. Covers general provisions for buildings, industrial structures and infrastructure. Specifies seismic zone map, design spectrum and structural detailing requirements.",
    latestVersion: "2016",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 456", title: "Plain and Reinforced Concrete", type: "Related Practice" },
      { isNumber: "IS 13920", title: "Ductile detailing of reinforced concrete structures", type: "Related Practice" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1893",
    verifiedDate: new Date("2024-05-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "3.1",
        title: "Seismic Zone Classification Map of India",
        text: "India is classified into four seismic zones II to V based on earthquake intensity. Zone V is most severe, covering parts of Himalayas, north-east India, and Andaman islands.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1893#clause-3.1"
      },
      {
        clauseNumber: "6.4",
        title: "Design Horizontal Seismic Coefficient",
        text: "Seismic coefficient Ah depends on zone factor Z, importance factor I, response reduction factor R, and spectral acceleration Sa/g. Formula: Ah = (Z/2) x (I/R) x (Sa/g).",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1893#clause-6.4"
      }
    ]
  },
  {
    isNumber: "IS 1367(Part 1):2002",
    title: "Technical Supply Conditions for Threaded Steel Fasteners - General Requirements",
    category: "Fasteners & Hardware",
    scope: "Specifies general requirements for threaded steel fasteners including bolts, screws, studs and nuts for mechanical and structural applications in machinery, equipment and civil structures.",
    latestVersion: "2002",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 1363", title: "Hexagon head bolts, screws and nuts", type: "Related Product" },
      { isNumber: "IS 1364", title: "Hexagon head bolts and screws", type: "Related Product" }
    ],
    certifications: ["BIS ISI Mark"],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1367",
    verifiedDate: new Date("2024-05-05T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope - Threaded Steel Fasteners",
        text: "Specifies general technical requirements for threaded steel fasteners covering bolts, screws, studs and nuts including mechanical properties, materials and dimensional tolerances.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1367#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Property Classes and Proof Load Stress",
        text: "Fasteners are classified into property classes 4.6, 5.6, 8.8, 10.9 and 12.9 defining minimum tensile strength and yield stress requirements for structural bolted connections.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+1367#clause-5.1"
      }
    ]
  },
  {
    isNumber: "IS 2911(Part 1):2010",
    title: "Design and Construction of Pile Foundations - Driven Cast In-Situ Concrete Piles",
    category: "Civil Engineering",
    scope: "Covers the design and construction of driven cast in-situ concrete piles for foundations of buildings, bridges, industrial structures and other heavy civil infrastructure works.",
    latestVersion: "2010",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 456", title: "Plain and Reinforced Concrete", type: "Material Standard" },
      { isNumber: "IS 1893", title: "Earthquake resistant design of structures", type: "Related Practice" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2911",
    verifiedDate: new Date("2024-05-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "5.1",
        title: "Concrete Grade for Pile Construction",
        text: "Concrete used for piles shall be of minimum grade M25 for non-aggressive soils and M30 for aggressive environments as per IS 456.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2911#clause-5.1"
      },
      {
        clauseNumber: "6.3",
        title: "Pile Load Test Requirements",
        text: "Routine pile load tests shall be conducted on a minimum of 0.5 percent of total piles at site. Initial test load shall be 2.5 times the safe load capacity.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+2911#clause-6.3"
      }
    ]
  },
  {
    isNumber: "IS 11592:2000",
    title: "Selection and Design of Belt Conveyors - Code of Practice",
    category: "Mechanical Equipment",
    scope: "Provides guidelines and code of practice for selection and design of belt conveyor systems for bulk material handling in mining, cement plants, power stations and material handling industries.",
    latestVersion: "2000",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 1370", title: "Specification for conveyor and elevator belting", type: "Related Product" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+11592",
    verifiedDate: new Date("2024-05-25T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "4.1",
        title: "Belt Tension Calculation Method",
        text: "Effective tension for belt conveyor design shall account for material weight, belt weight, idler friction, gradient resistance and acceleration forces along the conveyor.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+11592#clause-4.1"
      },
      {
        clauseNumber: "6.2",
        title: "Idler Spacing and Trough Angle Selection",
        text: "Idler spacing on carrying side shall be selected based on belt width, material density and lump size. Standard trough angles of 20, 35 and 45 degrees are specified.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+11592#clause-6.2"
      }
    ]
  },
  {
    isNumber: "IS 14489:1998",
    title: "Code of Practice on Occupational Safety and Health Audit",
    category: "Safety & Occupational Health",
    scope: "Specifies code of practice for conducting occupational safety and health audits in industrial establishments, including hazard identification, risk assessment and safety corrective measures.",
    latestVersion: "1998",
    amendments: [],
    alliedStandards: [
      { isNumber: "IS 15001", title: "Occupational health and safety management systems", type: "Related Standard" }
    ],
    certifications: [],
    sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+14489",
    verifiedDate: new Date("2024-05-20T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "4.1",
        title: "Audit Scope and Objectives",
        text: "Occupational safety and health audit shall cover physical work environment, work processes, emergency preparedness, PPE adequacy, and statutory compliance with Factories Act.",
        sourceUrl: "https://standards.bis.gov.in/website/know-your-standards?searchTerm=IS+14489#clause-4.1"
      }
    ]
  },
  // ─── END OF ADDITIONAL REAL BIS STANDARDS ──────────────────────────────────
  {
    "isNumber": "DEMO-IS-30001",
    "title": "Prototype Specification for Power Cables - Variant 1",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for power cables. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30002",
    "title": "Prototype Specification for Power Cables - Variant 2",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for power cables. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30003",
    "title": "Prototype Specification for Distribution Equipment - Variant 1",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for distribution equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30004",
    "title": "Prototype Specification for Distribution Equipment - Variant 2",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for distribution equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30005",
    "title": "Prototype Specification for Switchgear - Variant 1",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for switchgear. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30006",
    "title": "Prototype Specification for Switchgear - Variant 2",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for switchgear. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30007",
    "title": "Prototype Specification for Lighting Equipment - Variant 1",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for lighting equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30008",
    "title": "Prototype Specification for Lighting Equipment - Variant 2",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for lighting equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30009",
    "title": "Prototype Specification for Earthing Equipment - Variant 1",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for earthing equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30010",
    "title": "Prototype Specification for Earthing Equipment - Variant 2",
    "category": "Electrical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for earthing equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30011",
    "title": "Prototype Specification for Construction Cement - Variant 1",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for construction cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30012",
    "title": "Prototype Specification for Construction Cement - Variant 2",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for construction cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30013",
    "title": "Prototype Specification for Special Purpose Cement - Variant 1",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for special purpose cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30014",
    "title": "Prototype Specification for Special Purpose Cement - Variant 2",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for special purpose cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30015",
    "title": "Prototype Specification for Hydraulic Cement - Variant 1",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for hydraulic cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30016",
    "title": "Prototype Specification for Hydraulic Cement - Variant 2",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for hydraulic cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30017",
    "title": "Prototype Specification for Masonry Cement - Variant 1",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for masonry cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30018",
    "title": "Prototype Specification for Masonry Cement - Variant 2",
    "category": "Cement",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for masonry cement. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30019",
    "title": "Prototype Specification for Drinking Water Equipment - Variant 1",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for drinking water equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30020",
    "title": "Prototype Specification for Drinking Water Equipment - Variant 2",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for drinking water equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30021",
    "title": "Prototype Specification for Water Treatment - Variant 1",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for water treatment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30022",
    "title": "Prototype Specification for Water Treatment - Variant 2",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for water treatment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30023",
    "title": "Prototype Specification for Water Storage - Variant 1",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for water storage. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30024",
    "title": "Prototype Specification for Water Storage - Variant 2",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for water storage. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30025",
    "title": "Prototype Specification for Filtration Equipment - Variant 1",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for filtration equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30026",
    "title": "Prototype Specification for Filtration Equipment - Variant 2",
    "category": "Water",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for filtration equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30027",
    "title": "Prototype Specification for Structural Steel - Variant 1",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for structural steel. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30028",
    "title": "Prototype Specification for Structural Steel - Variant 2",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for structural steel. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30029",
    "title": "Prototype Specification for Steel Bars - Variant 1",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel bars. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30030",
    "title": "Prototype Specification for Steel Bars - Variant 2",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel bars. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30031",
    "title": "Prototype Specification for Steel Sections - Variant 1",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel sections. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30032",
    "title": "Prototype Specification for Steel Sections - Variant 2",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel sections. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30033",
    "title": "Prototype Specification for Steel Components - Variant 1",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30034",
    "title": "Prototype Specification for Steel Components - Variant 2",
    "category": "Steel",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for steel components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30035",
    "title": "Prototype Specification for Industrial Pumps - Variant 1",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for industrial pumps. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30036",
    "title": "Prototype Specification for Industrial Pumps - Variant 2",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for industrial pumps. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30037",
    "title": "Prototype Specification for Industrial Valves - Variant 1",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for industrial valves. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30038",
    "title": "Prototype Specification for Industrial Valves - Variant 2",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for industrial valves. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30039",
    "title": "Prototype Specification for Bearings - Variant 1",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for bearings. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30040",
    "title": "Prototype Specification for Bearings - Variant 2",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for bearings. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30041",
    "title": "Prototype Specification for Fasteners - Variant 1",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for fasteners. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30042",
    "title": "Prototype Specification for Fasteners - Variant 2",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for fasteners. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30043",
    "title": "Prototype Specification for Welding Equipment - Variant 1",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for welding equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30044",
    "title": "Prototype Specification for Welding Equipment - Variant 2",
    "category": "Mechanical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for welding equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30045",
    "title": "Prototype Specification for Packaged Food - Variant 1",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for packaged food. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30046",
    "title": "Prototype Specification for Packaged Food - Variant 2",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for packaged food. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30047",
    "title": "Prototype Specification for Dairy Products - Variant 1",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for dairy products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30048",
    "title": "Prototype Specification for Dairy Products - Variant 2",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for dairy products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30049",
    "title": "Prototype Specification for Edible Oils - Variant 1",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for edible oils. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30050",
    "title": "Prototype Specification for Edible Oils - Variant 2",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for edible oils. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30051",
    "title": "Prototype Specification for Food Packaging - Variant 1",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for food packaging. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30052",
    "title": "Prototype Specification for Food Packaging - Variant 2",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for food packaging. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30053",
    "title": "Prototype Specification for Grain Products - Variant 1",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for grain products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30054",
    "title": "Prototype Specification for Grain Products - Variant 2",
    "category": "Food",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for grain products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30055",
    "title": "Prototype Specification for Medical Equipment - Variant 1",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for medical equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30056",
    "title": "Prototype Specification for Medical Equipment - Variant 2",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for medical equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30057",
    "title": "Prototype Specification for Medical Disposables - Variant 1",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for medical disposables. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30058",
    "title": "Prototype Specification for Medical Disposables - Variant 2",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for medical disposables. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30059",
    "title": "Prototype Specification for Protective Equipment - Variant 1",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for protective equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30060",
    "title": "Prototype Specification for Protective Equipment - Variant 2",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for protective equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30061",
    "title": "Prototype Specification for Sterilization Equipment - Variant 1",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for sterilization equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30062",
    "title": "Prototype Specification for Sterilization Equipment - Variant 2",
    "category": "Medical",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for sterilization equipment. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30063",
    "title": "Prototype Specification for Vehicle Components - Variant 1",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for vehicle components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30064",
    "title": "Prototype Specification for Vehicle Components - Variant 2",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for vehicle components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30065",
    "title": "Prototype Specification for Automotive Lighting - Variant 1",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for automotive lighting. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30066",
    "title": "Prototype Specification for Automotive Lighting - Variant 2",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for automotive lighting. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30067",
    "title": "Prototype Specification for Braking Components - Variant 1",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for braking components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30068",
    "title": "Prototype Specification for Braking Components - Variant 2",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for braking components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30069",
    "title": "Prototype Specification for Tyres - Variant 1",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for tyres. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30070",
    "title": "Prototype Specification for Tyres - Variant 2",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for tyres. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30071",
    "title": "Prototype Specification for Safety Components - Variant 1",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for safety components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30072",
    "title": "Prototype Specification for Safety Components - Variant 2",
    "category": "Automotive",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for safety components. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30073",
    "title": "Prototype Specification for Household Appliances - Variant 1",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for household appliances. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30074",
    "title": "Prototype Specification for Household Appliances - Variant 2",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for household appliances. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30075",
    "title": "Prototype Specification for Plastic Products - Variant 1",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for plastic products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30076",
    "title": "Prototype Specification for Plastic Products - Variant 2",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for plastic products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30077",
    "title": "Prototype Specification for Furniture - Variant 1",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for furniture. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30078",
    "title": "Prototype Specification for Furniture - Variant 2",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for furniture. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30079",
    "title": "Prototype Specification for Textile Products - Variant 1",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for textile products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30080",
    "title": "Prototype Specification for Textile Products - Variant 2",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for textile products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30081",
    "title": "Prototype Specification for Safety Products - Variant 1",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for safety products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30082",
    "title": "Prototype Specification for Safety Products - Variant 2",
    "category": "Consumer Products",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for safety products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30083",
    "title": "Prototype Specification for Building Materials - Variant 1",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for building materials. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30084",
    "title": "Prototype Specification for Building Materials - Variant 2",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for building materials. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30085",
    "title": "Prototype Specification for Concrete Products - Variant 1",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for concrete products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30086",
    "title": "Prototype Specification for Concrete Products - Variant 2",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for concrete products. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30087",
    "title": "Prototype Specification for Aggregates - Variant 1",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for aggregates. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30088",
    "title": "Prototype Specification for Aggregates - Variant 2",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for aggregates. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30089",
    "title": "Prototype Specification for Roofing Materials - Variant 1",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for roofing materials. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30090",
    "title": "Prototype Specification for Roofing Materials - Variant 2",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for roofing materials. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30091",
    "title": "Prototype Specification for Pipes - Variant 1",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for pipes. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-30092",
    "title": "Prototype Specification for Pipes - Variant 2",
    "category": "Construction",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, performance requirements, safety considerations and applicable test methods for pipes. This record is for SIH26108 development and must be validated against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-40001",
    "title": "Prototype Specification for Safety Helmets",
    "category": "Industrial Safety",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, safety requirements and test methods for safety helmets. Validate against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-40002",
    "title": "Prototype Specification for Protective Gloves",
    "category": "Industrial Safety",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, safety requirements and test methods for protective gloves. Validate against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-40003",
    "title": "Prototype Specification for Electronic Control Equipment",
    "category": "Electronics",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, safety requirements and test methods for electronic control equipment. Validate against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-40004",
    "title": "Prototype Specification for Communication Equipment",
    "category": "Telecommunications",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, safety requirements and test methods for communication equipment. Validate against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  },
  {
    "isNumber": "DEMO-IS-40005",
    "title": "Prototype Specification for Pollution Control Equipment",
    "category": "Environment",
    "scope": "Prototype dataset record describing procurement requirements, quality parameters, safety requirements and test methods for pollution control equipment. Validate against official BIS metadata before production use.",
    "latestVersion": "DEMO",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "VERIFY WITH BIS"
    ]
  }
];

async function generateEmbedding(text, extractor) {
  // Output is a tensor, we want to convert it to a flat array of numbers
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function seed() {
  const args = process.argv.slice(2);
  const wantsReset = args.includes('--force-reset') || args.includes('--confirm-reset') || args.includes('--reset');
  const canReset = args.includes('--force-reset') && args.includes('--confirm-reset');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend';
    // Sanitize URI for logging to prevent credential leaks
    const sanitizedUri = mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`Connecting to MongoDB... ${sanitizedUri}`);
    
    await mongoose.connect(mongoUri);
    
    const dbHost = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    console.log(`Connected to DB [Host: ${dbHost} | Database: ${dbName}]`);

    if (wantsReset) {
      if (!canReset) {
        console.error('\n[SAFETY ABORT] You requested a data reset, but failed to provide the necessary safety confirmations.');
        console.error(`Target Database: ${dbName} @ ${dbHost}`);
        console.error('To intentionally PURGE ALL DATA and re-seed, you MUST provide BOTH flags:');
        console.error('  node seed.js --force-reset --confirm-reset\n');
        process.exit(1);
      }
      
      console.warn(`\n[WARNING] INITIATING FULL DATA PURGE on Database: '${dbName}' @ '${dbHost}'...`);
      await Standard.deleteMany({});
      console.log('Collection cleared successfully.\n');
    }

    // Provision default demo users idempotently
    const defaultUsers = [
      { username: 'admin', password: 'adminpassword', role: 'admin' },
      { username: 'divyansh', password: 'sih@2026', role: 'admin' },
      { username: 'demouser', password: 'userpassword', role: 'user' }
    ];

    console.log('Checking and provisioning default demo users...');
    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ username: u.username });
      if (!existingUser) {
        const user = new User({
          username: u.username,
          password: u.password,
          role: u.role
        });
        await user.save();
        console.log(`[USER SEED] Created demo user: '${u.username}' (${u.role})`);
      } else {
        console.log(`[USER SEED] Demo user '${u.username}' already exists.`);
      }
    }

    console.log('Loading AI model for embeddings (this may take a moment on first run)...');
    const extractor = await getPipeline();
    console.log('Model loaded.');

    console.log('Generating embeddings and safely inserting data (Non-destructive)...');
    for (const item of seedData) {
      if (item.isNumber.startsWith('DEMO-')) {
        item.sourceUrl = null;
        item.verifiedDate = null;
      }

      // Check if it already exists before generating expensive embeddings
      const existing = await Standard.findOne({ isNumber: item.isNumber });
      if (existing) {
        const phaseFourBackfill = {};
        if (!existing.isDemo && !existing.sourceUrl && item.sourceUrl) phaseFourBackfill.sourceUrl = item.sourceUrl;
        if (!existing.isDemo && !existing.verifiedDate && item.verifiedDate) phaseFourBackfill.verifiedDate = item.verifiedDate;
        if (!existing.isDemo && !existing.publishedOn && item.publishedOn) phaseFourBackfill.publishedOn = item.publishedOn;
        if (!existing.isDemo && !existing.latestReviewedYear && item.latestReviewedYear) phaseFourBackfill.latestReviewedYear = item.latestReviewedYear;
        if (!existing.isDemo && (!existing.clauses || existing.clauses.length === 0) && item.clauses?.length) phaseFourBackfill.clauses = item.clauses;
        if (Object.keys(phaseFourBackfill).length > 0) {
          await Standard.updateOne({ _id: existing._id }, { $set: phaseFourBackfill });
          console.log(`Backfilled metadata: ${item.isNumber}`);
          continue;
        }
        console.log(`Skipped existing standard (already seeded): ${item.isNumber}`);
        continue;
      }

      // Combine title and scope for a richer text representation
      const textToEmbed = `${item.title}. ${item.scope} ${item.category}`;
      item.embedding = await generateEmbedding(textToEmbed, extractor);
      
      await Standard.updateOne(
        { isNumber: item.isNumber },
        { $setOnInsert: item },
        { upsert: true }
      );
      
      console.log(`Saved new standard: ${item.isNumber}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
