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

// ---------- BOT (ChatKit Widget) ----------
const WORKFLOW_ID = "wf_68edd48e5e788190b178f7d9e981a00e065480baae7782e9";
const WORKFLOW_VERSION = "2";

let chatkitInstance = null;
let isWidgetOpen = false;

function getChatKit() {
  return window.ChatKit || window.chatkit || window.OpenAIChatKit || null;
}

function waitForChatKit(maxMs = 10000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function tick() {
      const ck = getChatKit();
      if (ck) return resolve(ck);
      if (Date.now() - t0 > maxMs) return reject(new Error("ChatKit not loaded"));
      setTimeout(tick, 150);
    })();
  });
}

// Create widget container
function createWidgetContainer() {
  if (document.getElementById('chatkit-widget-container')) return;
  
  const container = document.createElement('div');
  container.id = 'chatkit-widget-container';
  container.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 120px);
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 9999;
    display: none;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Add header with close button
  const header = document.createElement('div');
  header.style.cssText = `
    background: rgb(124, 58, 237);
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 16px 16px 0 0;
  `;
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 20px;">💬</span>
      <span style="font-weight: 600;">Onboarding Assistant</span>
    </div>
    <button id="chatkit-close-btn" style="
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">×</button>
  `;
  
  // Add ChatKit container
  const chatkitWrapper = document.createElement('div');
  chatkitWrapper.id = 'chatkit-wrapper';
  chatkitWrapper.style.cssText = `
    flex: 1;
    overflow: hidden;
    background: white;
  `;
  
  container.appendChild(header);
  container.appendChild(chatkitWrapper);
  document.body.appendChild(container);
  
  // Close button handler
  document.getElementById('chatkit-close-btn').addEventListener('click', closeWidget);
}

function closeWidget() {
  const container = document.getElementById('chatkit-widget-container');
  if (container) {
    container.style.display = 'none';
    isWidgetOpen = false;
  }
}

async function openWidget() {
  try {
    createWidgetContainer();
    const container = document.getElementById('chatkit-widget-container');
    const wrapper = document.getElementById('chatkit-wrapper');
    
    container.style.display = 'flex';
    isWidgetOpen = true;
    
    // If ChatKit already initialized, just show it
    if (chatkitInstance) return;
    
    const chatkit = await waitForChatKit();
    
    // Initialize ChatKit
    if (typeof chatkit.init === 'function') {
      chatkit.init({
        theme: {
          colorScheme: 'light',
          color: {
            grayscale: { hue: 220, tint: 6, shade: -4 },
            accent: { primary: '#0f172a', level: 1 }
          },
          radius: 'round'
        },
        startScreen: {
          greeting: 'Welcome to SHE IS AI Ambassador Onboarding! How can I help you?',
          prompts: [
            { label: 'Tell me about benefits', prompt: 'What are the ambassador benefits?', icon: 'gift' },
            { label: 'What are expectations?', prompt: 'What are the expectations?', icon: 'list' },
            { label: 'How do I get started?', prompt: 'How do I get started as an ambassador?', icon: 'rocket' }
          ]
        },
        composer: {
          placeholder: 'Ask about the program...',
          attachments: { enabled: true }
        }
      });
    }
    
    // Open ChatKit with workflow
    const opts = { 
      workflowId: WORKFLOW_ID,
      container: wrapper // Mount in our widget
    };
    if (WORKFLOW_VERSION) opts.version = WORKFLOW_VERSION;
    
    if (typeof chatkit.open === 'function') {
      chatkitInstance = chatkit.open(opts);
    }
    
  } catch (err) {
    console.error('Widget error:', err);
    alert('Unable to load the assistant. Please refresh and try again.');
  }
}

// Update FAB button
const fab = $("#agent-fab");
if (fab) {
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  });
}

// Close widget when clicking outside
document.addEventListener('click', (e) => {
  const container = document.getElementById('chatkit-widget-container');
  const fab = document.getElementById('agent-fab');
  if (isWidgetOpen && container && !container.contains(e.target) && e.target !== fab) {
    // Don't close immediately - user might be interacting
  }
});