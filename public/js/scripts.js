const randomCheckbox = document.getElementById("random");
const quoteCheckboxes = document.querySelectorAll(".quote-checkbox");
const quoteTextElement = document.getElementById("quote-text");
const authorTextElement = document.getElementById("author-text");

// Function to handle the "Random" checkbox logic
function handleRandomCheckbox() {
  const isChecked = randomCheckbox.checked;
  quoteCheckboxes.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
  saveCheckboxState();
}

// Function to handle individual checkbox logic
function handleIndividualCheckbox() {
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
    randomCheckbox.checked = selectedTypes.length === quoteCheckboxes.length;
  } else {
    randomCheckbox.checked = true;
    handleRandomCheckbox();
  }
}

// Fetch configuration and quote when page loads
window.onload = async function () {
  initializeCheckboxes();
  fetchQuote();
};

async function fetchQuote() {
  try {
    const storedQuote = localStorage.getItem("todayQuote");
    const today = new Date().toDateString();

    if (storedQuote) {
      const quoteData = JSON.parse(storedQuote);
      if (quoteData.date === today) {
        displayQuote(quoteData.text, quoteData.author);
        return;
      }
    }

    const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
    let url = `${window.location.origin}/api/quotes`;

    if (selectedTypes.length > 0) {
      const typeValues = selectedTypes
        .map((id) => {
          switch (id) {
            case "abrahamic": return 1;
            case "historical": return 2;
            case "philosophical": return 3;
            case "literary": return 4;
            default: return null;
          }
        })
        .filter(Boolean);

      if (typeValues.length > 0) {
        url += `?id=${typeValues.join(",")}`;
      }
    }

    const response = await Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 20000))
    ]);

    const data = await response.json();
    const quotes = data.flatMap(item => item.quotes);

    if (quotes.length > 0) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      localStorage.setItem("todayQuote", JSON.stringify({ text: quote.text, author: quote.author, date: today }));
      displayQuote(quote.text, quote.author);
    } else {
      displayQuote("No quotes found.", "");
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    displayQuote("Could not fetch a quote. Please try again later.", "");
  }
}

function displayQuote(text, author) {
  quoteTextElement.textContent = text;
  authorTextElement.textContent = author;
  adjustFontSize(text);
}

function adjustFontSize(quoteText) {
  quoteTextElement.style.fontSize = quoteText.length > 100 ? "2.75rem" : "3rem";
}


