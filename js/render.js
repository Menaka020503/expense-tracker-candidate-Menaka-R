// Pure-ish DOM rendering helpers. These read from `transactions` passed in as
// arguments and never mutate app state themselves.
const Render = {
  currencyFormatter: new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }),

  dateFormatter: new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }),

  formatCurrency(value) {
    return this.currencyFormatter.format(value || 0);
  },

  formatDate(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return dateStr;
    return this.dateFormatter.format(new Date(y, m - 1, d));
  },

  computeTotals(transactions) {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  },

  isCurrentMonth(dateStr) {
    const now = new Date();
    const currentPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return dateStr.startsWith(currentPrefix);
  },

  populateCategoryOptions(selectEl, type, selectedValue) {
    selectEl.innerHTML = '<option value="">Select category</option>';
    for (const cat of CATEGORIES[type]) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      selectEl.appendChild(opt);
    }
    if (selectedValue) selectEl.value = selectedValue;
  },

  populateCategoryFilter(selectEl, transactions) {
    const previousValue = selectEl.value || "all";
    const allCategories = [...new Set(transactions.map((t) => t.category))].sort();

    selectEl.innerHTML = '<option value="all">All Categories</option>';
    for (const cat of allCategories) {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      selectEl.appendChild(opt);
    }

    if (allCategories.includes(previousValue) || previousValue === "all") {
      selectEl.value = previousValue;
    } else {
      selectEl.value = "all";
    }
  },

  renderSummary(transactions) {
    const { income, expense, balance } = this.computeTotals(transactions);
    document.getElementById("totalIncome").textContent = this.formatCurrency(income);
    document.getElementById("totalExpense").textContent = this.formatCurrency(expense);

    const balanceEl = document.getElementById("totalBalance");
    balanceEl.textContent = this.formatCurrency(balance);
    balanceEl.classList.toggle("negative", balance < 0);
  },

  renderMonthlySummary(transactions) {
    const now = new Date();
    document.getElementById("currentMonthLabel").textContent = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });

    const monthTransactions = transactions.filter((t) => this.isCurrentMonth(t.date));
    const { income, expense, balance } = this.computeTotals(monthTransactions);

    document.getElementById("monthIncome").textContent = this.formatCurrency(income);
    document.getElementById("monthExpense").textContent = this.formatCurrency(expense);

    const monthBalanceEl = document.getElementById("monthBalance");
    monthBalanceEl.textContent = this.formatCurrency(balance);
    monthBalanceEl.classList.toggle("expense", balance < 0);
  },

  renderTransactionList(transactions) {
    const listEl = document.getElementById("transactionList");
    const emptyStateEl = document.getElementById("emptyState");

    listEl.innerHTML = "";

    if (transactions.length === 0) {
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    const sorted = [...transactions].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.id - a.id;
    });

    sorted.forEach((t, index) => {
      const li = document.createElement("li");
      li.className = `ledger-row transaction-item ${t.type}`;
      li.dataset.id = t.id;

      const serial = String(index + 1).padStart(2, "0");
      const sign = t.type === "income" ? "+" : "−";
      const drCr = t.type === "income" ? "Cr" : "Dr";

      li.innerHTML = `
        <span class="col-no mono">${serial}</span>
        <span class="col-details">
          <span class="transaction-description">${this.escapeHtml(t.description)}</span>
          <span class="transaction-meta">${this.escapeHtml(t.category)} &middot; ${this.formatDate(t.date)}</span>
        </span>
        <span class="col-amount mono ${t.type}">
          <span class="dr-cr">${drCr}</span>${sign}${this.formatCurrency(t.amount)}
        </span>
        <span class="col-actions">
          <button type="button" class="link-btn edit-btn" data-id="${t.id}">Edit</button>
          <button type="button" class="link-btn delete-btn" data-id="${t.id}">Delete</button>
        </span>
      `;

      listEl.appendChild(li);
    });
  },

  renderCategoryChart(transactions) {
    const chartEl = document.getElementById("categoryChart");
    const emptyStateEl = document.getElementById("chartEmptyState");

    const expenses = transactions.filter((t) => t.type === "expense");

    if (expenses.length === 0) {
      chartEl.innerHTML = "";
      emptyStateEl.hidden = false;
      return;
    }
    emptyStateEl.hidden = true;

    const totalsByCategory = {};
    let totalExpense = 0;
    for (const t of expenses) {
      totalsByCategory[t.category] = (totalsByCategory[t.category] || 0) + t.amount;
      totalExpense += t.amount;
    }

    const rows = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]);

    const barsHtml = rows
      .map(([category, amount]) => {
        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return `
          <div class="chart-row">
            <div class="chart-label">
              <span>${this.escapeHtml(category)}</span>
              <span class="chart-amount mono">${this.formatCurrency(amount)} &middot; ${percent.toFixed(1)}%</span>
            </div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" style="width: ${percent.toFixed(1)}%"></div>
            </div>
          </div>
        `;
      })
      .join("");

    chartEl.innerHTML = `
      ${barsHtml}
      <div class="chart-axis mono"><span>0%</span><span>50%</span><span>100%</span></div>
    `;
  },

  showFieldError(fieldName, message) {
    const group = document.getElementById(fieldName).closest(".form-group");
    const errorEl = document.getElementById(`${fieldName}Error`);
    group.classList.toggle("invalid", Boolean(message));
    errorEl.textContent = message || "";
  },

  clearFieldErrors() {
    for (const field of ["amount", "category", "date", "description"]) {
      this.showFieldError(field, "");
    }
  },

  escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
};
