// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later WITH AdditionRef-Progmasoft-Patent-Grant-1.1

"use strict";

// The words of the page in the languages of progmasoft.com. The language is the
// one chosen on progmasoft.com, else the browser's, else English.
const texts = {
  "en-US": {
    products: "Products",
    developers: "Developers",
    account: "Account",
    dark: "Dark",
    light: "Light",
    eyebrow: "Progmasoft support",
    titleStart: "Ask the documentation.",
    titleAccent: "Get the answer with its sources.",
    lede: "AI Support answers questions about Tala, Tazel, ViGet, Catch3 and the Progmasoft tools from their documentation. It can be wrong: check what it says against the sources it links.",
    label: "Your question",
    placeholder: "How do I add a dependency in Tazel?",
    examples: [
      "How do I add a dependency in Tazel?",
      "How do comments look in Tala?",
      "What does talac --emit=metadata do?",
    ],
    note: "Your question is not stored.",
    privacy: "Privacy Policy",
    security: "Security Policy",
    ask: "Ask",
    answering: "Answering…",
    answerHeading: "Answer",
    sources: "Sources",
    model: "Answered by Qwen3.5 2B on a Progmasoft server.",
    human: "Write to a person",
    busy: "AI Support is answering other questions. Try again in a minute.",
    unavailable: "AI Support cannot answer now. Write to support@progmasoft.com.",
    invalid: "Ask a question of up to 1,000 characters.",
  },
  "de-DE": {
    products: "Produkte",
    developers: "Entwickler",
    account: "Konto",
    dark: "Dunkel",
    light: "Hell",
    eyebrow: "Progmasoft-Support",
    titleStart: "Fragen Sie die Dokumentation.",
    titleAccent: "Mit Antwort und Quellen.",
    lede: "AI Support beantwortet Fragen zu Tala, Tazel, ViGet, Catch3 und den Werkzeugen von Progmasoft aus deren Dokumentation. Die Antworten können falsch sein: Prüfen Sie sie anhand der verlinkten Quellen.",
    label: "Ihre Frage",
    placeholder: "Wie füge ich in Tazel eine Abhängigkeit hinzu?",
    examples: [
      "Wie füge ich in Tazel eine Abhängigkeit hinzu?",
      "Wie sehen Kommentare in Tala aus?",
      "Was macht talac --emit=metadata?",
    ],
    note: "Ihre Frage wird nicht gespeichert.",
    privacy: "Datenschutzerklärung",
    security: "Sicherheitsrichtlinie",
    ask: "Fragen",
    answering: "Antwort entsteht …",
    answerHeading: "Antwort",
    sources: "Quellen",
    model: "Beantwortet von Qwen3.5 2B auf einem Server von Progmasoft.",
    human: "An einen Menschen schreiben",
    busy: "AI Support beantwortet gerade andere Fragen. Versuchen Sie es in einer Minute erneut.",
    unavailable: "AI Support kann gerade nicht antworten. Schreiben Sie an support@progmasoft.com.",
    invalid: "Stellen Sie eine Frage mit höchstens 1.000 Zeichen.",
  },
  "ru-RU": {
    products: "Продукты",
    developers: "Разработчикам",
    account: "Аккаунт",
    dark: "Тёмная",
    light: "Светлая",
    eyebrow: "Поддержка Progmasoft",
    titleStart: "Спросите документацию.",
    titleAccent: "Ответ — вместе с источниками.",
    lede: "AI Support отвечает на вопросы о Tala, Tazel, ViGet, Catch3 и инструментах Progmasoft по их документации. Ответы могут быть неверными: сверяйте их с указанными источниками.",
    label: "Ваш вопрос",
    placeholder: "Как добавить зависимость в Tazel?",
    examples: [
      "Как добавить зависимость в Tazel?",
      "Как выглядят комментарии в Tala?",
      "Что делает talac --emit=metadata?",
    ],
    note: "Ваш вопрос не сохраняется.",
    privacy: "Политика конфиденциальности",
    security: "Политика безопасности",
    ask: "Спросить",
    answering: "Отвечаю…",
    answerHeading: "Ответ",
    sources: "Источники",
    model: "Отвечает Qwen3.5 2B на сервере Progmasoft.",
    human: "Написать человеку",
    busy: "AI Support сейчас отвечает на другие вопросы. Повторите через минуту.",
    unavailable: "AI Support сейчас не может ответить. Напишите на support@progmasoft.com.",
    invalid: "Задайте вопрос длиной не более 1000 символов.",
  },
  "he-IL": {
    products: "מוצרים",
    developers: "מפתחים",
    account: "חשבון",
    dark: "כהה",
    light: "בהיר",
    eyebrow: "התמיכה של Progmasoft",
    titleStart: "שאלו את התיעוד.",
    titleAccent: "קבלו תשובה עם המקורות שלה.",
    lede: "AI Support עונה על שאלות על Tala, ‏Tazel, ‏ViGet, ‏Catch3 והכלים של Progmasoft מתוך התיעוד שלהם. התשובות עלולות להיות שגויות: כדאי לבדוק אותן מול המקורות המקושרים.",
    label: "השאלה שלך",
    placeholder: "איך מוסיפים תלות ב־Tazel?",
    examples: [
      "איך מוסיפים תלות ב־Tazel?",
      "איך נראות הערות ב־Tala?",
      "מה עושה talac --emit=metadata?",
    ],
    note: "השאלה שלך אינה נשמרת.",
    privacy: "מדיניות פרטיות",
    security: "מדיניות אבטחה",
    ask: "שאלה",
    answering: "עונה…",
    answerHeading: "תשובה",
    sources: "מקורות",
    model: "התשובות מ־Qwen3.5 2B על שרת של Progmasoft.",
    human: "לכתוב לאדם",
    busy: "AI Support עונה כעת על שאלות אחרות. נסו שוב בעוד דקה.",
    unavailable: "AI Support אינו יכול לענות כעת. כתבו אל support@progmasoft.com.",
    invalid: "שאלו שאלה של עד 1,000 תווים.",
  },
};

function chosenLocale() {
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith("progmasoft_locale="));
  const chosen = cookie?.slice("progmasoft_locale=".length);
  if (chosen && chosen in texts) return chosen;
  for (const language of navigator.languages ?? []) {
    const match = Object.keys(texts).find(
      (locale) => locale === language || locale.startsWith(`${language.split("-")[0]}-`),
    );
    if (match) return match;
  }
  return "en-US";
}

const locale = chosenLocale();
const text = texts[locale];

const form = document.getElementById("ask");
const question = document.getElementById("question");
const examples = document.getElementById("examples");
const submit = document.getElementById("submit");
const answer = document.getElementById("answer");
const answerText = document.getElementById("answer-text");
const sources = document.getElementById("sources");
const sourceList = document.getElementById("source-list");
const message = document.getElementById("message");
const theme = document.getElementById("theme");

function translate() {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "he-IL" ? "rtl" : "ltr";
  for (const element of document.querySelectorAll("[data-text]")) {
    element.textContent = text[element.dataset.text];
  }
  for (const element of document.querySelectorAll("[data-placeholder]")) {
    element.placeholder = text[element.dataset.placeholder];
  }
  examples.replaceChildren(
    ...text.examples.map((example) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = example;
      button.addEventListener("click", () => {
        question.value = example;
        form.requestSubmit();
      });
      return button;
    }),
  );
}

// The same choice as on progmasoft.com: light unless the visitor picks dark.
function showTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  theme.setAttribute("aria-pressed", String(dark));
  theme.querySelector("[data-text]").textContent = dark ? text.light : text.dark;
}

function toggleTheme() {
  const dark = document.documentElement.dataset.theme !== "dark";
  if (dark) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try {
    localStorage.setItem("progmasoft_theme", dark ? "dark" : "light");
  } catch {
    // The choice holds for this visit only.
  }
  showTheme();
}

let links = [];

// Inline code and [n] citations of a line of the answer, as nodes, never as HTML.
function inline(line, parent) {
  const pattern = /`([^`]+)`|\[(\d+)\]/g;
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    parent.append(line.slice(last, match.index));
    if (match[1] !== undefined) {
      const code = document.createElement("code");
      code.textContent = match[1];
      parent.append(code);
    } else {
      const source = links[Number(match[2]) - 1];
      if (source) {
        const cite = document.createElement("a");
        cite.className = "cite";
        cite.href = source.url;
        cite.target = "_blank";
        cite.rel = "noopener";
        cite.title = source.title;
        cite.textContent = `[${match[2]}]`;
        parent.append(cite);
      } else {
        parent.append(match[0]);
      }
    }
    last = match.index + match[0].length;
  }
  parent.append(line.slice(last));
}

// The answer so far: paragraphs, and code blocks between ``` fences.
function render(markdown) {
  answerText.replaceChildren();
  const blocks = markdown.split(/^```[^\n]*\n?/m);
  blocks.forEach((block, index) => {
    if (index % 2 === 1) {
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = block.replace(/\n$/, "");
      pre.append(code);
      answerText.append(pre);
      return;
    }
    for (const paragraph of block.split(/\n{2,}/)) {
      if (paragraph.trim() === "") continue;
      const p = document.createElement("p");
      paragraph.split("\n").forEach((line, lineIndex) => {
        if (lineIndex > 0) p.append(document.createElement("br"));
        inline(line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "• ").replace(/\*\*([^*]+)\*\*/g, "$1"), p);
      });
      answerText.append(p);
    }
  });
}

function showSources(list) {
  links = list;
  sourceList.replaceChildren(
    ...list.map((source) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = source.title;
      item.append(link);
      return item;
    }),
  );
  sources.hidden = list.length === 0;
}

function fail(words) {
  message.textContent = words;
  message.hidden = false;
}

// Reads the server-sent events of /api/ask from the body of the response.
async function* events(response) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += value;
    let end;
    while ((end = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const name = /^event: (.*)$/m.exec(block)?.[1];
      const data = /^data: (.*)$/m.exec(block)?.[1];
      if (name && data) yield { name, data: JSON.parse(data) };
    }
  }
}

async function ask(event) {
  event.preventDefault();
  const asked = question.value.trim();
  if (asked === "" || asked.length > 1000) {
    fail(text.invalid);
    return;
  }
  message.hidden = true;
  answer.hidden = false;
  showSources([]);
  answerText.replaceChildren();
  answerText.classList.add("thinking");
  submit.disabled = true;
  submit.textContent = text.answering;
  let markdown = "";
  try {
    const response = await fetch("api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: asked }),
    });
    if (!response.ok) {
      answer.hidden = true;
      fail(response.status === 503 ? text.busy : response.status === 400 ? text.invalid : text.unavailable);
      return;
    }
    for await (const { name, data } of events(response)) {
      if (name === "sources") showSources(data);
      else if (name === "text") render((markdown += data.text));
      else if (name === "error") fail(text.unavailable);
    }
  } catch {
    fail(text.unavailable);
  } finally {
    answerText.classList.remove("thinking");
    submit.disabled = false;
    submit.textContent = text.ask;
  }
}

translate();
showTheme();
theme.addEventListener("click", toggleTheme);
form.addEventListener("submit", ask);
question.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) form.requestSubmit();
});
