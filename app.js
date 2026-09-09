const iconPath = name => {
  const assetRoot = window.location.pathname.includes("/web-preview/") ? "../assets" : "assets";
  return `${assetRoot}/icons/${name}.svg`;
};

const state = {
  view: "flow",
  month: 8,
  year: 2026,
  today: "2026-09-10",
  income: [
    { name: "滴滴", icon: "icon-didi", amount: 9396.5, days: 31 },
    { name: "美团", icon: "icon-meituan", amount: 1394.1, days: 16 },
    { name: "T3", icon: "icon-t3", amount: 1029.85, days: 16 },
    { name: "曹操", icon: "icon-caocao", amount: 859.7, days: 16 },
    { name: "享道", icon: "icon-xiangdao", amount: 791.3, days: 16 }
  ],
  expense: [
    { name: "充电", icon: "⚡", amount: 900, percent: 21.3 },
    { name: "餐饮", icon: "🍜", amount: 302, percent: 7.1 },
    { name: "维修", icon: "🔧", amount: 123, percent: 2.9 },
    { name: "停车", icon: "🅿️", amount: 96, percent: 2.3 },
    { name: "其他", icon: "📦", amount: 80, percent: 1.9 }
  ],
  daily: [
    { day: 1, income: 422.95, expense: 30 },
    { day: 2, income: 396.63, expense: 30 },
    { day: 3, income: 425.67, expense: 30 },
    { day: 4, income: 436.67, expense: 42 },
    { day: 5, income: 373.16, expense: 3130 },
    { day: 6, income: 432.57, expense: 30 },
    { day: 7, income: 426.55, expense: 65 },
    { day: 8, income: 413.65, expense: 45 },
    { day: 9, income: 489.2, expense: 30 },
    { day: 10, income: 426.1, expense: 28 }
  ],
  targets: {
    week: { target: 3000, current: 3009.1 },
    month: { target: 12000, current: 13471.45 }
  }
};

const money = value => {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return rounded.toString();
};

const totalIncome = () => state.income.reduce((sum, item) => sum + item.amount, 0);
const totalExpense = () => state.expense.reduce((sum, item) => sum + item.amount, 0);

function progress(current, target) {
  if (!target) return { done: 0, over: 0, remain: 0, overflow: 0 };
  if (current <= target) {
    return {
      done: Math.min((current / target) * 100, 100),
      over: 0,
      remain: target - current,
      overflow: 0
    };
  }
  const overflow = current - target;
  return {
    done: (target / current) * 100,
    over: (overflow / current) * 100,
    remain: 0,
    overflow
  };
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
  render();
}

function wxNav(title) {
  return `
    <div class="wx-nav">
      <button class="back-dot" type="button">‹</button>
      <div class="wx-title">${title}</div>
      <div class="wx-menu"><span>•••</span><i></i><span>◎</span></div>
    </div>
  `;
}

function hero(title, sub, segments, activeIndex = 0) {
  return `
    <section class="hero">
      <div class="hero-title-row">
        <span class="hero-back">←</span>
        <div>
          <div class="hero-title">${title}</div>
          ${sub ? `<div class="hero-sub">${sub}</div>` : ""}
        </div>
      </div>
      <div class="hero-segment ${segments.length === 3 ? "three" : ""}">
        ${segments.map((item, index) => `
          <div class="segment-item ${index === activeIndex ? "active" : ""}">${item}</div>
        `).join("")}
      </div>
    </section>
  `;
}

function metrics() {
  const income = totalIncome();
  const expense = totalExpense();
  const net = income - expense;
  return `
    <section class="metrics-grid">
      <div class="metric">
        <div class="metric-label">总收入</div>
        <div class="metric-value green">¥${money(income)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">总支出</div>
        <div class="metric-value red">¥${money(expense)}</div>
      </div>
      <div class="metric">
        <div class="metric-label">净收入</div>
        <div class="metric-value blue">¥${money(net)}</div>
      </div>
    </section>
  `;
}

function title(icon, text, action = "") {
  return `
    <div class="section-title">
      <div class="section-title-main"><span class="title-icon">${icon}</span><span>${text}</span></div>
      ${action ? `<button class="small-action" type="button">${action}</button>` : ""}
    </div>
  `;
}

function targetCard(label, data, monthly = false) {
  const p = progress(data.current, data.target);
  const status = p.overflow > 0 ? `超出 ¥${money(p.overflow)}` : `还差 ¥${money(p.remain)}`;
  return `
    <section class="card">
      ${title("🎯", label)}
      <div class="target-track">
        <div class="target-fill ${monthly ? "month" : ""}" style="width:${p.done}%">¥${money(data.target)}</div>
        ${p.over > 0 ? `<div class="target-over" style="width:${p.over}%">+¥${money(p.overflow)}</div>` : ""}
      </div>
      <div class="target-meta">
        <span>${monthly ? "本月" : "本周"}目标 ¥${money(data.target)}</span>
        <span class="target-status">${status}</span>
      </div>
    </section>
  `;
}

function dayStrip() {
  return `
    <section class="card">
      <div class="day-strip">
        ${Array.from({ length: 31 }, (_, index) => `
          <div class="day-bar ${index < 28 ? "worked" : ""}"></div>
        `).join("")}
      </div>
      <span class="day-text">已出车 28 天</span>
    </section>
  `;
}

function flowView() {
  const todayItems = [
    { kind: "income", label: "滴滴", iconUrl: iconPath("icon-didi"), amount: 268.5 },
    { kind: "income", label: "高德", iconUrl: iconPath("icon-gaode"), amount: 156.4 },
    { kind: "expense", label: "充电", icon: "⚡", amount: 30 }
  ];
  const todayIncome = state.daily.find(item => item.day === 10)?.income || 0;
  const todayExpense = state.daily.find(item => item.day === 10)?.expense || 0;
  const todayNet = todayIncome - todayExpense;
  const workHours = 10.5;
  const distance = 286;
  const hourly = todayIncome / workHours;
  const perKm = todayIncome / distance;

  return `
    <header class="flow-header">
      <div>
        <div class="flow-kicker">今天 · 2026年9月10日</div>
        <h1>流水</h1>
      </div>
      <button class="header-add" type="button" aria-label="添加流水">＋</button>
    </header>
    <section class="today-summary">
      <div class="today-summary-main">
        <span>今日净收入</span>
        <strong>¥${money(todayNet)}</strong>
      </div>
      <div class="summary-pair">
        <div><span>收入</span><b>¥${money(todayIncome)}</b></div>
        <div><span>支出</span><b>¥${money(todayExpense)}</b></div>
      </div>
    </section>
    <section class="efficiency-row">
      <div class="efficiency-card"><span>平均时薪</span><strong>¥${money(hourly)}<em>/小时</em></strong><small>出车 ${workHours} 小时</small></div>
      <div class="efficiency-card"><span>每公里收入</span><strong>¥${money(perKm)}<em>/公里</em></strong><small>行驶 ${distance} 公里</small></div>
    </section>
    <div class="content">
      <section class="card">
        ${title("📱", "平台收入")}
        <div class="flow-list">
          ${todayItems.filter(item => item.kind === "income").map(item => `
            <div class="flow-item">
              <div class="icon-box">
                ${item.iconUrl ? `<img src="${item.iconUrl}" alt="">` : `<span class="emoji-icon">${item.icon}</span>`}
              </div>
              <div>
                <div class="item-title">${item.label}</div>
                <div class="item-sub">${item.kind === "income" ? "收入平台" : "支出分类"}</div>
              </div>
              <div class="amount green">+¥${money(item.amount)}</div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card">
        ${title("📋", "今日支出")}
        <div class="flow-list">
          ${todayItems.filter(item => item.kind === "expense").map(item => `
            <div class="flow-item">
              <div class="icon-box"><span class="emoji-icon">${item.icon}</span></div>
              <div><div class="item-title">${item.label}</div><div class="item-sub">支出分类</div></div>
              <div class="amount red">-¥${money(item.amount)}</div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card">
        ${title("🧾", "今日流水")}
        <div class="flow-list compact-flow-list">
          ${todayItems.map(item => `
            <div class="flow-line">
              <span>${item.label}</span>
              <b class="${item.kind === "income" ? "green" : "red"}">${item.kind === "income" ? "+" : "-"}¥${money(item.amount)}</b>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function calendarDays() {
  const days = [];
  const first = new Date(state.year, state.month, 1).getDay();
  const count = new Date(state.year, state.month + 1, 0).getDate();
  for (let i = 0; i < first; i += 1) days.push({ off: true, day: "" });
  for (let day = 1; day <= count; day += 1) {
    const row = state.daily.find(item => item.day === day);
    days.push({
      day,
      today: day === 10,
      income: row ? row.income : 0,
      expense: row ? row.expense : 0
    });
  }
  return days;
}

function calendarView() {
  return `
    ${wxNav("出车收支日历")}
    ${hero("日历", "每天收入支出，一格看清", ["日历视图", "月度统计"], 0)}
    <div class="content">
      <section class="month-nav">
        <button class="nav-circle" type="button">‹</button>
        <div class="month-title">2026年9月</div>
        <button class="nav-circle" type="button">›</button>
      </section>
      ${dayStrip()}
      <section class="card">
        <div class="week-grid">
          ${["日", "一", "二", "三", "四", "五", "六"].map(day => `<div>${day}</div>`).join("")}
        </div>
        <div class="day-grid">
          ${calendarDays().map(item => `
            <div class="day-cell ${item.off ? "off" : ""} ${item.today ? "today" : ""}">
              <div class="day-number">${item.day}</div>
              ${item.income ? `<span class="day-money green">+${money(item.income)}</span>` : ""}
              ${item.expense ? `<span class="day-money red">-${money(item.expense)}</span>` : ""}
            </div>
          `).join("")}
        </div>
      </section>
      ${targetCard("本月流水目标", state.targets.month, true)}
    </div>
  `;
}

function statsView() {
  const maxIncome = Math.max(...state.daily.map(item => item.income));
  return `
    ${wxNav("出车收支日历")}
    ${hero("统计", "支持周报、月报、年报", ["周报", "月报", "年报"], 1)}
    ${metrics()}
    <div class="content">
      ${dayStrip()}
      <section class="card chart-card">
        <div class="section-title">
          <div class="section-title-main"><span class="title-icon">📊</span><span>收支统计</span></div>
          <div class="chart-tabs">
            <button class="chart-tab" type="button">支出</button>
            <button class="chart-tab active" type="button">收入</button>
          </div>
        </div>
        <div class="bar-chart">
          <div class="y-axis"><span>1000</span><span>800</span><span>600</span><span>400</span><span>200</span><span>0</span></div>
          <div class="chart-area">
            <div class="grid-line one"></div>
            <div class="grid-line two"></div>
            ${state.daily.map(item => `
              <div class="bar-wrap">
                <div class="bar" style="height:${Math.max((item.income / maxIncome) * 180, 4)}px"></div>
                <span class="bar-day">${item.day}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
      <section class="card">
        ${title("📱", "平台收入分布")}
        <div class="platform-list">
          ${state.income.map(item => `
            <div class="platform-item">
              <div class="icon-box"><img src="${iconPath(item.icon)}" alt=""></div>
              <div>
                <div class="item-title">${item.name}</div>
                <div class="item-sub">${item.days}天 ¥${money(item.amount)}</div>
                <div class="progress-bg"><div class="platform-fill" style="width:${(item.amount / state.income[0].amount) * 100}%"></div></div>
              </div>
              <div class="amount green">¥${money(item.amount)}</div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card">
        ${title("📊", "支出分类统计")}
        <div class="expense-list">
          ${state.expense.map(item => `
            <div class="expense-item">
              <div class="icon-box"><span class="emoji-icon">${item.icon}</span></div>
              <div>
                <div class="item-title">${item.name}</div>
                <div class="progress-bg"><div class="expense-fill" style="width:${item.percent}%"></div></div>
              </div>
              <div>
                <div class="amount red">¥${money(item.amount)}</div>
                <div class="percent-pill">占比 ${item.percent}%</div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="card">
        ${title("📋", "每日收支明细")}
        <div class="daily-header"><div>日期</div><div>收入</div><div>支出</div><div>结余</div></div>
        <div class="daily-list">
          ${state.daily.map(item => {
            const net = item.income - item.expense;
            return `
              <div class="daily-item">
                <div>9月${item.day}日</div>
                <div class="green">+${money(item.income)}</div>
                <div class="red">-${money(item.expense)}</div>
                <div class="${net >= 0 ? "blue" : "red"}">${net >= 0 ? "+" : ""}${money(net)}</div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    </div>
  `;
}

function mineView() {
  const settings = [
    ["💧", "流水显示", "统计周期"],
    ["🎯", "流水计划", "目标管理"],
    ["💰", "收入平台", "平台排序"],
    ["💸", "支出分类", "分类管理"],
    ["📦", "数据备份", "CSV 导出"],
    ["📖", "使用手册", "记账说明"]
  ];

  return `
    ${wxNav("我的")}
    ${hero("我的", "设置分类、目标、备份", ["功能设置", "终身解锁"], 0)}
    <div class="content">
      <section class="card pay-card">
        <div class="section-title"><div class="section-title-main"><span>终身解锁</span></div></div>
        <div class="price">¥9.9</div>
        <div class="pay-sub">一次买断，不订阅，不上传收入数据</div>
        <div class="pay-points">
          <div>✓ 完整统计和平台收入分布</div>
          <div>✓ 自定义收入平台与支出分类</div>
          <div>✓ CSV 导出备份，长期留档</div>
        </div>
      </section>
      <section class="card">
        ${title("⚙️", "功能设置")}
        <div class="setting-grid">
          ${settings.map(item => `
            <div class="setting-item">
              <div class="setting-icon">${item[0]}</div>
              <div class="setting-title">${item[1]}</div>
              <div class="setting-desc">${item[2]}</div>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function render() {
  const views = {
    flow: flowView,
    calendar: calendarView,
    stats: statsView,
    mine: mineView
  };
  document.getElementById("app").innerHTML = views[state.view]();
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => setView(tab.dataset.view));
});

render();
