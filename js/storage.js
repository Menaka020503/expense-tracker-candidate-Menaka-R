// Wraps browser LocalStorage so the rest of the app never touches it directly.
const Storage = {
  KEY: "expenseTracker.transactions.v1",

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("Failed to load transactions from LocalStorage:", err);
      return [];
    }
  },

  save(transactions) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(transactions));
    } catch (err) {
      console.error("Failed to save transactions to LocalStorage:", err);
    }
  }
};
