document.addEventListener("DOMContentLoaded", () => {
    // 1. DYNAMIC API URL LOGIC
    // Replace 'https://your-backend-service.onrender.com' with your actual Render URL
    const LIVE_BACKEND_URL = 'https://your-backend-service.onrender.com'; 
    
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api/expenses'
        : `${LIVE_BACKEND_URL}/api/expenses`;

    const API_KEY = 'demo-key';

    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");

    let expenses = [];
    let editingId = null;

    // 2. FETCH ALL EXPENSES
    async function fetchExpenses() {
        try {
            const res = await fetch(API_URL, { headers: { 'x-api-key': API_KEY } });
            if (!res.ok) throw new Error('Network response was not ok');
            expenses = await res.json();
            displayExpenses(expenses);
            updateTotalAmount();
        } catch (error) {
            console.error('Fetch error:', error);
        }
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

    // 3. ADD OR UPDATE EXPENSE
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

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
                body: JSON.stringify(expense)
            });

            expenseForm.reset();
            editingId = null;
            expenseForm.querySelector('button').textContent = 'Add Expense';
            fetchExpenses();
        } catch (error) {
            console.error('Submit error:', error);
        }
    });

    // 4. DELETE OR EDIT HANDLERS
    expenseList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id;
            if (confirm("Delete this expense?")) {
                try {
                    await fetch(`${API_URL}/${id}`, { 
                        method: 'DELETE', 
                        headers: { 'x-api-key': API_KEY } 
                    });
                    fetchExpenses();
                } catch (error) {
                    console.error('Delete error:', error);
                }
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

    // 5. FILTERING
    filterCategory.addEventListener("change", () => {
        const category = filterCategory.value;
        if (category === "All") {
            displayExpenses(expenses);
        } else {
            const filtered = expenses.filter(exp => exp.category === category);
            displayExpenses(filtered);
        }
        updateTotalAmount();
    });

    fetchExpenses();
});