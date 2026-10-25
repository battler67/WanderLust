require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { embed, collection } = require("../services/supportRag");

const articles = [
  {
    id: "overview",
    file: "overview.md",
    title: "Explore WanderLust",
    url: "/listings",
  },
  {
    id: "signup",
    file: "signup.md",
    title: "Register an account",
    url: "/signup",
  },
  { id: "login", file: "login.md", title: "Log in", url: "/login" },
  { id: "logout", file: "logout.md", title: "Log out", url: "/logout" },
  {
    id: "create",
    file: "create-listing.md",
    title: "Create a listing",
    url: "/listings/new",
  },
  {
    id: "manage",
    file: "manage-listing.md",
    title: "Manage a listing",
    url: "/listings",
  },
  {
    id: "reviews",
    file: "reviews.md",
    title: "Manage reviews",
    url: "/listings",
  },
];

function makeChunks(article, markdown) {
  const sections = markdown
    .split(/(?=^## )/m)
    .map((section) => section.trim())
    .filter(Boolean);

  const chunks = [];
  let number = 0;
  for (const section of sections) {
    const [headingLine, ...bodyLines] = section.split(/\r?\n/);
    const heading = headingLine.replace(/^##\s*/, "");
    const words = bodyLines.join(" ").trim().split(/\s+/).filter(Boolean);
    for (let start = 0; start < words.length; start += 210) {
      number++;
      chunks.push({
        ref: `${article.id}#${number}`,
        docId: article.id,
        chunkNumber: number,
        title: article.title,
        url: article.url,
        text: `${article.title}\n${heading}\n${words
          .slice(start, start + 250)
          .join(" ")}`,
      });

      if (start + 250 >= words.length) break;
    }
  }

  return chunks;
}

async function main() {
  await mongoose.connect(process.env.DB_URL);
  try {
    const chunks = collection();
    await chunks.createIndex({ ref: 1 }, { unique: true });
    const activeRefs = [];
    let changed = 0;

    for (const article of articles) {
      const filename = path.join(
        __dirname,
        "..",
        "knowledge",
        "support",
        article.file,
      );
      const markdown = await fs.readFile(filename, "utf8");

      for (const chunk of makeChunks(article, markdown)) {
        activeRefs.push(chunk.ref);
        const hash = crypto
          .createHash("sha256")
          .update(chunk.text)
          .digest("hex");

        const existing = await chunks.findOne(
          { ref: chunk.ref },
          { projection: { hash: 1 } },
        );

        if (existing?.hash === hash) {
          await chunks.updateOne(
            { ref: chunk.ref },
            { $set: { title: chunk.title, url: chunk.url } },
          );
          continue;
        }

        await chunks.updateOne(
          { ref: chunk.ref },
          {
            $set: {
              ...chunk,
              hash,
              embedding: await embed(chunk.text),
              indexedAt: new Date(),
            },
          },
          { upsert: true },
        );
        changed++;
      }
    }

    await chunks.deleteMany({ ref: { $nin: activeRefs } });

    console.log(
      `Support index ready: ${activeRefs.length} chunks, ${changed} newly embedded or changed.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Support indexing failed:", error);
  process.exitCode = 1;
});
