require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Category = require("./models/Category");
const Course = require("./models/Course");

const courseData = [
  {
    title: "Design systems that actually scale",
    slug: "design-systems",
    description: "Create a practical design system, from tokens to documentation, and help your team ship cohesive products.",
    category: "Design",
    level: "Intermediate",
    thumbnailUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85",
    price: 64,
    outcomes: ["Build a flexible token architecture", "Document components for real teams", "Ship and maintain a living design system"],
  },
  {
    title: "The complete product analytics playbook",
    slug: "product-analytics",
    description: "Turn product data into decisions with a useful measurement strategy and a practical analytics taxonomy.",
    category: "Business",
    level: "Beginner",
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
    price: 54,
    outcomes: ["Choose metrics that matter", "Design a useful analytics taxonomy", "Tell a story with product data"],
  },
  {
    title: "Machine learning for curious minds",
    slug: "machine-learning",
    description: "A friendly, hands-on tour through the algorithms and ideas behind modern machine learning.",
    category: "Data & AI",
    level: "Intermediate",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
    price: 74,
    outcomes: ["Understand the core ML workflow", "Train and evaluate a first model", "Apply models to everyday problems"],
  },
  {
    title: "Creative coding with JavaScript",
    slug: "creative-coding",
    description: "Explore animation, generative art, and interactive visual experiments using JavaScript.",
    category: "Development",
    level: "All levels",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85",
    price: 49,
    outcomes: ["Create expressive browser animations", "Build generative visual experiments", "Share a polished project"],
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI before seeding the catalog.");
  if (!process.env.SEED_INSTRUCTOR_EMAIL || !process.env.SEED_INSTRUCTOR_PASSWORD) {
    throw new Error("Set SEED_INSTRUCTOR_EMAIL and SEED_INSTRUCTOR_PASSWORD before seeding the catalog.");
  }
  if (process.env.SEED_INSTRUCTOR_PASSWORD.length < 12) {
    throw new Error("SEED_INSTRUCTOR_PASSWORD must contain at least 12 characters.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let instructor = await User.findOne({ email: process.env.SEED_INSTRUCTOR_EMAIL.toLowerCase() });
  if (!instructor) {
    instructor = await User.create({
      name: "Orbit Teaching Team",
      email: process.env.SEED_INSTRUCTOR_EMAIL,
      password: process.env.SEED_INSTRUCTOR_PASSWORD,
      role: "instructor",
      instructorStatus: "approved",
    });
  } else if (instructor.role !== "instructor") {
    throw new Error("SEED_INSTRUCTOR_EMAIL belongs to an account that is not an instructor.");
  } else if (instructor.instructorStatus !== "approved") {
    instructor.instructorStatus = "approved";
    await instructor.save();
  }

  const categoryNames = ["Design", "Business", "Data & AI", "Development", "Marketing", "Personal growth"];
  await Category.bulkWrite(categoryNames.map((name, sortOrder) => ({
    updateOne: {
      filter: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
      update: {
        $setOnInsert: {
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          isActive: true,
          sortOrder,
        },
      },
      upsert: true,
    },
  })));

  await Course.bulkWrite(courseData.map((course) => ({
    updateOne: {
      filter: { slug: course.slug },
      update: {
        $set: { ...course, instructor: instructor._id, status: "published", publishedAt: new Date() },
      },
      upsert: true,
    },
  })));
  console.info(`Seeded ${courseData.length} classes and ${categoryNames.length} categories.`);
}

seed()
  .catch((error) => {
    console.error("Catalog seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
