(function () {
  let transactions = Storage.load();
  let editingId = null;
  let activeTypeFilter = "all";

  const form = document.getElementById("transactionForm");
  const typeExpenseRadio = document.getElementById("typeExpense");
  const typeIncomeRadio = document.getElementById("typeIncome");
  const amountInput = document.getElementById("amount");
  const categorySelect = document.getElementById("category");
  const dateInput = document.getElementById("date");
  const descriptionInput = document.getElementById("description");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const formTitle = document.getElementById("formTitle");

  const transactionList = document.getElementById("transactionList");
  const categoryFilterSelect = document.getElementById("categoryFilter");
  const typeFilterButtons = document.querySelectorAll(".filter-tab");

  function getSelectedType() {
    return typeIncomeRadio.checked ? "income" : "expense";
  }

  function getFilteredTransactions() {
    const categoryFilter = categoryFilterSelect.value;
    return transactions.filter((t) => {
      const matchesType = activeTypeFilter === "all" || t.type === activeTypeFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesType && matchesCategory;
    });
  }

  function renderAll() {
    Render.renderSummary(transactions);
    Render.renderMonthlySummary(transactions);
    Render.populateCategoryFilter(categoryFilterSelect, transactions);
    Render.renderTransactionList(getFilteredTransactions());
    Render.renderCategoryChart(transactions);
  }

  function resetForm() {
    form.reset();
    typeExpenseRadio.checked = true;
    Render.populateCategoryOptions(categorySelect, "expense");
    dateInput.max = Validation.todayStr();
    dateInput.value = Validation.todayStr();
    Render.clearFieldErrors();
    editingId = null;
    submitBtn.textContent = "Add Transaction";
    formTitle.textContent = "Add Transaction";
    cancelEditBtn.hidden = true;
  }

  function handleTypeChange() {
    const type = getSelectedType();
    const currentValue = categorySelect.value;
    Render.populateCategoryOptions(categorySelect, type, CATEGORIES[type].includes(currentValue) ? currentValue : "");
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const values = {
      type: getSelectedType(),
      amount: amountInput.value,
      category: categorySelect.value,
      date: dateInput.value,
      description: descriptionInput.value
    };

    const errors = Validation.validate(values);
    Render.clearFieldErrors();

    if (Object.keys(errors).length > 0) {
      for (const [field, message] of Object.entries(errors)) {
        Render.showFieldError(field, message);
      }
      return;
    }

    const transaction = {
      id: editingId || Date.now(),
      type: values.type,
      amount: Number(values.amount),
      category: values.category,
      date: values.date,
      description: values.description.trim()
    };

    if (editingId) {
      transactions = transactions.map((t) => (t.id === editingId ? transaction : t));
    } else {
      transactions.push(transaction);
    }

    Storage.save(transactions);
    resetForm();
    renderAll();
  }

  function handleEditClick(id) {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    editingId = id;

    if (transaction.type === "income") {
      typeIncomeRadio.checked = true;
    } else {
      typeExpenseRadio.checked = true;
    }
    Render.populateCategoryOptions(categorySelect, transaction.type, transaction.category);

    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
    descriptionInput.value = transaction.description;

    Render.clearFieldErrors();
    submitBtn.textContent = "Update Transaction";
    formTitle.textContent = "Edit Transaction";
    cancelEditBtn.hidden = false;

    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDeleteClick(id) {
    transactions = transactions.filter((t) => t.id !== id);
    Storage.save(transactions);
    if (editingId === id) resetForm();
    renderAll();
  }

  function handleTransactionListClick(e) {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      handleEditClick(Number(editBtn.dataset.id));
    } else if (deleteBtn) {
      handleDeleteClick(Number(deleteBtn.dataset.id));
    }
  }

  function handleTypeFilterClick(e) {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;

    activeTypeFilter = btn.dataset.type;
    typeFilterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    Render.renderTransactionList(getFilteredTransactions());
  }

  function init() {
    Render.populateCategoryOptions(categorySelect, "expense");
    dateInput.max = Validation.todayStr();
    dateInput.value = Validation.todayStr();

    typeExpenseRadio.addEventListener("change", handleTypeChange);
    typeIncomeRadio.addEventListener("change", handleTypeChange);
    form.addEventListener("submit", handleFormSubmit);
    cancelEditBtn.addEventListener("click", resetForm);
    transactionList.addEventListener("click", handleTransactionListClick);
    categoryFilterSelect.addEventListener("change", () => {
      Render.renderTransactionList(getFilteredTransactions());
    });
    typeFilterButtons.forEach((btn) => btn.addEventListener("click", handleTypeFilterClick));

    renderAll();
  }

  init();
})();
