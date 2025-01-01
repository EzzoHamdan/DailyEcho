const randomCheckbox = document.getElementById("random");
const quoteCheckboxes = document.querySelectorAll(".quote-checkbox");

// Function to handle the "Random" checkbox logic
function handleRandomCheckbox() {
  if (randomCheckbox.checked) {
    // Check all other checkboxes
    quoteCheckboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  } else {
    // Uncheck all other checkboxes
    quoteCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }
  saveCheckboxState();
}

// Function to handle individual checkbox logic
function handleIndividualCheckbox() {
  // Check if all individual checkboxes are checked
  const allChecked = Array.from(quoteCheckboxes).every((checkbox) => checkbox.checked);
  randomCheckbox.checked = allChecked;
  saveCheckboxState();
}

// Add event listeners to the "Random" checkbox and individual checkboxes
randomCheckbox.addEventListener("change", handleRandomCheckbox);
quoteCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", handleIndividualCheckbox);
});

// Save checkbox state in localStorage
function saveCheckboxState() {
  const selectedTypes = Array.from(quoteCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.id);

  localStorage.setItem("selectedQuoteTypes", JSON.stringify(selectedTypes));
}

// Initialize checkboxes based on stored preferences
function initializeCheckboxes() {
  const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
  if (selectedTypes.length > 0) {
    quoteCheckboxes.forEach((checkbox) => {
      checkbox.checked = selectedTypes.includes(checkbox.id);
    });
    // Sync the "Random" checkbox
    randomCheckbox.checked = selectedTypes.length === quoteCheckboxes.length;
  } else {
    // If no stored preferences, default to "Random"
    randomCheckbox.checked = true;
    handleRandomCheckbox();
  }
}

// Fetch quote when page loads
window.onload = function () {
  initializeCheckboxes();
  fetchQuote();
};

async function fetchQuote() {
  try {
    // Check if today's quote already exists in localStorage
    const storedQuote = localStorage.getItem("todayQuote");

    if (storedQuote) {
      // Use the stored quote if available
      const quote = JSON.parse(storedQuote);
      document.getElementById("quote-text").textContent = quote.text;
      document.getElementById("author-text").textContent = quote.author;
      return;
    }

    // If no stored quote, fetch a new one
    const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
    let url = "http://localhost:3000/quotes";

    if (selectedTypes.length > 0) {
      const typeValues = selectedTypes.map((id) => {
        switch (id) {
          case "abrahamic": return 1;
          case "historical": return 2;
          case "philosophical": return 3;
          case "literary": return 4;
          default: return null;
        }
      }).filter(Boolean);

      url += `?type=${typeValues.join(",")}`;
    }

    const response = await fetch(url);
    const quotes = await response.json();

    if (quotes.length > 0) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      // Store today's quote in localStorage to prevent it from changing
      localStorage.setItem("todayQuote", JSON.stringify(quote));
      document.getElementById("quote-text").textContent = quote.text;
      document.getElementById("author-text").textContent = quote.author;
    } else {
      document.getElementById("quote-text").textContent = "No quotes found.";
      document.getElementById("author-text").textContent = "";
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
}
