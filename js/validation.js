// Validates raw form input and returns a { field: message } map of errors.
// An empty object means the input is valid.
const Validation = {
  todayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  validate({ amount, category, date, description }) {
    const errors = {};

    if (amount === "" || amount === null || amount === undefined) {
      errors.amount = "Amount is required.";
    } else {
      const amountNum = Number(amount);
      if (Number.isNaN(amountNum) || amountNum <= 0) {
        errors.amount = "Enter a valid amount greater than 0.";
      }
    }

    if (!category) {
      errors.category = "Please select a category.";
    }

    if (!date) {
      errors.date = "Date is required.";
    } else if (Number.isNaN(new Date(date).getTime())) {
      errors.date = "Enter a valid date.";
    } else if (date > Validation.todayStr()) {
      errors.date = "Date cannot be in the future.";
    }

    const trimmedDescription = (description || "").trim();
    if (!trimmedDescription) {
      errors.description = "Description is required.";
    } else if (trimmedDescription.length > 100) {
      errors.description = "Description must be under 100 characters.";
    }

    return errors;
  }
};
