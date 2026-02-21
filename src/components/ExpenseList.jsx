// ============================================================
// ExpenseList Component — Expense Tracker PWA
// ============================================================
// Displays all expenses in a list.
// Each item shows the title, amount, creation date, and a
// delete button that calls the onDelete callback.
// Also displays the total amount of all expenses.
// ============================================================

function ExpenseList({ expenses, onDelete }) {
  // Calculate the total across all expenses
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expense-list">
      <h2>Your Expenses</h2>

      {/* Total summary card */}
      <div className="total-card">
        <span className="total-label">Total Spent</span>
        <span className="total-amount">₹{total.toFixed(2)}</span>
      </div>

      {/* Show a friendly message when there are no expenses */}
      {expenses.length === 0 ? (
        <p className="empty-message">
          No expenses yet. Add one above to get started!
        </p>
      ) : (
        <ul className="expenses">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-item">
              <div className="expense-info">
                <span className="expense-title">{expense.title}</span>
                <span className="expense-date">
                  {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="expense-actions">
                <span className="expense-amount">
                  ₹{expense.amount.toFixed(2)}
                </span>
                <button
                  className="btn btn-delete"
                  onClick={() => onDelete(expense.id)}
                  title="Delete this expense"
                  aria-label={`Delete expense: ${expense.title}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExpenseList;
