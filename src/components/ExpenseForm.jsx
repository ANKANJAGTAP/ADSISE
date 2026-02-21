// ============================================================
// ExpenseForm Component — Expense Tracker PWA
// ============================================================
// Controlled form for adding a new expense.
// Collects title (string) and amount (number), validates both,
// then calls the onAdd callback passed in from the parent.
// ============================================================

import { useState } from 'react';

function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation — both fields required, amount must be > 0
    const trimmedTitle = title.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedTitle) {
      alert('Please enter an expense title.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    // Delegate to parent to persist via IndexedDB
    await onAdd({ title: trimmedTitle, amount: parsedAmount });

    // Reset the form fields
    setTitle('');
    setAmount('');
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>
      <div className="form-group">
        <label htmlFor="expense-title">Title</label>
        <input
          id="expense-title"
          type="text"
          placeholder="e.g. Groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="expense-amount">Amount (₹)</label>
        <input
          id="expense-amount"
          type="number"
          placeholder="e.g. 250"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        + Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
