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
  initializeCheckboxes();
  fetchQuote();
};

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

    // Check selected types and/or IDs only if needed
    const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
    let url = `${window.location.origin}/api/quotes`;

    const queryParams = [];

    // Handle types filtering
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
        queryParams.push(`id=${typeValues.join(",")}`);
      }
    }


    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    //console.log("Fetching quotes from URL:", url); // Debugging line

    // Set timeout for fetch request to handle potential delays
    const fetchPromise = fetch(url);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 10000) // 10 seconds timeout
    );

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const data = await response.json();
    //console.log(data); // Log the response to inspect its structure
    
    const quotes = data.flatMap(item => item.quotes);
    
    if (quotes.length > 0) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      // Store today's quote along with the date
      localStorage.setItem("todayQuote", JSON.stringify({
        text: quote.text,
        author: quote.author,
        date: today
      }));
      //console.log("text:", quote.text); // Debugging line
      //console.log("author:", quote.author); // Debugging line

      document.getElementById("quote-text").textContent = quote.text;
      document.getElementById("author-text").textContent = quote.author;
      adjustFontSize(quote.text);
    } else {
      document.getElementById("quote-text").textContent = "No quotes found.";
      document.getElementById("author-text").textContent = "";
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    // You can show a fallback message or use the cached quote here if the fetch failed
    document.getElementById("quote-text").textContent = "Could not fetch a quote. Please try again later.";
    document.getElementById("author-text").textContent = "";
  }
}

function adjustFontSize(quoteText) {
  /*if (!quoteText) {
    console.error("Quote text is undefined or empty." + quoteText);
    return;
  }*/
  
  const quoteElement = document.getElementById("quote-text");
  if (quoteText.length > 100) {
    quoteElement.style.fontSize = "2.75rem";
  } else {
    quoteElement.style.fontSize = "3rem";
  }
}


