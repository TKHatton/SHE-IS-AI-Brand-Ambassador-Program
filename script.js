// ---------- SAFE HELPERS ----------
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

function defaultOrSection(url, sectionHash) {
  if (url && url !== "#") return url;
  return sectionHash;
}

const linkMap = {
  "#link-skool": LINKS.SKOOL_URL,
  "#link-skool-2": LINKS.SKOOL_URL,
  "#link-scholar": LINKS.SCHOLAR_EMAIL,
  "#link-expect": defaultOrSection(LINKS.EXPECTATIONS_URL, "#expectations"),
  "#link-badge": LINKS.BADGE_URL,
  "#link-weekly": LINKS.ZOOM_URL,
};

Object.entries(linkMap).forEach(([selector, url]) => {
  const el = $(selector);
  if (!el) return;
  el.setAttribute("href", url);
  if (!url || url === "#") el.setAttribute("aria-disabled", "true");
});

// ---------- Smooth scroll with header offset ----------
(function () {
  const header = document.querySelector("header");
  const getHeaderHeight = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash.length <= 1) return;
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
const WORKFLOW_ID = "wf_68edd48e5e788190b178f7d9e981a00e065480baae7782e9";
const WORKFLOW_VERSION = "2"; // leave "" to use production

function getChatKit() {
  return window.ChatKit || window.chatkit || window.OpenAIChatKit || null;
}

function waitForChatKit(maxMs = 10000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function tick() {
      const ck = getChatKit();
      if (ck) return resolve(ck);
      if (Date.now() - t0 > maxMs) return reject(new Error("ChatKit loader not found"));
      setTimeout(tick, 150);
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
      alert("ChatKit is loaded but 'open' isn’t available. Re-check the Quickstart usage.");
    }
  } catch (err) {
    alert(
      "The bot UI isn’t loaded yet.\n\n" +
      "Check these:\n" +
      "• Get code → ChatKit: your Netlify origin is in Allowed Domains\n" +
      "• The single loader tag is in index.html with your data-domain-public-key\n" +
      "• Hard refresh (Ctrl/Cmd+Shift+R) or try an Incognito window"
    );
    console.error(err);
  }
}

const fab = $("#agent-fab");
if (fab) {
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    openBot();
  });
}
