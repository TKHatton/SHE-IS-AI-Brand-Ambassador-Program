// =============== BASIC HELPERS ===============
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// Footer year
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =============== YOUR WORKFLOW ID (NO URL NEEDED) ===============
// Paste the exact workflow ID from Agent Builder:
const WORKFLOW_ID = "wf_68edd48e5e788190b178f7d9e981a00e065480baae7782e9";

// If ChatKit is loaded (OpenAI embed script), we can open the chat.
// Some accounts see a loader snippet in Agent Builder; if you have it, paste it in index.html before </body>.
// Example (pseudo):
// <script src="https://cdn.openai.com/chatkit.js"></script>
//
// If you don't have that yet, the button is disabled and will show an alert with instructions.

// =============== LINKS YOU CONTROL ===============
const LINKS = {
  SKOOL_URL: "https://www.skool.com/she-is-ai-community/about?ref=284558cf933e4a1fbb1d52ec9ceb9b33",              // e.g., https://skool.com/your-community?ref=your-affiliate
  BADGE_URL: "https://www.canva.com/design/DAGbpR6dP2o/iS1VtNQe4AH9BkwVR82v-w/view?utm_content=DAGbpR6dP2o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",              // e.g., Google Drive link
  ZOOM_URL: "https://us06web.zoom.us/j/85250761078?pwd=m5Y4SmLT194D5jLft99UQ14EiRJoh9.1&jst=2",               // weekly call link
  EXPECTATIONS_URL: "#",       // optional external page (leave as "#" if none)
  BENEFITS_URL: "#",           // optional external page (leave as "#" if none)
  NEXT_STEPS_URL: "#",         // optional external page (leave as "#" if none)
  SCHOLAR_EMAIL: "mailto:amanda@sheisai.ai",
};

// Helper: route optional links to on-page sections if you don't have externals yet
function defaultOrSection(url, sectionHash) {
  if (url && url !== "#") return url;
  return sectionHash; // fall back to in-page anchor
}

// Apply links safely (only if elements exist)
const linkMap = {
  "#link-skool": LINKS.SKOOL_URL,
  "#link-scholar": LINKS.SCHOLAR_EMAIL,
  "#link-expect": defaultOrSection(LINKS.EXPECTATIONS_URL, "#expectations"),
  "#link-badge": LINKS.BADGE_URL,
  "#link-weekly": LINKS.ZOOM_URL,
  // If you add buttons later:
  // "#link-benefits": defaultOrSection(LINKS.BENEFITS_URL, "#benefits"),
  // "#link-next": defaultOrSection(LINKS.NEXT_STEPS_URL, "#next-steps"),
};

Object.entries(linkMap).forEach(([selector, url]) => {
  const el = $(selector);
  if (!el) return;
  if (url && url !== "") el.setAttribute("href", url);
  if (!url || url === "#") el.setAttribute("aria-disabled", "true");
});

// =============== SMOOTH SCROLL WITH HEADER OFFSET ===============
// Fixes “scrolling too low” when clicking any in-page anchor (from buttons or links)
(function () {
  const header = document.querySelector("header");
  const getHeaderHeight = () => (header ? header.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash.length <= 1) return; // ignore plain "#"
      const target = document.querySelector(hash);
      if (!target) return;

      // Only intercept same-page anchors
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - (getHeaderHeight() + 16);
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();

// =============== CLICK-TO-ZOOM CARDS (MODAL) ===============
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

$$('[data-zoom]').forEach((card) => {
  card.addEventListener("click", () => openModal(card.innerHTML));
});
if (modal) {
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
}
if (modalClose) modalClose.addEventListener("click", closeModal);

// =============== OPEN THE AGENT (VIA CHATKIT) ===============
// This wires the floating FAB to open your workflow in ChatKit (if present).
const fab = $("#agent-fab");

// Guard: if you removed the FAB in HTML, stop here.
if (fab) {
  // Try to open ChatKit with the workflow ID
  function openAgent() {
    // Expecting ChatKit to be available globally when OpenAI's embed script is added.
    // Different orgs see slightly different loader names; we check common patterns.
    const chatkit = window.ChatKit || window.chatkit || window.OpenAIChatKit;

    if (chatkit && typeof chatkit.open === "function") {
      chatkit.open({ workflowId: WORKFLOW_ID });
    } else if (chatkit && typeof chatkit.init === "function") {
      // Some loaders require init once, then open.
      try {
        chatkit.init({ workflowId: WORKFLOW_ID });
        if (typeof chatkit.open === "function") chatkit.open({ workflowId: WORKFLOW_ID });
      } catch (err) {
        alert("ChatKit is present but not ready. Check the embed snippet from Agent Builder and try again.");
      }
    } else {
      // ChatKit not loaded yet
      alert(
        "The agent UI isn’t loaded yet.\n\n" +
        "Next step:\n" +
        "1) In Agent Builder, look for the ChatKit embed snippet (or 'Add to site' / 'Get code').\n" +
        "2) Paste that <script> snippet before </body> in index.html.\n" +
        "3) Keep this workflow ID in script.js. The button will work automatically."
      );
    }
  }

  // Enable the FAB and wire it up
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    openAgent();
  });
}
