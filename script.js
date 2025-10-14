// ---------- Basic wiring & helpers ----------
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// Set year
$("#year").textContent = new Date().getFullYear();

// ---------- Links: set your known URLs here (fill in later as you get them) ----------
const LINKS = {
  SKOOL_URL: "https://www.skool.com/she-is-ai-community/about?ref=284558cf933e4a1fbb1d52ec9ceb9b33",            // e.g., https://skool.com/your-community
  BADGE_URL: "https://www.canva.com/design/DAGbpR6dP2o/iS1VtNQe4AH9BkwVR82v-w/view?utm_content=DAGbpR6dP2o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview",            // e.g., https://drive.google.com/file/d/...
  ZOOM_URL: "https://us06web.zoom.us/j/85250761078?pwd=m5Y4SmLT194D5jLft99UQ14EiRJoh9.1&jst=2",             // weekly call link
  EXPECTATIONS_URL: "",     // if you publish a dedicated section/page
  BENEFITS_URL: "",         // optional
  NEXT_STEPS_URL: "",       // optional
  SCHOLAR_EMAIL: "mailto:amanda@sheisai.ai",
};

// Apply links
$("#link-skool").setAttribute("href", LINKS.SKOOL_URL);
$("#link-scholar").setAttribute("href", LINKS.SCHOLAR_EMAIL);
$("#link-expect").setAttribute("href", LINKS.EXPECTATIONS_URL);
$("#link-badge").setAttribute("href", LINKS.BADGE_URL);
$("#link-weekly").setAttribute("href", LINKS.ZOOM_URL);

// ---------- Agent link (using your workflow ID) ----------
// Your provided workflow ID:
const WORKFLOW_ID = "wf_68edd48e5e788190b178f7d9e981a00e065480baae7782e9";

/*
  Many hosted chat UIs disallow iframes. The most reliable approach today
  is to open the agent in a new tab using a shareable link. If your dashboard
  gives you a public "share" URL, paste it below. As a fallback, we try a
  querystring pattern that some environments support.

  If you obtain a definitive public share URL, replace AGENT_URL with that.
*/
let AGENT_URL = `https://chat.openai.com/?agent=${encodeURIComponent(WORKFLOW_ID)}`;

const fab = $("#agent-fab");
fab.setAttribute("href", AGENT_URL);

// ---------- Click-to-zoom cards (simple modal) ----------
const modal = $("#zoom-modal");
const modalContent = $("#modal-content");
const modalClose = $("#modal-close");

function openModal(html) {
  modalContent.innerHTML = html;
  modal.classList.add("active");
}
function closeModal() {
  modal.classList.remove("active");
  modalContent.innerHTML = "";
}

[...$$('[data-zoom]')].forEach(card => {
  card.addEventListener("click", () => {
    const html = card.innerHTML;
    openModal(html);
  });
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
modalClose.addEventListener("click", closeModal);
