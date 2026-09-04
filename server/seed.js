const mongoose = require('mongoose');
require('dotenv').config();
const Standard = require('./models/Standard');

// Dynamically import the transformers package
async function getPipeline() {
  const { pipeline } = await import('@xenova/transformers');
  // Load the feature extraction pipeline, which generates embeddings
  return await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269",
    verifiedDate: new Date("2024-01-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Field of Application",
        text: "Covers the manufacture and chemical and physical requirements of ordinary Portland cement (OPC) of 33, 43 and 53 grades.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Chemical Composition Criteria",
        text: "The ratio of percentage of lime to percentages of silica, alumina and iron oxide shall be not less than 0.66 and not more than 1.02. Insoluble residue shall not exceed 5.0 percent.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269#clause-4.1"
      },
      {
        clauseNumber: "5.4",
        title: "Compressive Strength Requirements",
        text: "Specifies minimum compressive strength at 72 hours, 168 hours, and 672 hours for 33, 43, and 53 grade cement.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269#clause-5.4"
      },
      {
        clauseNumber: "9.2",
        title: "Packaging and Mandatory BIS ISI Marking",
        text: "Cement bags shall be marked with grade, net mass, month/year of manufacture, and the standard BIS Certification ISI Mark.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+269#clause-9.2"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786",
    verifiedDate: new Date("2024-01-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Product Specification",
        text: "Specifies requirements for high strength deformed steel bars and wires for concrete reinforcement in grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D and Fe 600.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786#clause-1.1"
      },
      {
        clauseNumber: "3.2",
        title: "Chemical Composition and Maximum Carbon Equivalent",
        text: "Limits carbon, sulphur, and phosphorus concentrations and mandates maximum carbon equivalent values for weldability.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786#clause-3.2"
      },
      {
        clauseNumber: "7.1",
        title: "Mechanical Properties and Yield Strength",
        text: "Specifies 0.2 percent proof stress/yield stress, tensile strength, and minimum percentage elongation for Fe 415 through Fe 600 grades.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786#clause-7.1"
      },
      {
        clauseNumber: "8.3",
        title: "Bend and Rebend Test Compliance",
        text: "Requires standard test piece to withstand bending through 180 degrees without transverse cracking on the outer bent surface.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1786#clause-8.3"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+302-1",
    verifiedDate: new Date("2024-01-20T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Voltage Limits",
        text: "Deals with the safety of electrical appliances for household and similar purposes with rated voltage not exceeding 250 V single-phase and 415 V other appliances.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+302-1#clause-1.1"
      },
      {
        clauseNumber: "8.1",
        title: "Protection Against Electric Shock",
        text: "Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+302-1#clause-8.1"
      },
      {
        clauseNumber: "13.2",
        title: "Leakage Current and Electric Strength at Operating Temperature",
        text: "Leakage current shall not be excessive and dielectric strength shall be adequate under steady normal operating conditions.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+302-1#clause-13.2"
      },
      {
        clauseNumber: "22.11",
        title: "Construction and Mechanical Hazards",
        text: "Moving parts shall be positioned or enclosed to provide adequate protection against personal injury during normal use.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+302-1#clause-22.11"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16102(Part+1)",
    verifiedDate: new Date("2024-02-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Application",
        text: "Specifies the safety and interchangeability requirements, together with the test methods and conditions, required to show compliance of LED-lamps with integrated means for stable operation.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16102(Part+1)#clause-1.1"
      },
      {
        clauseNumber: "6.1",
        title: "Interchangeability and Dimensions",
        text: "Lamps shall conform to standard cap dimensions and gauges specified in relevant international and Indian standard sheets.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16102(Part+1)#clause-6.1"
      },
      {
        clauseNumber: "8.2",
        title: "Insulation Resistance and Dielectric Withstand",
        text: "Insulation resistance between current-carrying metal parts and accessible parts shall be not less than 4 MOhm.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16102(Part+1)#clause-8.2"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+15822",
    verifiedDate: new Date("2024-02-15T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Conspicuity",
        text: "Specifies requirements for high visibility warning clothing, capable of signaling the user's presence visually under any light conditions.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+15822#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Photometric Performance of Retroreflective Material",
        text: "Specifies the minimum coefficient of retroreflection for retroreflective material when illuminated at various observation angles.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+15822#clause-4.1"
      },
      {
        clauseNumber: "5.2",
        title: "Colorimetric and Luminance Factors",
        text: "Defines chromaticity coordinates and luminance factor requirements for background fluorescent materials.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+15822#clause-5.2"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16982",
    verifiedDate: new Date("2024-03-01T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Applicability",
        text: "Covers the requirements for stainless steel cookware including utensils and vessels used for cooking and serving food.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16982#clause-1.1"
      },
      {
        clauseNumber: "4.2",
        title: "Material Grades and Food Contact Safety",
        text: "Cookware shall be fabricated from food-grade stainless steel conforming to specified austenitic or ferritic grades.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16982#clause-4.2"
      },
      {
        clauseNumber: "6.3",
        title: "Thermal Shock and Handle Attachment Strength",
        text: "Handles and attachments shall withstand specified torque, tensile stress, and repeated thermal cycling without loosening or failure.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+16982#clause-6.3"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+9873(Part+1)",
    verifiedDate: new Date("2024-03-10T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Mechanical Safety",
        text: "Specifies acceptable criteria for structural characteristics of toys, such as shape, size, contour, spacing, and properties peculiar to certain categories of toys.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+9873(Part+1)#clause-1.1"
      },
      {
        clauseNumber: "4.4",
        title: "Small Parts and Choking Hazard Prevention",
        text: "Toys intended for children under 36 months shall not contain or detach small parts capable of fitting entirely inside the small parts cylinder.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+9873(Part+1)#clause-4.4"
      },
      {
        clauseNumber: "4.8",
        title: "Edges, Points and Projections",
        text: "Accessible sharp edges and points shall not pose laceration or puncture hazards when tested according to specified sharp edge testers.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+9873(Part+1)#clause-4.8"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+4151",
    verifiedDate: new Date("2024-03-25T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Application",
        text: "Specifies the requirements regarding the material, construction, workmanship, finish, and performance for protective helmets for everyday use by two wheeler riders.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+4151#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Shock Absorption and Impact Deceleration",
        text: "The helmet shall attenuate impact energy such that peak headform acceleration does not exceed 300g during drop tests onto flat and kerbstone anvils.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+4151#clause-5.1"
      },
      {
        clauseNumber: "6.2",
        title: "Retention System and Chin Strap Strength",
        text: "Retention system components shall not undergo dynamic displacement exceeding 35 mm under specified drop load tests.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+4151#clause-6.2"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1445",
    verifiedDate: new Date("2024-04-05T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Nominal Voltage",
        text: "Specifies requirements and tests for porcelain insulators for overhead power lines with a nominal voltage up to and including 1000 V.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1445#clause-1.1"
      },
      {
        clauseNumber: "4.1",
        title: "Porcelain Quality and Glazing",
        text: "Porcelain shall be sound, thoroughly vitrified, free from defects and uniformly glazed brown or white.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1445#clause-4.1"
      },
      {
        clauseNumber: "6.2",
        title: "Mechanical Failing Load and Flashover Voltage",
        text: "Insulators shall withstand specified transverse mechanical failing load and dry/wet one-minute power frequency flashover voltages.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+1445#clause-6.2"
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
    sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+374",
    verifiedDate: new Date("2024-04-18T00:00:00.000Z"),
    clauses: [
      {
        clauseNumber: "1.1",
        title: "Scope and Field of Application",
        text: "Specifies the requirements and methods of tests for electric ceiling type fans and their associated regulators intended for use on single-phase ac circuits at voltages not exceeding 250 V.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+374#clause-1.1"
      },
      {
        clauseNumber: "5.1",
        title: "Air Delivery and Service Value",
        text: "Fans shall deliver the minimum air delivery (m3/min) specified for each sweep size, with energy service value meeting star rating criteria.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+374#clause-5.1"
      },
      {
        clauseNumber: "8.4",
        title: "Suspension System and Safety Fastening",
        text: "Ceiling fan downrods, shackles, and clamps shall incorporate secondary safety wire or locking mechanisms preventing fall hazards.",
        sourceUrl: "https://standardsbis.bsbedge.com/BIS_SearchStandard.aspx?Standard_Number=IS+374#clause-8.4"
      }
    ]
  },
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
        if (!existing.isDemo && (!existing.clauses || existing.clauses.length === 0) && item.clauses?.length) phaseFourBackfill.clauses = item.clauses;
        if (Object.keys(phaseFourBackfill).length > 0) {
          await Standard.updateOne({ _id: existing._id }, { $set: phaseFourBackfill });
          console.log(`Backfilled Phase 4 metadata: ${item.isNumber}`);
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
