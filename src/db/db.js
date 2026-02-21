// ============================================================
// IndexedDB Module — Expense Tracker PWA
// ============================================================
// Uses the 'idb' library (a tiny Promise-based wrapper around
// the raw IndexedDB API) for cleaner async/await usage.
//
// Database: ExpenseTrackerDB
// Object Store: expenses
//   - keyPath: id (auto-incremented)
//   - Fields: title (string), amount (number), createdAt (Date)
//
// Provides full CRUD operations:
//   • addExpense(expense)   — Create
//   • getAllExpenses()       — Read all
//   • deleteExpense(id)     — Delete by id
//
// All data is stored locally in the browser's IndexedDB,
// which persists across sessions and works fully offline.
// No localStorage is used anywhere in this application.
// ============================================================

import { openDB } from 'idb';

// ----- Database Configuration -----
const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'expenses';

// ----- Initialize / Open Database -----
// openDB returns a promise that resolves to a DB instance.
// The upgrade callback runs when the DB is first created or
// when the version number increases — this is where we define
// the object store schema.
function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the 'expenses' object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',        // Primary key field
          autoIncrement: true,  // Auto-generate unique ids
        });

        // Create an index on 'createdAt' for potential future
        // queries like sorting expenses by date
        store.createIndex('createdAt', 'createdAt');
      }
    },
  });
}

// ============================================================
// CREATE — Add a new expense to the database
// ============================================================
// @param {Object} expense - { title: string, amount: number }
// @returns {Promise<number>} - The auto-generated id of the new record
export async function addExpense(expense) {
  const db = await getDB();

  // Attach a timestamp so we know when the expense was added
  const record = {
    ...expense,
    createdAt: new Date().toISOString(),
  };

  // tx = transaction; 'readwrite' because we're inserting data
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const id = await store.add(record);

  // Wait for the transaction to complete to ensure data is persisted
  await tx.done;

  console.log('[IndexedDB] Expense added with id:', id);
  return id;
}

// ============================================================
// READ — Get all expenses from the database
// ============================================================
// @returns {Promise<Array>} - Array of all expense objects
export async function getAllExpenses() {
  const db = await getDB();

  // 'readonly' transaction is sufficient for reading
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const expenses = await store.getAll();

  await tx.done;

  console.log('[IndexedDB] Retrieved', expenses.length, 'expenses');
  return expenses;
}

// ============================================================
// DELETE — Remove an expense by its id
// ============================================================
// @param {number} id - The id of the expense to delete
// @returns {Promise<void>}
export async function deleteExpense(id) {
  const db = await getDB();

  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(id);

  await tx.done;

  console.log('[IndexedDB] Expense deleted with id:', id);
}
