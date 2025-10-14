// ---------- Helpers ----------
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- LINKS: put your real URLs here ----------
const LINKS = {
  SKOOL_URL: "https://www.skool.com/she-is-ai-community/about?ref=284558cf933e4a1fbb1d52ec9ceb9b33",              // your Skool link (can include affiliate)
  BADGE_URL: "https://www.canva.com/design/DAGbpR6dP2o/iS1VtNQe4AH9BkwVR82v-w/view?utm_content=DAGbpR6dP2o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",              // Ambassador badge link
  ZOOM_URL: "https://us06web.zoom.us/j/85250761078?pwd=m5Y4SmLT194D5jLft99UQ14EiRJoh9.1&jst=2",               // weekly call link
  EXPECTATIONS_URL: "#",       // optional external page
  BENEFITS_URL: "#",           // optional external page
  NEXT_STEPS_URL: "#",         // optional external page
  SCHOLAR_EMAIL: "mailto:amanda@sheisai.ai",
};

// If optional URLs are missing, default to on-page sections
function defaultOrSection(url, sectionHash) {
  if (url && url !== "#") return url;
  return sectionHash;
}

// Apply links safely (map IDs → URLs)
const linkMap = {
  "#link-skool": LINKS.SKOOL_URL,
  "#link-skool-2": LINKS.SKOOL_URL,              // Next Steps link
  "#link-scholar": LINKS.SCHOLAR_EMAIL,
  "#link-expect": defaultOrSection(LINKS.EXPECTATIONS_URL, "#expectations"),
  "#link-badge": LINKS.BADGE_URL,
  "#link-weekly": LINKS.ZOOM_URL,
  // Optionally add later:
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
const WORKFLOW_VERSION = "1"; // from "Current version" field; omit or set "" to use production
const fab = $("#agent-fab"); // button label already says "Onboarding Bot" in HTML

function openBot() {
  // The loader you paste from Agent Builder exposes one of these:
  const chatkit = window.ChatKit || window.chatkit || window.OpenAIChatKit;

  if (chatkit && (typeof chatkit.open === "function" || typeof chatkit.init === "function")) {
    // Some loaders support open() directly; some want init() then open()
    try {
      if (typeof chatkit.init === "function") {
        chatkit.init({});
      }
      if (typeof chatkit.open === "function") {
        const opts = { workflowId: WORKFLOW_ID };
        if (WORKFLOW_VERSION && WORKFLOW_VERSION !== "") opts.version = WORKFLOW_VERSION;
        chatkit.open(opts);
      } else {
        alert("ChatKit is loaded but 'open' isn’t available. Re-check the embed snippet from Agent Builder.");
      }
    } catch (err) {
      console.error(err);
      alert("ChatKit threw an error while opening the bot. Check the console and your embed snippet.");
    }
  } else {
    alert(
      "The bot UI isn’t loaded yet.\n\n" +
      "Do this once:\n" +
      "1) In Agent Builder → Get code → ChatKit → click Quickstart.\n" +
      "2) Copy the <script> loader snippet and paste it just before </body> in index.html.\n" +
      "3) In Get code, click Add Domain and allow-list your Netlify URL.\n" +
      "Then click the button again."
    );
  }
}

if (fab) {
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    openBot();
  });
}
