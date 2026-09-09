const iconPath = name => {
  const assetRoot = window.location.pathname.includes("/web-preview/") ? "../assets" : "assets";
  return `${assetRoot}/icons/${name}.svg`;
};

const state = {
  view: "flow",
  period: "month",
  month: 8,
  year: 2026,
  today: "2026-09-09",
  income: [
    { name: "滴滴", icon: "icon-didi", amount: 9396.5, days: 31 },
    { name: "美团", icon: "icon-meituan", amount: 1394.1, days: 16 },
    { name: "T3", icon: "icon-t3", amount: 1029.85, days: 16 },
    { name: "曹操", icon: "icon-caocao", amount: 859.7, days: 16 },
    { name: "享道", icon: "icon-xiangdao", amount: 791.3, days: 16 }
  ],
  expense: [
    { name: "充电", icon: "⚡", amount: 900, percent: 21.3 },
    { name: "维修", icon: "🔧", amount: 123, percent: 2.9 },
    { name: "停车", icon: "🅿️", amount: 96, percent: 2.3 },
    { name: "餐饮", icon: "🍜", amount: 302, percent: 7.1 },
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
  const total = current;
  return {
    done: (target / total) * 100,
    over: (overflow / total) * 100,
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

function header(title, sub, pill = "Web 预览") {
  return `
    <section class="top-hero">
      <div class="hero-row">
        <div>
          <h1 class="hero-title">${title}</h1>
          <div class="hero-sub">${sub}</div>
        </div>
        <div class="hero-pill">${pill}</div>
      </div>
    </section>
  `;
}

function metrics() {
  const income = totalIncome();
  const expense = totalExpense();
  const net = income - expense;
  return `
    <section class="metrics">
      <div class="metric-card">
        <div class="metric-label">总收入</div>
        <div class="metric-value green">¥${money(income)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">总支出</div>
        <div class="metric-value red">¥${money(expense)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">净收入</div>
        <div class="metric-value blue">¥${money(net)}</div>
      </div>
    </section>
  `;
}

function targetCard(label, data) {
  const p = progress(data.current, data.target);
  const status = p.overflow > 0 ? `超出 ¥${money(p.overflow)}` : `还差 ¥${money(p.remain)}`;
  return `
    <div class="card">
      <div class="section-title">
        <span>${label}</span>
        <button class="section-action" type="button">${status}</button>
      </div>
      <div class="target-track">
        <div class="target-fill" style="width:${p.done}%"></div>
        ${p.over > 0 ? `<div class="target-over" style="width:${p.over}%"></div>` : ""}
      </div>
      <div class="target-labels">
        <span class="small-muted">目标 ¥${money(data.target)}</span>
        <strong>当前 ¥${money(data.current)}</strong>
      </div>
    </div>
  `;
}

function flowView() {
  const todayItems = [
    { kind: "income", label: "滴滴", iconUrl: iconPath("icon-didi"), amount: 268.5 },
    { kind: "income", label: "高德", iconUrl: iconPath("icon-gaode"), amount: 156.4 },
    { kind: "expense", label: "充电", icon: "⚡", amount: 30 }
  ];

  return `
    ${header("流水", "今天收车后 30 秒记一笔 · ${state.today}", "当月")}
    ${metrics()}
    ${targetCard("本周流水目标", state.targets.week)}
    <section class="card">
      <div class="section-title">
        <span>今日流水</span>
        <button class="section-action" type="button">+ 记一笔</button>
      </div>
      <div class="flow-list">
        ${todayItems.map(item => `
          <div class="flow-item">
            <div class="icon-box">
              ${item.iconUrl ? `<img src="${item.iconUrl}" alt="">` : `<span class="emoji-icon">${item.icon}</span>`}
            </div>
            <div>
              <div class="item-title">${item.label}</div>
              <div class="item-sub">${item.kind === "income" ? "收入" : "支出"}</div>
            </div>
            <div class="amount ${item.kind === "income" ? "text-green" : "text-red"}">
              ${item.kind === "income" ? "+" : "-"}¥${money(item.amount)}
            </div>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="card">
      <div class="section-title"><span>快速记录</span></div>
      <div class="quick-grid">
        <button class="quick-btn income" type="button">+ 收入</button>
        <button class="quick-btn expense" type="button">- 支出</button>
      </div>
    </section>
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
      today: day === 9,
      income: row ? row.income : 0,
      expense: row ? row.expense : 0
    });
  }
  return days;
}

function calendarView() {
  return `
    ${header("日历", "按日期查看每天的收入、支出和结余", "2026年9月")}
    <section class="card calendar-card">
      <div class="calendar-head">
        <button class="nav-btn" type="button">‹</button>
        <div class="month-name">2026年9月</div>
        <button class="nav-btn" type="button">›</button>
      </div>
      <div class="week-grid">
        ${["日", "一", "二", "三", "四", "五", "六"].map(day => `<div>${day}</div>`).join("")}
      </div>
      <div class="day-grid">
        ${calendarDays().map(item => `
          <div class="day-cell ${item.off ? "off" : ""} ${item.today ? "today" : ""}">
            <div class="day-number">${item.day}</div>
            ${item.income ? `<span class="day-money text-green">+${money(item.income)}</span>` : ""}
            ${item.expense ? `<span class="day-money text-red">-${money(item.expense)}</span>` : ""}
          </div>
        `).join("")}
      </div>
    </section>
    ${targetCard("本月流水目标", state.targets.month)}
  `;
}

function statsView() {
  const maxIncome = Math.max(...state.daily.map(item => item.income));
  return `
    ${header("统计", "平台收入、支出分类、每日明细", "月报")}
    <div class="period-tabs">
      ${["周报", "月报", "年报"].map(label => `
        <button class="period-tab ${label === "月报" ? "active" : ""}" type="button">${label}</button>
      `).join("")}
    </div>
    ${metrics()}
    <section class="card">
      <div class="section-title">
        <span>收支统计</span>
        <button class="section-action" type="button">收入</button>
      </div>
      <div class="mini-chart">
        ${state.daily.map(item => `<div class="bar" style="height:${Math.max((item.income / maxIncome) * 140, 4)}px"></div>`).join("")}
      </div>
    </section>
    <section class="card">
      <div class="section-title"><span>平台收入分布</span></div>
      <div class="platform-list">
        ${state.income.map(item => `
          <div class="platform-item">
            <div class="icon-box"><img src="${iconPath(item.icon)}" alt=""></div>
            <div>
              <div class="item-title">${item.name}</div>
              <div class="item-sub">${item.days}天 ¥${money(item.amount)}</div>
              <div class="platform-progress"><div style="width:${(item.amount / state.income[0].amount) * 100}%"></div></div>
            </div>
            <div class="amount text-green">¥${money(item.amount)}</div>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="card">
      <div class="section-title"><span>支出分类统计</span></div>
      <div class="expense-list">
        ${state.expense.map(item => `
          <div class="expense-item">
            <div class="icon-box"><span class="emoji-icon">${item.icon}</span></div>
            <div>
              <div class="item-title">${item.name}</div>
              <div class="item-sub">占比 ${item.percent}%</div>
              <div class="expense-progress"><div style="width:${item.percent}%"></div></div>
            </div>
            <div class="amount text-red">¥${money(item.amount)}</div>
          </div>
        `).join("")}
      </div>
    </section>
    <section class="card">
      <div class="section-title"><span>每日收支明细</span></div>
      <div class="daily-header">
        <div>日期</div><div>收入</div><div>支出</div><div>结余</div>
      </div>
      <div class="daily-list">
        ${state.daily.map(item => {
          const net = item.income - item.expense;
          return `
            <div class="daily-item">
              <div>9月${item.day}日</div>
              <div class="text-green">+${money(item.income)}</div>
              <div class="text-red">-${money(item.expense)}</div>
              <div class="${net >= 0 ? "text-blue" : "text-red"}">${net >= 0 ? "+" : ""}${money(net)}</div>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function mineView() {
  const settings = [
    ["💧", "流水显示", "选择流水页五个核心指标的统计周期"],
    ["🎯", "流水计划", "设置周目标、月目标和超出显示"],
    ["💰", "收入平台", "管理滴滴、高德、美团等平台"],
    ["💸", "支出分类", "管理充电、加油、停车、维修"],
    ["📦", "数据备份", "导出 CSV，降低本地数据丢失风险"],
    ["📖", "使用手册", "查看记账和统计说明"]
  ];

  return `
    ${header("我的", "设置分类、目标、备份和终身解锁", "设置")}
    <section class="card pay-card">
      <div class="section-title"><span>终身解锁</span></div>
      <div class="price">¥9.9</div>
      <div class="small-muted">一次买断，不订阅，不上传收入数据</div>
      <div class="pay-points">
        <div>✓ 解锁完整统计和平台收入分布</div>
        <div>✓ 自定义收入平台与支出分类</div>
        <div>✓ CSV 导出备份，长期留档</div>
      </div>
    </section>
    <section class="card">
      <div class="section-title"><span>功能设置</span></div>
      <div class="settings-list">
        ${settings.map(item => `
          <div class="setting-row">
            <div class="emoji-icon">${item[0]}</div>
            <div>
              <div class="setting-title">${item[1]}</div>
              <div class="setting-desc">${item[2]}</div>
            </div>
            <div class="switch"></div>
          </div>
        `).join("")}
      </div>
    </section>
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
