/* ══════════════════════════════════════════════════════════════
   传讯 - games.js
   包含：消息统计 / 会话列表 / 收藏夹 / 消息搜索 / 请回答 / 表情菜单
   塔罗、运势、占卜相关代码已全部移除
   ══════════════════════════════════════════════════════════════ */

function renderStatsContent() {
    const statsContent = DOMElements.statsModal.content;

    const partnerMessages = messages.filter(msg =>
        msg.sender !== 'user' && msg.sender !== null &&
        msg.text &&
        msg.type !== 'system'
    );

    const myMessages = messages.filter(msg =>
        msg.sender === 'user' &&
        msg.text &&
        msg.type !== 'system'
    );

    if (partnerMessages.length === 0 && myMessages.length === 0) {
        statsContent.innerHTML = `
            <div class="stats-empty-state">
                <div class="stats-empty-icon"><i class="fas fa-chart-pie"></i></div>
                <h3>暂无数据</h3>
                <p>多聊几句再来看看吧...</p>
            </div>`;
        return;
    }

    const getTopReplies = (msgs) => {
        const countMap = {};
        msgs.forEach(msg => {
            const text = msg.text.trim();
            if (text) {
                countMap[text] = (countMap[text] || 0) + 1;
            }
        });
        return Object.entries(countMap)
            .map(([text, count]) => ({ text, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const partnerTop = getTopReplies(partnerMessages);
    const myTop = getTopReplies(myMessages);

    const generateRankHTML = (list) => {
        if (list.length === 0) return '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
        const maxVal = list[0].count;
        return list.map((item, index) => {
            const percent = (item.count / maxVal) * 100;
            return `
            <div class="rank-item">
                <div class="rank-progress-bg" style="width: ${percent}%; opacity: 0.1; background-color: var(--text-primary);"></div>
                <div class="rank-info">
                    <div class="rank-number">#${index + 1}</div>
                    <div class="rank-text" title="${item.text}">${item.text}</div>
                    <div class="rank-count">${item.count}次</div>
                </div>
            </div>`;
        }).join('');
    };

    const allMsgs = messages.filter(m => m.timestamp);
    const firstMsg = allMsgs.length > 0 ? allMsgs[0] : { timestamp: new Date() };
    const lastMsg = allMsgs.length > 0 ? allMsgs[allMsgs.length - 1] : { timestamp: new Date() };

    const formatDate = (dateObj) => {
        return new Date(dateObj).toLocaleDateString('zh-CN', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    statsContent.innerHTML = `
        <div class="stats-dashboard">
            <div class="stats-overview-grid">
                <div class="overview-item overview-large">
                    <div class="overview-value">${messages.length}</div>
                    <div class="overview-label">总消息数</div>
                </div>
                <div class="overview-row-two">
                    <div class="overview-item">
                        <div class="overview-value">${myMessages.length}</div>
                        <div class="overview-label">我发送的</div>
                    </div>
                    <div class="overview-item">
                        <div class="overview-value">${partnerMessages.length}</div>
                        <div class="overview-label">对方发送的</div>
                    </div>
                </div>
                <div class="overview-row-dates">
                    <div class="overview-item overview-date">
                        <div class="overview-date-icon"><i class="fas fa-seedling"></i></div>
                        <div>
                            <div class="overview-date-label">初次相遇</div>
                            <div class="overview-date-value">${formatDate(firstMsg.timestamp)}</div>
                        </div>
                    </div>
                    <div class="overview-item overview-date">
                        <div class="overview-date-icon"><i class="fas fa-heart"></i></div>
                        <div>
                            <div class="overview-date-label">最近联络</div>
                            <div class="overview-date-value">${formatDate(lastMsg.timestamp)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats-card">
                <div style="display:flex; gap:8px; margin-bottom:12px;">
                    <button id="stats-toggle-partner" class="stats-toggle-btn active" onclick="switchStatsView('partner')">
                        <i class="fas fa-user-circle"></i> 对方
                    </button>
                    <button id="stats-toggle-me" class="stats-toggle-btn" onclick="switchStatsView('me')">
                        <i class="fas fa-user"></i> 我方
                    </button>
                </div>
                <div class="stats-card-title" id="stats-rank-title">
                    <i class="fas fa-user-circle"></i> 对方高频词 TOP 5
                </div>
                <div class="stats-rank-list" id="stats-rank-list">
                    ${generateRankHTML(partnerTop)}
                </div>
            </div>
        </div>
    `;

    statsContent._partnerHTML = generateRankHTML(partnerTop);
    statsContent._myHTML = generateRankHTML(myTop);
}

window.switchStatsView = function(who) {
    const statsContent = DOMElements.statsModal.content;
    const partnerBtn = document.getElementById('stats-toggle-partner');
    const meBtn = document.getElementById('stats-toggle-me');
    const title = document.getElementById('stats-rank-title');
    const list = document.getElementById('stats-rank-list');
    if (!partnerBtn || !meBtn || !list) return;

    if (who === 'partner') {
        partnerBtn.classList.add('active');
        meBtn.classList.remove('active');
        title.innerHTML = '<i class="fas fa-user-circle"></i> 对方高频词 TOP 5';
        list.innerHTML = statsContent._partnerHTML || '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
    } else {
        meBtn.classList.add('active');
        partnerBtn.classList.remove('active');
        title.innerHTML = '<i class="fas fa-user"></i> 我方高频词 TOP 5';
        list.innerHTML = statsContent._myHTML || '<div style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px;">暂无数据</div>';
    }
};

function renderSessionList() {
    const listContainer = DOMElements.sessionModal.list;
    if (sessionList.length === 0) {
        listContainer.innerHTML = '<div class="stats-empty" style="padding: 20px 0;"><p>还没有会话</p></div>';
        return;
    }
    listContainer.innerHTML = sessionList.map(session => `
    <div class="session-item ${session.id === SESSION_ID ? 'active': ''}" data-id="${session.id}">
    <div class="session-info">
    <div class="session-name">${session.name}</div>
    <div class="session-meta">创建于 ${new Date(session.createdAt).toLocaleDateString()}</div>
    </div>
    <div class="session-actions">
    <button class="session-action-btn rename" title="重命名"><i class="fas fa-pen"></i></button>
    <button class="session-action-btn delete" title="删除"><i class="fas fa-trash"></i></button>
    </div>
    </div>
    `).join('');
}

/* ══════════════════════════════════════════════════════════════
   收藏夹
   ══════════════════════════════════════════════════════════════ */
function renderFavorites() {
    const list = document.getElementById('favorites-list');
    if (!list) return;

    const favoritedMessages = (typeof messages !== 'undefined' ? messages : [])
        .filter(m => m.favorited && m.type !== 'system');

    if (favoritedMessages.length === 0) {
        list.innerHTML = `
            <div class="stats-empty-state">
                <div class="stats-empty-icon"><i class="fas fa-star"></i></div>
                <h3>收藏夹空空如也</h3>
                <p>点击消息旁的 ☆ 星标即可收藏</p>
            </div>`;
        return;
    }

    list.innerHTML = favoritedMessages.map(msg => {
        const isUser = msg.sender === 'user';
        const senderName = isUser
            ? ((typeof settings !== 'undefined' && settings.myName) || '我')
            : ((typeof settings !== 'undefined' && settings.partnerName) || msg.sender || '对方');
        const ts = msg.timestamp ? new Date(msg.timestamp).toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        }) : '';
        const content = msg.text
            ? msg.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            : (msg.image ? `<img src="${msg.image}" style="max-width:100%;max-height:180px;border-radius:8px;display:block;margin-top:4px;cursor:pointer;" onclick="if(typeof viewImage==='function')viewImage('${msg.image.replace(/'/g,'\\\'')}')" loading="lazy">` : '');
        const avatarEl = isUser
            ? (typeof DOMElements !== 'undefined' ? DOMElements.me.avatar : null)
            : (typeof DOMElements !== 'undefined' ? DOMElements.partner.avatar : null);
        const avatarImg = avatarEl ? avatarEl.querySelector('img') : null;
        const avatarHtml = avatarImg
            ? `<img src="${avatarImg.src}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;">`
            : `<div style="width:28px;height:28px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-user" style="font-size:11px;color:var(--accent-color);"></i></div>`;
        return `
            <div class="fav-item" style="
                display:flex;flex-direction:column;gap:4px;
                padding:12px 14px;border-radius:12px;
                background:var(--primary-bg);
                border:1px solid var(--border-color);
                margin-bottom:10px;
                position:relative;
            ">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    ${avatarHtml}
                    <span style="font-size:12px;font-weight:600;color:var(--accent-color);">${senderName}</span>
                    <span style="font-size:11px;color:var(--text-secondary);margin-left:auto;padding-right:24px;">${ts}</span>
                </div>
                <div style="font-size:13px;color:var(--text-primary);line-height:1.5;word-break:break-word;">${content}</div>
                <button class="fav-remove-btn" data-id="${msg.id}" style="
                    position:absolute;top:8px;right:10px;
                    background:none;border:none;cursor:pointer;
                    color:var(--text-secondary);font-size:14px;padding:2px 4px;
                    opacity:0.6;
                " title="取消收藏"><i class="fas fa-star" style="color:var(--accent-color);"></i></button>
            </div>`;
    }).join('');

    list.querySelectorAll('.fav-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            const msg = (typeof messages !== 'undefined' ? messages : []).find(m => m.id === id);
            if (msg) {
                msg.favorited = false;
                if (typeof throttledSaveData === 'function') throttledSaveData();
                if (typeof showNotification === 'function') showNotification('已取消收藏', 'success', 1500);
                renderFavorites();
            }
        });
    });
}
window.renderFavorites = renderFavorites;

/* ══════════════════════════════════════════════════════════════
   消息搜索（含 dd/mm/yyyy 日期支持）
   ══════════════════════════════════════════════════════════════ */
window._runMsgSearch = function() {
    const input = document.getElementById('msg-search-input');
    const dateFrom = document.getElementById('msg-search-date-from');
    const dateTo = document.getElementById('msg-search-date-to');
    const resultsEl = document.getElementById('msg-search-results');
    if (!resultsEl) return;

    const q = (input ? input.value.trim() : '').toLowerCase();
    const from = dateFrom && dateFrom.value ? new Date(dateFrom.value) : null;
    const to = dateTo && dateTo.value ? new Date(dateTo.value + 'T23:59:59') : null;

    if (!q && !from && !to) {
        resultsEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary);font-size:13px;">输入关键词或选择日期开始搜索</div>';
        return;
    }

    const allMessages = typeof messages !== 'undefined' ? messages : [];
    const results = allMessages.filter(m => {
        if (m.type === 'system') return false;
        const ts = m.timestamp ? new Date(m.timestamp) : null;
        if (from && ts && ts < from) return false;
        if (to && ts && ts > to) return false;
        if (q && m.text && m.text.toLowerCase().includes(q)) return true;
        if (q && !m.text && m.image) return false;
        return !q;
    });

    if (results.length === 0) {
        resultsEl.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text-secondary);font-size:13px;">未找到 "${q || '相关'}" 的消息</div>`;
        return;
    }

    const myAvatarEl = typeof DOMElements !== 'undefined' ? DOMElements.me.avatar : null;
    const partnerAvatarEl = typeof DOMElements !== 'undefined' ? DOMElements.partner.avatar : null;
    const myImg = myAvatarEl ? myAvatarEl.querySelector('img') : null;
    const partnerImg = partnerAvatarEl ? partnerAvatarEl.querySelector('img') : null;

    function getAvatarHtml(isUser) {
        const img = isUser ? myImg : partnerImg;
        if (img) return `<img src="${img.src}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;">`;
        return `<div style="width:28px;height:28px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-user" style="font-size:11px;color:var(--accent-color);"></i></div>`;
    }

    function highlight(text, keyword) {
        if (!keyword) return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const re = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return escaped.replace(re, '<mark style="background:rgba(var(--accent-color-rgb),0.25);color:var(--accent-color);border-radius:2px;padding:0 1px;">$1</mark>');
    }

    resultsEl.innerHTML = results.slice(0, 100).map(msg => {
        const isUser = msg.sender === 'user';
        const senderName = isUser
            ? ((typeof settings !== 'undefined' && settings.myName) || '我')
            : ((typeof settings !== 'undefined' && settings.partnerName) || msg.sender || '对方');
        const ts = msg.timestamp ? new Date(msg.timestamp).toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        }) : '';
        const content = msg.text
            ? highlight(msg.text, q)
            : (msg.image ? `<img src="${msg.image}" style="max-height:60px;border-radius:6px;display:block;margin-top:4px;" loading="lazy">` : '');
        return `<div style="display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border-radius:12px;background:var(--primary-bg);border:1px solid var(--border-color);margin-bottom:8px;cursor:pointer;"
            onclick="if(typeof showNotification==='function')showNotification('已定位消息', 'info', 1500); if(typeof scrollToQuotedMessage==='function'){var el=document.createElement('div');el.dataset.replyId='${msg.id}';scrollToQuotedMessage(el);}">
            ${getAvatarHtml(isUser)}
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                    <span style="font-size:12px;font-weight:600;color:var(--accent-color);">${senderName}</span>
                    <span style="font-size:11px;color:var(--text-secondary);">${ts}</span>
                </div>
                <div style="font-size:13px;color:var(--text-primary);line-height:1.5;word-break:break-word;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${content}</div>
            </div>
        </div>`;
    }).join('') + (results.length > 100 ? `<div style="text-align:center;padding:10px;font-size:12px;color:var(--text-secondary);">仅显示前100条，共找到 ${results.length} 条</div>` : '');
};

/* ══════════════════════════════════════════════════════════════
   「请回答」功能
   流程：
   1. 用户输入题目 + 选项
   2. 弹窗关闭，聊天室立刻出现用户消息（列出所有选项）
   3. 等 30 秒 ~ 50 秒（随机）
   4. 对方以「回复」形式发出结果
   ══════════════════════════════════════════════════════════════ */

let wheelOptions = ["是", "否", "再想一想", "听你的"];
let wheelQuestionText = "";
let _wheelTimerId = null;

function initDecisionModule() {
    const entryBtn = document.getElementById('decision-function');
    if (entryBtn) {
        const newBtn = entryBtn.cloneNode(true);
        entryBtn.parentNode.replaceChild(newBtn, entryBtn);
        newBtn.addEventListener('click', () => {
            hideModal(document.getElementById('advanced-modal'));
            showModal(document.getElementById('decision-menu-modal'));
        });
    }

    const openWheelBtn = document.getElementById('open-wheel');
    const closeMenuBtn = document.getElementById('close-decision-menu');
    const closeWheelBtn = document.getElementById('close-wheel');
    const addOptionBtn = document.getElementById('add-wheel-option');
    const spinBtn = document.getElementById('spin-wheel-btn');

    if (openWheelBtn && !openWheelBtn.dataset.initialized) {
        openWheelBtn.addEventListener('click', () => {
            hideModal(document.getElementById('decision-menu-modal'));
            initPicker();
            showModal(document.getElementById('wheel-modal'));
        });
        openWheelBtn.dataset.initialized = 'true';
    }

    if (closeMenuBtn && !closeMenuBtn.dataset.initialized) {
        closeMenuBtn.addEventListener('click', () => hideModal(document.getElementById('decision-menu-modal')));
        closeMenuBtn.dataset.initialized = 'true';
    }

    if (closeWheelBtn && !closeWheelBtn.dataset.initialized) {
        closeWheelBtn.addEventListener('click', () => hideModal(document.getElementById('wheel-modal')));
        closeWheelBtn.dataset.initialized = 'true';
    }

    if (addOptionBtn && !addOptionBtn.dataset.initialized) {
        addOptionBtn.addEventListener('click', () => {
            wheelOptions.push(`選項${String.fromCharCode(65 + wheelOptions.length)}`);
            renderPickerOptions();
        });
        addOptionBtn.dataset.initialized = 'true';
    }

    if (spinBtn && !spinBtn.dataset.initialized) {
        spinBtn.addEventListener('click', performAskAnswer);
        spinBtn.dataset.initialized = 'true';
    }
}

function initPicker() {
    renderPickerOptions();
    const questionInput = document.getElementById('wheel-question-input');
    if (questionInput) questionInput.value = wheelQuestionText || '';
}

function renderPickerOptions() {
    const list = document.getElementById('wheel-options-list');
    if (!list) return;
    list.innerHTML = '';
    const colors = ['#FFD93D','#FF6B6B','#6BCB77','#4D96FF','#E0C3FC','#FF9A8B','#A8D8EA','#C44569'];
    wheelOptions.forEach((opt, index) => {
        const item = document.createElement('div');
        item.className = 'picker-option-item';
        const safeVal = String(opt).replace(/"/g, '&quot;').replace(/</g, '&lt;');
        item.innerHTML = `
            <div class="picker-option-color-dot" style="background:${colors[index % colors.length]}"></div>
            <input type="text" class="picker-option-input" value="${safeVal}" placeholder="输入选项...">
            <span class="picker-option-remove"><i class="fas fa-times"></i></span>
        `;
        const input = item.querySelector('input');
        input.addEventListener('input', (e) => {
            wheelOptions[index] = e.target.value;
        });
        item.querySelector('.picker-option-remove').addEventListener('click', () => {
            if (wheelOptions.length <= 2) {
                showNotification('至少保留两个选项', 'warning');
                return;
            }
            wheelOptions.splice(index, 1);
            renderPickerOptions();
        });
        list.appendChild(item);
    });
}

async function performAskAnswer() {
    // ── 1. 读取输入 ──
    const questionInput = document.getElementById('wheel-question-input');
    const question = questionInput ? questionInput.value.trim() : '';

    const optionInputs = document.querySelectorAll('#wheel-options-list .picker-option-input');
    const options = Array.from(optionInputs)
        .map(inp => inp.value.trim())
        .filter(Boolean);

    if (options.length < 2) {
        showNotification('请至少输入两个选项', 'warning');
        return;
    }

    wheelQuestionText = question;

    // ── 2. 关闭弹窗 ──
    const wheelModal = document.getElementById('wheel-modal');
    if (wheelModal && typeof hideModal === 'function') hideModal(wheelModal);
    await new Promise(r => setTimeout(r, 320));

    // ── 3. 立即发送用户消息到聊天室 ──
    const msgId = Date.now() + Math.floor(Math.random() * 1000);
    const lines = ['【請回答】'];
    if (question) lines.push('提問：' + question);
    lines.push('選項：');
    options.forEach(o => lines.push(o));
    const msgText = lines.join('\n');

    addMessage({
        id: msgId,
        sender: 'user',
        text: msgText,
        timestamp: new Date(),
        status: 'sent',
        favorited: false,
        note: null,
        type: 'normal'
    });

    // ── 4. 计算随机延迟：30 秒 ~ 50 秒 ──
    const MIN_DELAY = 30 * 1000;   // 30 秒
    const MAX_DELAY = 50 * 1000;   // 50 秒
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

    const winnerIdx = Math.floor(Math.random() * options.length);
    const winnerOption = options[winnerIdx];

    // 提示用户已发出
    const delaySec = Math.round(delay / 1000);
    if (typeof showNotification === 'function') {
        showNotification(`✦ 已发出，等待回答…（约 ${delaySec} 秒）`, 'info', 3500);
    }

    // ── 5. 延迟后，对方以「回复」形式发出结果 ──
    if (_wheelTimerId) clearTimeout(_wheelTimerId);
    _wheelTimerId = setTimeout(() => {
        _wheelTimerId = null;

        const answerText = question
            ? '【回答】提問：' + question + '\n選項：' + winnerOption
            : '【回答】\n選項：' + winnerOption;

        addMessage({
            id: Date.now() + Math.floor(Math.random() * 1000),
            sender: (typeof settings !== 'undefined' && settings.partnerName) || '对方',
            text: answerText,
            timestamp: new Date(),
            status: 'received',
            favorited: false,
            note: null,
            type: 'normal',
            replyTo: {
                id: msgId,
                sender: 'user',
                text: question ? '【請回答】\n提問：' + question : '【請回答】'
            }
        });

        if (typeof playSound === 'function') playSound('message');
        if (typeof window._sendPartnerNotification === 'function') {
            window._sendPartnerNotification(
                (typeof settings !== 'undefined' && settings.partnerName) || '对方',
                answerText
            );
        }
    }, delay);
}

/* ══════════════════════════════════════════════════════════════
   表情 / 拍一拍 菜单
   ══════════════════════════════════════════════════════════════ */
function initComboMenu() {
    const comboBtn = document.getElementById('combo-btn');
    const picker = document.getElementById('user-sticker-picker');
    const contentArea = document.getElementById('combo-content-area');

    if (!comboBtn || !picker) return;

    if (comboBtn.dataset.initialized) return;

    comboBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = picker.classList.contains('active');

        if (isActive) {
            picker.classList.remove('active');
        } else {
            switchTab('my-sticker');
            picker.classList.add('active');
        }
    });

    comboBtn.dataset.initialized = 'true';

    document.addEventListener('click', (e) => {
        if (!picker.contains(e.target) && !comboBtn.contains(e.target)) {
            picker.classList.remove('active');
        }
    });

    const tabs = picker.querySelectorAll('.combo-tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    function updateAddBtnVisibility(tabId) {
        const addBtn = document.getElementById('sticker-add-btn');
        if (addBtn) addBtn.style.display = (tabId === 'my-sticker') ? 'flex' : 'none';
    }

    function switchTab(tabId) {
        tabs.forEach(b => b.classList.remove('active'));
        const activeBtn = Array.from(tabs).find(b => b.dataset.tab === tabId);
        if (activeBtn) activeBtn.classList.add('active');
        updateAddBtnVisibility(tabId);

        if (tabId === 'my-sticker') {
            renderMyStickerLibrary();
        } else if (tabId === 'partner-sticker') {
            renderPartnerStickerLibrary();
        } else {
            renderUserPokeMenu();
        }
    }

    function makeStickerItem(src, onClick) {
        const item = document.createElement('div');
        item.className = 'sticker-grid-item';
        item.innerHTML = `<img src="${src}" loading="lazy">`;
        item.onclick = (e) => { e.stopPropagation(); onClick(); };
        return item;
    }

    function makeDeletableStickerItem(src, onClick, onDelete) {
        const item = document.createElement('div');
        item.className = 'sticker-grid-item';
        item.style.position = 'relative';
        item.innerHTML = `<img src="${src}" loading="lazy"><div class="sticker-delete-btn" title="删除"><i class="fas fa-times"></i></div>`;
        item.querySelector('img').onclick = (e) => { e.stopPropagation(); onClick(); };
        item.querySelector('.sticker-delete-btn').onclick = (e) => { e.stopPropagation(); onDelete(); };
        return item;
    }

    function renderMyStickerLibrary() {
        contentArea.innerHTML = '';
        if (!myStickerLibrary || myStickerLibrary.length === 0) {
            contentArea.innerHTML = `
                <div class="empty-sticker-tip">
                    <i class="fas fa-user-circle"></i>
                    还没有我的专属表情哦<br>
                    点击右上角"添加"按钮上传图片~
                </div>
            `;
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'sticker-grid-view';
        myStickerLibrary.forEach((src, idx) => {
            const item = makeDeletableStickerItem(src, () => {
                addMessage({ id: Date.now(), sender: 'user', text: '', timestamp: new Date(), image: src, status: 'sent', type: 'normal' });
                playSound('send');
                picker.classList.remove('active');
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                setTimeout(simulateReply, settings.replyDelayMin + Math.random() * delayRange);
            }, () => {
                myStickerLibrary.splice(idx, 1);
                localforage.setItem(getStorageKey('myStickerLibrary'), myStickerLibrary);
                showNotification('✓ 已删除', 'success');
                renderMyStickerLibrary();
            });
            grid.appendChild(item);
        });
        contentArea.appendChild(grid);
    }

    function renderPartnerStickerLibrary() {
        contentArea.innerHTML = '';
        if (!stickerLibrary || stickerLibrary.length === 0) {
            contentArea.innerHTML = `
                <div class="empty-sticker-tip">
                    <i class="far fa-images"></i>
                    对方表情库还是空的哦<br>
                    请去"高级功能"->"自定义回复"->"表情库"中添加图片~
                </div>
            `;
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'sticker-grid-view';
        stickerLibrary.forEach(src => {
            const item = makeStickerItem(src, () => {
                addMessage({ id: Date.now(), sender: 'user', text: '', timestamp: new Date(), image: src, status: 'sent', type: 'normal' });
                playSound('send');
                picker.classList.remove('active');
                const delayRange = settings.replyDelayMax - settings.replyDelayMin;
                setTimeout(simulateReply, settings.replyDelayMin + Math.random() * delayRange);
            });
            grid.appendChild(item);
        });
        contentArea.appendChild(grid);
    }

    function renderUserPokeMenu() {
        contentArea.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'poke-list-view';

        const customBtn = document.createElement('button');
        customBtn.className = 'custom-poke-btn';
        customBtn.innerHTML = '<i class="fas fa-pen"></i> 自定义动作';
        customBtn.onclick = (e) => {
            e.stopPropagation();
            picker.classList.remove('active');
            showModal(DOMElements.pokeModal.modal, DOMElements.pokeModal.input);
        };
        wrapper.appendChild(customBtn);

        const userPresets = [
            "拍了拍对方的头",
            "戳了戳对方的脸颊",
            "抱住了对方",
            "给对方比了个心",
            "牵起了对方的手",
            "看着对方发呆"
        ];

        const title = document.createElement('div');
        title.style.fontSize = '12px';
        title.style.color = 'var(--text-secondary)';
        title.style.marginBottom = '5px';
        title.innerText = '快捷动作';
        wrapper.appendChild(title);

        userPresets.forEach(text => {
            const item = document.createElement('div');
            item.className = 'poke-quick-item';
            item.innerText = text;
            item.onclick = (e) => {
                e.stopPropagation();
                addMessage({
                    id: Date.now(),
                    text: _formatPokeText(`${settings.myName} ${text}`),
                    timestamp: new Date(),
                    type: 'system'
                });
                picker.classList.remove('active');

                setTimeout(simulateReply, 1500);
            };
            wrapper.appendChild(item);
        });

        contentArea.appendChild(wrapper);
    }
}

/* ══════════════════════════════════════════════════════════════
   兼容占位（若其他文件调用已删除的占卜函数，不会报错）
   ══════════════════════════════════════════════════════════════ */
window.generateFortune = function() {
    if (typeof showNotification === 'function') {
        showNotification('运势占卜功能已移除', 'info', 2000);
    }
};
window.switchFLTab = function() {};
window.startLenormandDraw = function() {};
window.resetLenormand = function() {};
window.startTarotDraw = function() {};
window.resetTarotDivination = function() {};
window.setLenormandCount = function() {};
window.setLenormandSystem = function() {};
window.clearDiviHistory = function() {};
window.toggleDiviDetail = function() {};
