const OPENROUTER_DECISIONS_URL = "https://openrouter.ai/api/alpha/decisions";
const MODEL = "baseten/mammoth-1:free";
const INTENTS = new Set(["greeting", "portal_support", "unrelated"]);

async function classifySupportQuery(message) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing");
  }

  const response = await fetch(OPENROUTER_DECISIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      state: message,
      questions: {
        intent: {
          type: "choice",
          instructions:
            "Classify this message for the WanderLust portal support assistant. " +
            "If it includes a greeting and a portal question, choose portal_support. " +
            "If it may be about the portal, choose portal_support so help documents can be checked.",
          criteria: {
            greeting:
              "Only a greeting, thanks, or farewell without a question or request.",
            portal_support:
              "A question about the WanderLust portal, including its purpose, accounts, login, listings, reviews, navigation, or support for those features.",
            unrelated:
              "A request unrelated to the WanderLust portal, such as general knowledge, personal advice, or creative writing.",
          },
        },
      },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter decision request failed: HTTP ${response.status}`);
  }

  const result = await response.json();
  const intent = result.answers?.intent?.choice;
  if (result.answers?.intent?.type !== "choice" || !INTENTS.has(intent)) {
    throw new Error("OpenRouter returned an invalid support intent");
  }

  return intent;
}

module.exports = { classifySupportQuery };
