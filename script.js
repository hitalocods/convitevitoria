/**
 * ==========================================================================
 * CONVITE DE ANIVERSÁRIO PREMIUM - VITÓRIA 25 ANOS 🍒
 * Configurações Centralizadas e Integração com Banco Neon (PostgreSQL)
 * ==========================================================================
 */

import { neon } from "https://esm.sh/@neondatabase/serverless@0.10.4";

export const EVENT_CONFIG = {
  birthdayPerson: "Vitória",
  fullName: "Vitória Madalena",
  age: "25 anos",
  birthdayDate: "26/10",
  partyDate: "31/10",
  partyWeekday: "Sábado",
  partyTime: "A partir das 19h",
  rsvpDeadline: "20/09",
  locationName: "Quintal da Cerva Eventos",
  locationAddress: "Rua Humberto de Campos, 2491 (Antiga Rua 2) - Lourival Parente",
  mapsUrl: "https://www.google.com.br/maps/place/Quintal+da+Cerva+Eventos/@-5.136083,-42.7827626,17z/data=!3m1!4b1!4m6!3m5!1s0x78e31f6c43eab33:0x45da9909f1aec565!8m2!3d-5.136083!4d-42.7801877!16s%2Fg%2F11rwwpqlhv?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D",
  pixKey: "086.861.763-64",
  pixName: "Vitória Madalena",
  adminPin: "2510", // PIN para acesso ao painel administrativo

  // ==========================================================================
  // CONEXÃO COM O BANCO DE DADOS NEON (POSTGRESQL)
  // ==========================================================================
  neonDatabaseUrl: "postgresql://neondb_owner:npg_Gu0IMR7zxZoL@ep-lucky-cake-auw0zeph-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" 
};

// Database instance
let sql = null;
if (EVENT_CONFIG.neonDatabaseUrl && !EVENT_CONFIG.neonDatabaseUrl.includes("COLE_AQUI")) {
  try {
    sql = neon(EVENT_CONFIG.neonDatabaseUrl);
  } catch (e) {
    console.warn("Aviso ao conectar no Neon:", e);
  }
}

// State
let selectedPresence = "yes"; // "yes" or "no"
let adminAuthenticated = false;

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupPageNavigation();
  setupRsvpForm();
  setupPixCopy();
  setupAdminPanel();
  setupSmoothScroll();
  checkUrlHash();
  
  // Initialize table in Neon if connected
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS rsvps (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          attending BOOLEAN NOT NULL DEFAULT TRUE,
          companions_count INT DEFAULT 0,
          companion_names TEXT,
          message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("Banco Neon conectado e pronto! 🍒");
    } catch (err) {
      console.error("Erro ao inicializar tabela no Neon:", err);
    }
  }
}

/**
 * 1. Sistema de Troca de Páginas (Página 1: Capa | Página 2: Menu Principal e Conteúdo)
 */
function setupPageNavigation() {
  const btnOpen = document.getElementById("btnOpenInvite");
  const btnBackCover = document.getElementById("btnBackCover");
  const pageCover = document.getElementById("pageCover");
  const pageMain = document.getElementById("pageMain");

  if (btnOpen) {
    btnOpen.addEventListener("click", () => {
      goToPage("main");
      showToast("Bem-vindo(a) ao meu aniversário! 🍒❤️");
    });
  }

  if (btnBackCover) {
    btnBackCover.addEventListener("click", () => {
      goToPage("cover");
    });
  }
}

function goToPage(pageName) {
  const pageCover = document.getElementById("pageCover");
  const pageMain = document.getElementById("pageMain");

  if (pageName === "main") {
    pageCover.classList.add("hidden-page");
    pageCover.classList.remove("active-page");

    pageMain.classList.remove("hidden-page");
    pageMain.classList.add("active-page");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    pageMain.classList.add("hidden-page");
    pageMain.classList.remove("active-page");

    pageCover.classList.remove("hidden-page");
    pageCover.classList.add("active-page");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * 2. Navegação Suave para Seções Internas
 */
function setupSmoothScroll() {
  const navLinks = document.querySelectorAll(".action-card, .subnav-btn");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}

/**
 * 3. Formulário de Confirmação de Presença (RSVP)
 */
function setupRsvpForm() {
  const choiceYes = document.getElementById("choiceYes");
  const choiceNo = document.getElementById("choiceNo");
  const selectCompanions = document.getElementById("rsvpCompanions");
  const companionNamesGroup = document.getElementById("companionNamesGroup");
  const companionsSection = document.getElementById("companionsSection");
  const rsvpForm = document.getElementById("rsvpForm");
  const btnSubmit = document.getElementById("btnSubmitRsvp");

  if (choiceYes && choiceNo) {
    choiceYes.addEventListener("click", () => {
      selectedPresence = "yes";
      choiceYes.classList.add("selected-yes");
      choiceNo.classList.remove("selected-no");
      if (companionsSection) companionsSection.classList.remove("hidden");
    });

    choiceNo.addEventListener("click", () => {
      selectedPresence = "no";
      choiceNo.classList.add("selected-no");
      choiceYes.classList.remove("selected-yes");
      if (companionsSection) companionsSection.classList.add("hidden");
    });
  }

  if (selectCompanions && companionNamesGroup) {
    selectCompanions.addEventListener("change", (e) => {
      const val = parseInt(e.target.value, 10);
      if (val > 0) {
        companionNamesGroup.classList.remove("hidden");
        const input = document.getElementById("rsvpCompanionNames");
        if (input) input.required = true;
      } else {
        companionNamesGroup.classList.add("hidden");
        const input = document.getElementById("rsvpCompanionNames");
        if (input) input.required = false;
      }
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const guestName = document.getElementById("rsvpName").value.trim();
      const companionsCount = selectedPresence === "yes" ? parseInt(document.getElementById("rsvpCompanions").value, 10) || 0 : 0;
      const companionNames = companionsCount > 0 ? (document.getElementById("rsvpCompanionNames").value.trim() || "") : "";
      const message = document.getElementById("rsvpMessage").value.trim();

      if (!guestName) {
        showToast("Por favor, informe seu nome completo.");
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Gravando presença... 🍒";
      }

      const id = Date.now().toString();
      const isAttending = selectedPresence === "yes";

      // 1. Salvar no Neon PostgreSQL (se configurado)
      if (sql) {
        try {
          await sql`
            INSERT INTO rsvps (id, name, attending, companions_count, companion_names, message, created_at)
            VALUES (${id}, ${guestName}, ${isAttending}, ${companionsCount}, ${companionNames}, ${message}, NOW())
            ON CONFLICT (name) 
            DO UPDATE SET 
              attending = EXCLUDED.attending,
              companions_count = EXCLUDED.companions_count,
              companion_names = EXCLUDED.companion_names,
              message = EXCLUDED.message,
              created_at = NOW()
          `;
        } catch (dbErr) {
          console.error("Erro ao salvar no banco Neon:", dbErr);
        }
      }

      // 2. Sempre manter cópia local como fallback
      const rsvps = getStoredRsvps();
      const duplicateIndex = rsvps.findIndex(item => item.name.toLowerCase() === guestName.toLowerCase());
      const localEntry = {
        id: duplicateIndex >= 0 ? rsvps[duplicateIndex].id : id,
        name: guestName,
        attending: isAttending,
        companionsCount: companionsCount,
        companionNames: companionNames,
        message: message,
        timestamp: new Date().toISOString()
      };

      if (duplicateIndex >= 0) {
        rsvps[duplicateIndex] = localEntry;
      } else {
        rsvps.push(localEntry);
      }
      saveLocalRsvps(rsvps);

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Enviar Confirmação 🍒";
      }

      // Sucesso & Confetes
      showRsvpSuccess(guestName, isAttending);
    });
  }
}

function showRsvpSuccess(name, isAttending) {
  const formBox = document.getElementById("rsvpFormBox");
  const successBox = document.getElementById("rsvpSuccessBox");
  const successMsg = document.getElementById("rsvpSuccessMsg");

  if (formBox && successBox) {
    formBox.style.display = "none";
    successBox.classList.add("active");

    if (isAttending) {
      successMsg.innerHTML = `Que alegria ter você comigo, <strong>${name}</strong>! 🍒<br>Sua presença está confirmada com sucesso.`;
      launchConfetti();
    } else {
      successMsg.innerHTML = `Obrigada por avisar, <strong>${name}</strong>! ❤️<br>Sentiremos sua falta nessa noite especial.`;
    }
  }

  showToast("Confirmação registrada com sucesso 🍒");
}

/**
 * 4. PIX Copy Handler
 */
function setupPixCopy() {
  const btnCopy = document.getElementById("btnCopyPix");
  const pixKeyText = document.getElementById("pixKeyDisplay");
  const giftItems = document.querySelectorAll(".gift-value-item");

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      copyToClipboard(EVENT_CONFIG.pixKey, "Chave PIX copiada com sucesso 🍒");
    });
  }

  if (pixKeyText) {
    pixKeyText.addEventListener("click", () => {
      copyToClipboard(EVENT_CONFIG.pixKey, "Chave PIX copiada com sucesso 🍒");
    });
  }

  giftItems.forEach(item => {
    item.addEventListener("click", () => {
      const amount = item.getAttribute("data-amount");
      copyToClipboard(EVENT_CONFIG.pixKey, `Chave PIX copiada! Sugestão: ${amount} 🍒`);
    });
  });
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage || "Copiado com sucesso!");
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMessage || "Copiado com sucesso!");
  } catch (err) {
    showToast("Selecione e copie a chave manualmente.");
  }
  document.body.removeChild(textArea);
}

/**
 * 5. Painel Administrativo Protegido (Com Busca no Banco Neon)
 */
function setupAdminPanel() {
  const adminBackdrop = document.getElementById("adminModalBackdrop");
  const btnOpenAdmin = document.getElementById("btnOpenAdmin");
  const btnCloseAdmin = document.getElementById("btnCloseAdmin");
  const btnLoginAdmin = document.getElementById("btnLoginAdmin");
  const adminPinInput = document.getElementById("adminPinInput");
  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnCopyWhatsApp = document.getElementById("btnCopyWhatsApp");
  const btnClearAll = document.getElementById("btnClearAll");
  const searchInput = document.getElementById("adminSearchInput");
  const filterPills = document.querySelectorAll(".filter-pill");

  if (btnOpenAdmin) {
    btnOpenAdmin.addEventListener("click", () => {
      openAdminModal();
    });
  }

  if (btnCloseAdmin && adminBackdrop) {
    btnCloseAdmin.addEventListener("click", () => {
      adminBackdrop.classList.remove("active");
    });
    
    adminBackdrop.addEventListener("click", (e) => {
      if (e.target === adminBackdrop) {
        adminBackdrop.classList.remove("active");
      }
    });
  }

  if (btnLoginAdmin && adminPinInput) {
    const handleLogin = () => {
      if (adminPinInput.value === EVENT_CONFIG.adminPin) {
        adminAuthenticated = true;
        document.getElementById("adminLoginView").style.display = "none";
        document.getElementById("adminDashboardView").style.display = "block";
        renderAdminDashboard();
        showToast("Acesso autorizado 🍒");
      } else {
        showToast("PIN incorreto. Tente novamente.");
        adminPinInput.value = "";
        adminPinInput.focus();
      }
    };

    btnLoginAdmin.addEventListener("click", handleLogin);
    adminPinInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderAdminDashboard();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderAdminDashboard();
    });
  });

  if (btnExportCsv) {
    btnExportCsv.addEventListener("click", exportRsvpsCsv);
  }

  if (btnCopyWhatsApp) {
    btnCopyWhatsApp.addEventListener("click", copyWhatsAppSummary);
  }

  if (btnClearAll) {
    btnClearAll.addEventListener("click", async () => {
      if (confirm("Tem certeza que deseja apagar todas as confirmações?")) {
        if (sql) {
          try {
            await sql`DELETE FROM rsvps`;
          } catch (e) {
            console.error("Erro ao limpar Neon:", e);
          }
        }
        localStorage.removeItem("convite_vitoria_rsvps");
        await renderAdminDashboard();
        showToast("Lista de confirmações limpa.");
      }
    });
  }
}

function openAdminModal() {
  const adminBackdrop = document.getElementById("adminModalBackdrop");
  if (!adminBackdrop) return;
  adminBackdrop.classList.add("active");

  if (adminAuthenticated) {
    document.getElementById("adminLoginView").style.display = "none";
    document.getElementById("adminDashboardView").style.display = "block";
    renderAdminDashboard();
  } else {
    document.getElementById("adminLoginView").style.display = "block";
    document.getElementById("adminDashboardView").style.display = "none";
    const pinInput = document.getElementById("adminPinInput");
    if (pinInput) {
      pinInput.value = "";
      setTimeout(() => pinInput.focus(), 200);
    }
  }
}

async function fetchRsvps() {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        attending: r.attending,
        companionsCount: r.companions_count,
        companionNames: r.companion_names,
        message: r.message,
        timestamp: r.created_at
      }));
    } catch (e) {
      console.warn("Fallback para localStorage:", e);
      return getStoredRsvps();
    }
  }
  return getStoredRsvps();
}

async function renderAdminDashboard() {
  const rsvps = await fetchRsvps();
  const searchInput = document.getElementById("adminSearchInput");
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const activePill = document.querySelector(".filter-pill.active");
  const filterType = activePill ? activePill.getAttribute("data-filter") : "all";

  const confirmed = rsvps.filter(r => r.attending);
  const declined = rsvps.filter(r => !r.attending);
  const totalCompanions = confirmed.reduce((acc, curr) => acc + (curr.companionsCount || 0), 0);
  const totalEstimatedHeads = confirmed.length + totalCompanions;

  document.getElementById("metricConfirmed").textContent = confirmed.length;
  document.getElementById("metricDeclined").textContent = declined.length;
  document.getElementById("metricCompanions").textContent = totalCompanions;
  document.getElementById("metricTotal").textContent = totalEstimatedHeads;

  let filtered = rsvps;
  if (filterType === "yes") {
    filtered = filtered.filter(r => r.attending);
  } else if (filterType === "no") {
    filtered = filtered.filter(r => !r.attending);
  }

  if (searchQuery) {
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(searchQuery) ||
      (r.companionNames && r.companionNames.toLowerCase().includes(searchQuery))
    );
  }

  const listWrapper = document.getElementById("adminGuestList");
  if (!listWrapper) return;

  if (filtered.length === 0) {
    listWrapper.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--color-text-muted); font-size: 0.9rem;">
        Nenhuma confirmação encontrada.
      </div>
    `;
    return;
  }

  listWrapper.innerHTML = filtered.map(item => {
    const formattedDate = new Date(item.timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="guest-item" id="guest-${item.id}">
        <div class="guest-info">
          <div class="guest-name">
            ${escapeHtml(item.name)}
            <span class="guest-status-badge ${item.attending ? 'status-yes' : 'status-no'}">
              ${item.attending ? 'Confirmado 🍒' : 'Não vai'}
            </span>
          </div>
          ${item.attending ? `
            <div class="guest-meta">
              👥 <strong>Acompanhantes:</strong> ${item.companionsCount > 0 ? `${item.companionsCount} (${escapeHtml(item.companionNames || '')})` : 'Sozinho(a)'}
            </div>
          ` : ''}
          <div class="guest-meta">
            🕒 Registrado em ${formattedDate}
          </div>
          ${item.message ? `
            <div class="guest-note">
              💌 "${escapeHtml(item.message)}"
            </div>
          ` : ''}
        </div>
        <button class="btn-delete-guest" data-id="${item.id}" title="Excluir confirmação">
          🗑️
        </button>
      </div>
    `;
  }).join("");

  // Attach delete listeners
  listWrapper.querySelectorAll(".btn-delete-guest").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Deseja realmente remover este convidado da lista?")) {
        if (sql) {
          try {
            await sql`DELETE FROM rsvps WHERE id = ${id}`;
          } catch (e) {
            console.error("Erro ao deletar no Neon:", e);
          }
        }
        let local = getStoredRsvps();
        local = local.filter(r => r.id !== id);
        saveLocalRsvps(local);
        await renderAdminDashboard();
        showToast("Convidado removido.");
      }
    });
  });
}

async function exportRsvpsCsv() {
  const rsvps = await fetchRsvps();
  if (rsvps.length === 0) {
    showToast("Nenhuma confirmação para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "Nome,Status,Qtd Acompanhantes,Nomes dos Acompanhantes,Mensagem,Data e Hora\n";

  rsvps.forEach(r => {
    const status = r.attending ? "Confirmado" : "Nao comparecera";
    const companionsCount = r.companionsCount || 0;
    const companionNames = `"${(r.companionNames || '').replace(/"/g, '""')}"`;
    const message = `"${(r.message || '').replace(/"/g, '""')}"`;
    const date = new Date(r.timestamp).toLocaleString("pt-BR");

    csvContent += `"${r.name.replace(/"/g, '""')}",${status},${companionsCount},${companionNames},${message},${date}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `confirmacoes_aniversario_vitoria_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("Relatório CSV baixado 🍒");
}

async function copyWhatsAppSummary() {
  const rsvps = await fetchRsvps();
  const confirmed = rsvps.filter(r => r.attending);
  const totalCompanions = confirmed.reduce((acc, curr) => acc + (curr.companionsCount || 0), 0);
  const totalHeads = confirmed.length + totalCompanions;

  let text = `🍒 *CONFIRMAÇÕES — ANIVERSÁRIO VITÓRIA (25 ANOS)* 🍒\n\n`;
  text += `📊 *Resumo Geral:*\n`;
  text += `• Total Confirmados: *${confirmed.length}*\n`;
  text += `• Total Acompanhantes: *${totalCompanions}*\n`;
  text += `• Total de Pessoas: *${totalHeads}*\n\n`;
  text += `📋 *Lista de Presença:*\n`;

  if (confirmed.length === 0) {
    text += `Nenhum convidado confirmado ainda.\n`;
  } else {
    confirmed.forEach((r, idx) => {
      text += `${idx + 1}. *${r.name}*`;
      if (r.companionsCount > 0) {
        text += ` (+${r.companionsCount} ${r.companionNames ? `- ${r.companionNames}` : ''})`;
      }
      text += `\n`;
    });
  }

  copyToClipboard(text, "Resumo para WhatsApp copiado! 🍒");
}

function getStoredRsvps() {
  try {
    const raw = localStorage.getItem("convite_vitoria_rsvps");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalRsvps(list) {
  try {
    localStorage.setItem("convite_vitoria_rsvps", JSON.stringify(list));
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e);
  }
}

function showToast(message) {
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>🍒</span> ${message}`;
  toast.classList.add("active");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("active");
  }, 3500);
}

function checkUrlHash() {
  if (window.location.hash === "#admin") {
    setTimeout(openAdminModal, 300);
  }
}

function escapeHtml(string) {
  if (!string) return "";
  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}

function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#C9184A", "#A6162E", "#5F0914", "#C5A059", "#FFFFFF", "#FF758F"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  let animationFrame;
  const startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - elapsed / 2200);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (elapsed < 2200) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  animate();
}
