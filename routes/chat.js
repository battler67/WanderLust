const express = require("express");
const crypto = require("node:crypto");
const { answerSupport } = require("../services/supportRag");
const { classifySupportQuery } = require("../services/classifySupportQuery");

const router = express.Router();

router.post("/", async (req, res) => {
  const requestId = crypto.randomUUID();
  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim() || message.length > 1000) {
    return res.status(400).json({ error: "Enter a valid question." });
  }

  try {
    const question = message.trim();
    const intent = await classifySupportQuery(question);

    console.log("[support-intent]", JSON.stringify({ requestId, intent }));

    if (intent === "greeting") {
      return res.json({
        answer:
          "Hi! I can help you use WanderLust. Ask me about accounts, listings, reviews, or finding your way around the portal.",
        links: [],
        debug: { retrieved: [], usedRefs: [] },
      });
    }

    if (intent === "unrelated") {
      return res.json({
        answer:
          "I can help with questions about the WanderLust portal. For other questions, please consult customer support.",
        links: [],
        debug: { retrieved: [], usedRefs: [] },
      });
    }

    const { audit, ...publicAnswer } = await answerSupport(question);

    console.log(
      "[support-rag]",
      JSON.stringify({
        requestId,
        retrieved: audit.retrieved,
        usedRefs: audit.usedRefs,
      }),
    );

    return res.json({ ...publicAnswer, debug: audit });
  } catch (error) {
    console.error("[support-rag]", requestId, error);
    return res.status(503).json({
      error: "The support assistant is unavailable right now.",
    });
  }
});
module.exports = router;
