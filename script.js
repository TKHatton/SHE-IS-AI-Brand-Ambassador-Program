// ---------- SAFE HELPERS (idempotent) ----------
window.$ ||= (q) => document.querySelector(q);
window.$$ ||= (q) => document.querySelectorAll(q);
const $ = window.$;
const $$ = window.$$;

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- LINKS (your real URLs) ----------
const LINKS = {
  SKOOL_URL: "https://www.skool.com/she-is-ai-community/about?ref=284558cf933e4a1fbb1d52ec9ceb9b33",
  BADGE_URL: "https://www.canva.com/design/DAGbpR6dP2o/iS1VtNQe4AH9BkwVR82v-w/view?utm_content=DAGbpR6dP2o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",
  ZOOM_URL: "https://us06web.zoom.us/j/85250761078?pwd=m5Y4SmLT194D5jLft99UQ14EiRJoh9.1&jst=2",
  EXPECTATIONS_URL: "#",
  BENEFITS_URL: "#",
  NEXT_STEPS_URL: "#",
  SCHOLAR_EMAIL: "mailto:amanda@sheisai.ai",
};

// If optional URLs are missing, default to on-page sections
function defaultOrSection(url, sectionHash) {
  if (url && url !== "#") return url;
  return sectionHash;
}

// Map IDs → URLs and apply safely
const linkMap = {
  "#link-skool": LINKS.SKOOL_URL,
  "#link-skool-2": LINKS.SKOOL_URL, // Next Steps link
  "#link-scholar": LINKS.SCHOLAR_EMAIL,
  "#link-expect": defaultOrSection(LINKS.EXPECTATIONS_URL, "#expectations"),
  "#link-badge": LINKS.BADGE_URL,
  "#link-weekly": LINKS.ZOOM_URL,
  // Optional future:
  // "#link-benefits": defaultOrSection(LINKS.BENEFITS_URL, "#benefits"),
  // "#link-next": defaultOrSection(LINKS.NEXT_STEPS_URL, "#next-steps"),
};

Object.entries(linkMap).forEach(([selector, url]) => {
  const el = $(selector);
  if (!el) return;
  el.setAttribute("href", url);
  if (!url || url === "#") el.setAttribute("aria-disabled", "true");
});

// ---------- Smooth scroll with header offset for ANY in-page anchor ----------
(function () {
  const header = document.querySelector("header");
  const getHeaderHeight = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash.length <= 1) return; // ignore "#"
      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - (getHeaderHeight() + 16);
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();

// ---------- Click-to-zoom modal ----------
const modal = $("#zoom-modal");
const modalContent = $("#modal-content");
const modalClose = $("#modal-close");

function openModal(html) {
  if (!modal || !modalContent) return;
  modalContent.innerHTML = html;
  modal.classList.add("active");
}
function closeModal() {
  if (!modal || !modalContent) return;
  modal.classList.remove("active");
  modalContent.innerHTML = "";
}

$$('[data-zoom]').forEach(card => {
  card.addEventListener("click", () => openModal(card.innerHTML));
});
if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
if (modalClose) modalClose.addEventListener("click", closeModal);

// ---------- BOT (ChatKit) ----------
const WORKFLOW_ID = "wf_68edd48e5e788190b178f7d9e981a00e065480baae7782e9"; // your workflow ID
const WORKFLOW_VERSION = "2"; // your Get Code shows version="2"; set "" to use production default

function getChatKit() {
  return window.ChatKit || window.chatkit || window.OpenAIChatKit || null;
}

// Wait up to 10s for ChatKit loader to appear
function waitForChatKit(maxMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const ck = getChatKit();
      if (ck) return resolve(ck);
      if (Date.now() - start > maxMs) return reject(new Error("ChatKit loader not found"));
      setTimeout(check, 150);
    })();
  });
}

async function openBot() {
  try {
    const chatkit = await waitForChatKit();
    if (typeof chatkit.init === "function") chatkit.init({});
    const opts = { workflowId: WORKFLOW_ID };
    if (WORKFLOW_VERSION && WORKFLOW_VERSION !== "") opts.version = WORKFLOW_VERSION;
    if (typeof chatkit.open === "function") {
      chatkit.open(opts);
    } else {
      alert("ChatKit is loaded but 'open' isn’t available. Re-check the embed snippet from Agent Builder.");
    }
  } catch (err) {
    alert(
      "The bot UI isn’t loaded yet.\n\n" +
      "Check these:\n" +
      "• Agent Builder → Get code → ChatKit → Add Domain (your exact Netlify URL)\n" +
      "• BOTH loader scripts are in index.html (see below)\n" +
      "• Hard refresh the site (Ctrl/Cmd+Shift+R)"
    );
    console.error(err);
  }
}

const fab = $("#agent-fab"); // button text says “Onboarding Agent/Bot”
if (fab) {
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    openBot();
  });
}
