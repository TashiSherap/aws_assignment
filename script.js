document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api/expenses'; // Change for deployment
    const API_KEY = 'demo-key';

    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");

    let expenses = [];
    let editingId = null;

    async function fetchExpenses() {
        const res = await fetch(API_URL, { headers: { 'x-api-key': API_KEY } });
        expenses = await res.json();
        displayExpenses(expenses);
        updateTotalAmount();
    }

    function displayExpenses(expensesToShow) {
        expenseList.innerHTML = "";
        expensesToShow.forEach(expense => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    }

    function updateTotalAmount() {
        const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        totalAmount.textContent = total.toFixed(2);
    }

    expenseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const expense = {
            name: document.getElementById("expense-name").value,
            amount: document.getElementById("expense-amount").value,
            category: document.getElementById("expense-category").value,
            date: document.getElementById("expense-date").value
        };

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/${editingId}` : API_URL;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
            body: JSON.stringify(expense)
        });

        expenseForm.reset();
        editingId = null;
        expenseForm.querySelector('button').textContent = 'Add Expense';
        fetchExpenses();
    });

    expenseList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this expense?")) {
                await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: { 'x-api-key': API_KEY } });
                fetchExpenses();
            }
        }

        if (e.target.classList.contains("edit-btn")) {
            const id = e.target.dataset.id;
            const expense = expenses.find(exp => exp.id == id);
            document.getElementById("expense-name").value = expense.name;
            document.getElementById("expense-amount").value = expense.amount;
            document.getElementById("expense-category").value = expense.category;
            document.getElementById("expense-date").value = expense.date;
            editingId = id;
            expenseForm.querySelector('button').textContent = 'Update Expense';
        }
    });

    filterCategory.addEventListener("change", () => {
        const category = filterCategory.value;
        if (category === "All") {
            displayExpenses(expenses);
        } else {
            const filtered = expenses.filter(exp => exp.category === category);
            displayExpenses(filtered);
        }
        updateTotalAmount(); // Total remains full amount
    });

    fetchExpenses();
});