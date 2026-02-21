// ============================================================
// App Component — Expense Tracker PWA
// ============================================================
// Root component that orchestrates the entire application:
//   1. Loads expenses from IndexedDB on mount
//   2. Handles add & delete operations through db.js
//   3. Renders ExpenseForm and ExpenseList
//   4. Shows online/offline status indicator
// ============================================================

import { useState, useEffect } from 'react';
import { addExpense, getAllExpenses, deleteExpense } from './db/db';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import './App.css';

function App() {
  // ----- State -----
  const [expenses, setExpenses] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  // ----- Load expenses from IndexedDB on component mount -----
  useEffect(() => {
    async function loadExpenses() {
      try {
        const data = await getAllExpenses();
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExpenses();
  }, []);

  // ----- Track online / offline status -----
  // This lets us show a visual indicator so the user knows
  // they are working offline (data still persists via IndexedDB).
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ----- Handlers -----

  // Add a new expense to IndexedDB and refresh the list
  const handleAddExpense = async (expense) => {
    try {
      await addExpense(expense);
      const updatedExpenses = await getAllExpenses();
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error('Failed to add expense:', err);
      alert('Failed to add expense. Please try again.');
    }
  };

  // Delete an expense from IndexedDB and refresh the list
  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      const updatedExpenses = await getAllExpenses();
      setExpenses(updatedExpenses);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  return (
    <div className="app">
      {/* ----- Header ----- */}
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </span>
      </header>

      {/* ----- Main Content ----- */}
      <main className="app-main">
        {/* Expense Form — Create new expenses */}
        <ExpenseForm onAdd={handleAddExpense} />

        {/* Expense List — Read and Delete expenses */}
        {loading ? (
          <p className="loading-message">Loading expenses...</p>
        ) : (
          <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
        )}
      </main>

      {/* ----- Footer ----- */}
      <footer className="app-footer">
        <p>Expense Tracker PWA — Works Offline • Data stored in IndexedDB</p>
      </footer>
    </div>
  );
}

export default App;
