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
  EXPECTATIONS_URL: "#expectations",
  BENEFITS_URL: "#benefits",
  NEXT_STEPS_URL: "#next-steps",
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

// ---------- CHATBOT WIDGET ----------
let isWidgetOpen = false;
let messages = [];
let threadId = null;
let isLoading = false;

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
  
  container.innerHTML = `
    <div style="
      background: rgb(124, 58, 237);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px 16px 0 0;
    ">
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
        line-height: 1;
      ">×</button>
    </div>
    
    <div id="chat-messages" style="
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    "></div>
    
    <div style="
      padding: 16px;
      border-top: 1px solid #e2e8f0;
      background: white;
    ">
      <div style="display: flex; gap: 8px;">
        <input 
          id="chat-input"
          type="text" 
          placeholder="Type your message..."
          style="
            flex: 1;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
            outline: none;
          "
        />
        <button id="chat-send" style="
          background: rgb(124, 58, 237);
          border: none;
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Send</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Event listeners
  document.getElementById('chatkit-close-btn').addEventListener('click', closeWidget);
  document.getElementById('chat-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function closeWidget() {
  const container = document.getElementById('chatkit-widget-container');
  if (container) {
    container.style.display = 'none';
    isWidgetOpen = false;
  }
}

function openWidget() {
  createWidgetContainer();
  const container = document.getElementById('chatkit-widget-container');
  container.style.display = 'flex';
  isWidgetOpen = true;
  
  // Show welcome message if first time
  if (messages.length === 0) {
    addMessage('assistant', 'Hi! I\'m the She Is AI Ambassador Onboarding Agent. I can answer questions about requirements, benefits, costs, and next steps. What\'s your first name?');
  }
}

function addMessage(role, content) {
  messages.push({ role, content });
  renderMessages();
}

function renderMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  
  container.innerHTML = messages.map(msg => {
    const isUser = msg.role === 'user';
    return `
      <div style="
        display: flex;
        justify-content: ${isUser ? 'flex-end' : 'flex-start'};
      ">
        <div style="
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 12px;
          background: ${isUser ? 'rgb(124, 58, 237)' : 'white'};
          color: ${isUser ? 'white' : '#1e293b'};
          font-size: 14px;
          line-height: 1.5;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          ${msg.content.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
  }).join('');
  
  // Add loading indicator if needed
  if (isLoading) {
    container.innerHTML += `
      <div style="display: flex; justify-content: flex-start;">
        <div style="
          padding: 10px 14px;
          border-radius: 12px;
          background: white;
          color: #64748b;
          font-size: 14px;
        ">
          <span style="animation: pulse 1.5s ease-in-out infinite;">Thinking...</span>
        </div>
      </div>
    `;
  }
  
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message || isLoading) return;
  
  input.value = '';
  addMessage('user', message);
  
  isLoading = true;
  renderMessages();
  
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, threadId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response');
    }
    
    const data = await response.json();
    threadId = data.threadId;
    addMessage('assistant', data.response);
    
  } catch (error) {
    console.error('Error:', error);
    addMessage('assistant', 'Sorry, I encountered an error. Please try again or email sheisai@sheisai.ai for help.');
  } finally {
    isLoading = false;
    renderMessages();
  }
}

// FAB button
const fab = $("#agent-fab");
if (fab) {
  fab.removeAttribute('aria-disabled');
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    if (isWidgetOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  });
}