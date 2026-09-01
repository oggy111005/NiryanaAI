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
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark", "CRS"]
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
    certifications: ["CRS"]
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
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark"]
  },
  {
    isNumber: "IS 1445:1977",
    title: "Porcelain Insulators for Overhead Power Lines with a Nominal Voltage up to and including 1000 V",
    category: "Electrical",
    scope: "Specifies requirements and tests for porcelain insulators for overhead power lines with a nominal voltage up to and including 1000 V.",
    latestVersion: "1977",
    amendments: [],
    alliedStandards: [],
    certifications: ["BIS ISI Mark"]
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
    certifications: ["BIS ISI Mark"]
  },
  {
    "isNumber": "IS 269:2015",
    "title": "Ordinary Portland Cement - Specification",
    "category": "Cement",
    "scope": "This standard covers the manufacture and chemical and physical requirements of ordinary Portland cement (OPC) of 33, 43 and 53 grades.",
    "latestVersion": "2015",
    "amendments": [
      "Amendment 1 - 2017",
      "Amendment 2 - 2019"
    ],
    "alliedStandards": [
      {
        "isNumber": "IS 4031",
        "title": "Methods of physical tests for hydraulic cement",
        "type": "Test Method"
      },
      {
        "isNumber": "IS 4032",
        "title": "Method of chemical analysis of hydraulic cement",
        "type": "Test Method"
      }
    ],
    "certifications": [
      "BIS ISI Mark"
    ]
  },
  {
    "isNumber": "IS 1445:1977",
    "title": "Porcelain Insulators for Overhead Power Lines with a Nominal Voltage up to and including 1000 V",
    "category": "Electrical",
    "scope": "Specifies requirements and tests for porcelain insulators for overhead power lines with a nominal voltage up to and including 1000 V.",
    "latestVersion": "1977",
    "amendments": [],
    "alliedStandards": [],
    "certifications": [
      "BIS ISI Mark"
    ]
  },
  {
    "isNumber": "IS 374:2019",
    "title": "Electric Ceiling Type Fans and Regulators - Specification",
    "category": "Electrical Appliances",
    "scope": "Specifies the requirements and methods of tests for electric ceiling type fans and their associated regulators.",
    "latestVersion": "2019",
    "amendments": [],
    "alliedStandards": [
      {
        "isNumber": "IS 1169",
        "title": "Electric pedestal type fans and regulators",
        "type": "Related Product"
      }
    ],
    "certifications": [
      "BIS ISI Mark"
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
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/is-recommend';
    console.log('Connecting to MongoDB...', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    console.log('Loading AI model for embeddings (this may take a moment on first run)...');
    const extractor = await getPipeline();
    console.log('Model loaded.');

    console.log('Clearing old data...');
    await Standard.deleteMany({});

    console.log('Generating embeddings and inserting data...');
    for (const item of seedData) {
      // Combine title and scope for a richer text representation
      const textToEmbed = `${item.title}. ${item.scope} ${item.category}`;
      item.embedding = await generateEmbedding(textToEmbed, extractor);
      
      const newStandard = new Standard(item);
      await newStandard.save();
      console.log(`Saved: ${item.isNumber}`);
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();

