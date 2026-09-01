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

