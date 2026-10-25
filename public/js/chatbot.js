(() => {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const close = document.getElementById("chat-close");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const send = document.getElementById("chat-send");
  const messages = document.getElementById("chat-messages");

  if (!toggle || !panel || !close || !form || !input || !send || !messages) {
    return;
  }
  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else toggle.focus();
  }

  function addMessage(text, role) {
    const item = document.createElement("div");
    item.className = `chat-message chat-message--${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key == "Escape" && !panel.hidden) setOpen(false);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";
    input.disabled = true;
    send.disabled = true;
    const pending = addMessage("Thinking...", "assistant");
    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page: window.location.pathname,
        }),
      });
      if (!response.ok) throw new Error("Chat request Failed");
      const data = await response.json();

      console.table(data.debug?.retrieved ?? []);
      console.log("Chunks used:", data.debug?.usedRefs ?? []);
      if (Array.isArray(data.parts) && data.parts.length > 0) {
        const content = document.createDocumentFragment();
        let validParts = true;

        for (const part of data.parts) {
          if (typeof part.text !== "string") {
            validParts = false;
            break;
          }
          if (part.type === "text") {
            content.appendChild(document.createTextNode(part.text));
          } else if (
            part.type === "link" &&
            typeof part.url === "string" &&
            /^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(part.url)
          ) {
            const anchor = document.createElement("a");
            anchor.href = new URL(part.url, window.location.origin).href;
            anchor.textContent = part.text;
            content.appendChild(anchor);
          } else {
            validParts = false;
            break;
          }
        }

        if (validParts) {
          pending.replaceChildren(content);
        } else {
          pending.textContent = data.answer || "I couldn't find an answer";
        }
      } else {
        pending.textContent = data.answer || "I couldn't find an answer";
      }
    } catch {
      pending.textContent =
        "The assistant is not connected yet.Please try again later";
    } finally {
      input.disabled = false;
      send.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
