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

// Fetch configuration and quote when page loads
window.onload = async function () {
  console.log("Window loaded, initializing checkboxes and fetching config."); // Debugging line
  initializeCheckboxes();
  await fetchConfig();
  console.log("Config fetched, BASE_URL is:", BASE_URL); // Debugging line
  fetchQuote();
};

let BASE_URL;

async function fetchConfig() {
  try {
    const response = await fetch('/api/config');
    const configText = await response.text();
    console.log("Config response text:", configText); // Debugging line
    if (response.ok) {
      const config = JSON.parse(configText);
      BASE_URL = window.location.origin.includes('localhost')
        ? `http://localhost:${config.basePort}`
        : "https://dailyecho.vercel.app"; // Use the Vercel URL for production
      console.log("BASE_URL set to:", BASE_URL); // Debugging line
    } else {
      console.error("Failed to fetch config:", configText);
      // Fallback to production URL if config fetch fails
      BASE_URL = "https://dailyecho.vercel.app";
    }
  } catch (error) {
    console.error("Error fetching config:", error);
    // Fallback to production URL if config fetch fails
    BASE_URL = "https://dailyecho.vercel.app";
  }
}

async function fetchQuote() {
  try {
    // Check if the stored quote is from today
    const storedQuote = localStorage.getItem("todayQuote");
    const today = new Date().toDateString();

    if (storedQuote) {
      const quoteData = JSON.parse(storedQuote);
      if (quoteData.date === today) {
        // Use the stored quote if it's from today
        document.getElementById("quote-text").textContent = quoteData.text;
        document.getElementById("author-text").textContent = quoteData.author;
        adjustFontSize(quoteData.text); // Adjust font size based on quote length
        return;
      }
    }
    
    const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
    let url = `${BASE_URL}/quotes`;

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

    console.log("Fetching quotes from URL:", url); // Debugging line
    const response = await fetch(url);
    const quotes = await response.json();

    if (quotes.length > 0) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      const today = new Date().toDateString();

      // Store today's quote along with the date
      localStorage.setItem("todayQuote", JSON.stringify({
        text: quote.text,
        author: quote.author,
        date: today
      }));

      document.getElementById("quote-text").textContent = quote.text;
      document.getElementById("author-text").textContent = quote.author;
      adjustFontSize(quote.text);
    } else {
      document.getElementById("quote-text").textContent = "No quotes found.";
      document.getElementById("author-text").textContent = "";
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
}

function adjustFontSize(quoteText) {
  const quoteElement = document.getElementById("quote-text");
  if (quoteText.length > 100) {
    quoteElement.style.fontSize = "2.75rem";
  } else {
    quoteElement.style.fontSize = "3rem";
  }
}


