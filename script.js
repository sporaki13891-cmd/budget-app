const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");
let transactions = [];
let myChart;


//-----------------------------------------------
function getFilteredTransactions()
{
  const selectedMonth  = document.getElementById("month-filter").value;
  
  if (selectedMonth === "")
  {
    return transactions;
  }

  return transactions.filter(function (transaction)
  {
    return transaction.date && transaction.date.slice(0, 7) === selectedMonth;
  });
}

//--------------------------------------------------
function updatePeriodLabel()
{
  const selectedMonth = document.getElementById("month-filter").value;
  const label = document.getElementById("period-label");

  if (selectedMonth === "")
  {
    label.textContent = "Ετήσιος προϋπολογισμός";
  }
  else
  {
    const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];

    const parts = selectedMonth.split("-");
    const year = parts[0];
    const monthNumber = Number(parts[1]);

    label.textContent = monthNames[monthNumber - 1] + " " + year;
  }
}

//------------------------------------------------
function renderTransactions()
{
  list.innerHTML = "";

  const visibleTransactions = getFilteredTransactions();
  
  visibleTransactions.forEach(function (transaction)
  {
    const li = document.createElement("li");
    const sign = transaction.type === "income" ? "+" : "-";
    const categoryText = transaction.category ? transaction.category + ", " : "";
    li.textContent = sign + transaction.amount + "€ — " + transaction.description + " (" + categoryText + transaction.date + ")";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "✕";

    deleteButton.addEventListener("click", function()
    {
      transactions = transactions.filter(function(item)
      {
        return item.id !== transaction.id;
      });
      renderTransactions();
      updateSummary();
      renderChart();
      saveTransactions();
    });

    li.appendChild(deleteButton);

    list.appendChild(li);
  });
}

//------------------------------------------------
function updateSummary()
{
  let income = 0;
  let expense = 0;
  let savings = 0;

  getFilteredTransactions().forEach(function(transaction)
  {
    if (transaction.type === "income")
    {
      income = income + transaction.amount;
    }
    else if (transaction.type === "expense")
    {
      expense = expense + transaction.amount;
    }
    else if (transaction.type === "savings")
    {
      savings = savings + transaction.amount;
    }
  });

  const balance = income - expense - savings;

  document.getElementById("total-income").textContent = income;
  document.getElementById("total-expense").textContent = expense;
  document.getElementById("balance").textContent = balance;
  document.getElementById("total-savings").textContent = savings;
}

//------------------------------------------------
function saveTransactions()
{
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

//-----------------------------------------------
function getExpensesByCategory()
{
  const totals = {};

  getFilteredTransactions().forEach(function(transaction)
  {
    if (transaction.type === "expense")
    {
      if (totals[transaction.category])
      {
        totals[transaction.category] = totals[transaction.category] + transaction.amount;
      }
      else
      {
        totals[transaction.category] = transaction.amount;
      }
    }
  });

  return totals;
}

//------------------------------------------------------
function renderChart()
{
  const data = getExpensesByCategory();
  const labels = Object.keys(data);
  const amounts = Object.values(data);

  if (myChart)
  {
    myChart.destroy();
  }

  const canvas = document.getElementById("chart");
  myChart = new Chart(canvas,
  {
    type: "doughnut",
    data:
    {
      labels: labels,
      datasets:
      [{
        data: amounts
      }]
    }
  });
}

//------------------------------------------------
document.getElementById("month-filter").addEventListener("change", function()
{
  renderTransactions();
  updateSummary();
  renderChart();
  updatePeriodLabel();
});

//------------------------------------------------
document.getElementById("clear-filter").addEventListener("click", function()
{
  document.getElementById("month-filter").value = "";
  renderTransactions();
  updateSummary();
  renderChart();
  updatePeriodLabel();
});

//------------------------------------------------
function updateCategoryState()
{
  const categorySelect = document.getElementById("category");
  const typeValue = document.getElementById("type").value;

  if (typeValue === "expense")
  {
    categorySelect.disabled = false;
  }
  else
  {
    categorySelect.disabled = true;
  }
}

document.getElementById("type").addEventListener("change", updateCategoryState);

updateCategoryState();

//------------------------------------------------
form.addEventListener("submit", function(event)
{
  event.preventDefault();
  
  const description = document.getElementById("description").value;
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = type === "expense" ? document.getElementById("category").value : "";
  let date = document.getElementById("date").value;

  if(description === "" || amount <= 0)
  {
    return;
  }

  if (date === "")
  {
    date = new Date().toISOString().slice(0, 10);
  }

  const transaction =
  {
    id: Date.now(),
    description: description,
    amount: amount,
    type: type,
    category: category,
    date: date
  }

  transactions.push(transaction);
  renderTransactions();
  updateSummary();
  renderChart();
  saveTransactions();

  form.reset();
  updateCategoryState();
})

//------------------------------------------
const savedData = localStorage.getItem("transactions");

if (savedData && Array.isArray(JSON.parse(savedData)))
{
  transactions = JSON.parse(savedData);
  renderTransactions();
  updateSummary();
  renderChart();
}

updatePeriodLabel();