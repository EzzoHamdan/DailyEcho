// DOM Elements
const DOM = {
    random: document.getElementById("random"),
    quoteBoxes: document.querySelectorAll(".quote-checkbox"),
    quoteText: document.getElementById("quote-text"),
    authorText: document.getElementById("author-text")
};

// Constants
const QUOTE_TYPES = {
    abrahamic: 1,
    historical: 2,
    philosophical: 3,
    literary: 4
};

const TIMEOUT_MS = 5000;


const QUOTES_DB = [
  {
    "_id": 1,
    "quotes": [
      {
        "text": "It is not the eyes that are blind, but the hearts",
        "author": "Quran 22:46"
      },
      {
        "text": "Verily, the parable of myself and this world is that of a rider who seeks shade under a tree, then he moves on and leaves it behind",
        "author": "Prophet Muhammad"
      },
      {
        "text": "Lord! I am defeated, so be victorious",
        "author": "Quran 54:10"
      },
      {
        "text": "For what shall it profit a man, if he shall gain the whole world, and lose his own soul?",
        "author": "Mark 8:36"
      },
      {
        "text": "As for man, his days are as grass: as a flower of the field, so he flourisheth. For the wind passeth over it, and it is gone; and the place thereof shall know it no more",
        "author": "1 Timothy 6:7"
      },
      {
        "text": "For we brought nothing into this world, and it is certain we can carry nothing out",
        "author": "Psalm 103:15-17"
      },
      {
        "text": "Have no fear! I am with you",
        "author": "Quran 20:46"
      },
      {
        "text": "For what is your life? It is even a vapour, that appeareth for a little time, and then vanisheth away",
        "author": "James 4:14"
      },
      {
        "text": "While we look not at the things which are seen, but at the things which are not seen: for the things which are seen are temporal; but the things which are not seen are eternal",
        "author": "2 Corinthians 4:18"
      }
    ]
  },
  {
    "_id": 2,
    "quotes": [
      {
        "text": "The best way to predict the future is to create it",
        "author": "Abraham Lincoln"
      },
      {
        "text": "Rectify yourself, and people will rectify themselves for you",
        "author": "Abu Bakr"
      },
      {
        "text": "You must be the change you wish to see in the world",
        "author": "Mahatma Gandhi"
      },
      {
        "text": "Keep your eyes on the stars, and your feet on the ground",
        "author": "Theodore Roosevelt"
      },
      {
        "text": "If a man has not discovered something that he will die for, he isn't fit to live",
        "author": "Martin Luther King, Jr."
      },
      {
        "text": "Courage is like love, it must have hope for nourishment",
        "author": "Napoleon Bonaparte"
      },
      {
        "text": "There is nothing impossible to him who will try",
        "author": "Alexander the Great"
      }
    ]
  },
  {
    "_id": 3,
    "quotes": [
      {
        "text": "Attention is the rarest and purest form of generosity",
        "author": "Simone Weil"
      },
      {
        "text": "What you leave behind is not what is engraved in stone monuments, but what is woven into the lives of others",
        "author": "Pericles"
      },
      {
        "text": "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment",
        "author": "Bhudda"
      },
      {
        "text": "A failure is not always a mistake, it may simply be the best one can do under the circumstances. The real mistake is to stop trying",
        "author": "B. F. Skinner"
      },
      {
        "text": "Can the future still be called the future once I have reached it, or does it transform into the present, urging me to chase yet another future?",
        "author": "Ali Al-Tantawi"
      },
      {
        "text": "Life is a balance between holding on and letting go",
        "author": "Jalal Al-Din Rumi"
      },
      {
        "text": "Wherever you go, go with all your heart",
        "author": "Confucius"
      },
      {
        "text": "You were born with wings, why prefer to crawl through life? You are not meant for crawling, so don't",
        "author": "Jalal Al-Din Rumi"
      }
    ]
  },
  {
    "_id": 4,
    "quotes": [
      {
        "text": "We loved with a love that was more than love",
        "author": "Edgar Allan Poe"
      },
      {
        "text": "The best index to a person's character is how he treats people who can't do him any good, and how he treats people who can't fight back",
        "author": "Abigail Van Buren"
      },
      {
        "text": "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all, in which case you have failed",
        "author": "J K Rowling"
      },
      {
        "text": "It's best to have failure happen early in life. It wakes up the Phoenix bird in you so you rise from the ashes",
        "author": "Maya Angelou"
      },
      {
        "text": "What you see now is only a reflection of what you did in the past and what you will do in the future is only a reflection of what you are doing now",
        "author": "Ibrahim Al-Faqi"
      },
      {
        "text": "Better three hours too soon than a minute too late",
        "author": "William Shakespeare"
      }
    ]
  }
]

async function fetchQuote() {

  try {
    const storedQuote = localStorage.getItem("todayQuote");
    const today = new Date().toDateString();

    // Try to use cached quote for today
    if (storedQuote) {
      const quoteData = JSON.parse(storedQuote);
      if (quoteData.date === today) {
        displayQuote(quoteData.text, quoteData.author);
        return;
      }
    }

    // Construct URL with selected types
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Handle the quote structure
    const allQuotes = data.flatMap(category => 
      Array.isArray(category.quotes) ? category.quotes : []
    ).filter(quote => quote && quote.text && quote.author);

    if (allQuotes.length > 0) {
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      displayQuote(randomQuote.text, randomQuote.author);
    } else {
      throw new Error("No valid quotes available");
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request timed out');
    }
    console.error("Error fetching quote:", error);
    displayQuote("Could not fetch a quote. Please try again later.", "System");
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




// Checkbox Management
function handleRandomCheckbox() {
    DOM.quoteBoxes.forEach(box => box.checked = DOM.random.checked);
    saveCheckboxState();
}

function handleIndividualCheckbox() {
    DOM.random.checked = Array.from(DOM.quoteBoxes).every(box => box.checked);
    saveCheckboxState();
}

function saveCheckboxState() {
    const selectedTypes = Array.from(DOM.quoteBoxes)
        .filter(box => box.checked)
        .map(box => box.id);
    localStorage.setItem("selectedQuoteTypes", JSON.stringify(selectedTypes));
}

function initializeCheckboxes() {
    const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
    if (selectedTypes.length) {
        DOM.quoteBoxes.forEach(box => box.checked = selectedTypes.includes(box.id));
        DOM.random.checked = selectedTypes.length === DOM.quoteBoxes.length;
    } else {
        DOM.random.checked = true;
        handleRandomCheckbox();
    }
}

// Quote Display
function displayQuote(text, author) {
    DOM.quoteText.textContent = text;
    DOM.authorText.textContent = author;
    DOM.quoteText.style.fontSize = text.length > 100 ? "2.75rem" : "3rem";
}

// Quote Storage
function getCachedQuote() {
    const stored = JSON.parse(localStorage.getItem("todayQuote"));
    return stored?.date === new Date().toDateString() ? stored : null;
}

function cacheQuote(text, author) {
    localStorage.setItem("todayQuote", JSON.stringify({
        text,
        author,
        date: new Date().toDateString()
    }));
}

// Quote Fetching
async function fetchFromAPI(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API fetch failed:", error.name === "AbortError" ? "timeout" : error);
        throw error;
    }
}

function getQuoteFromFallback(selectedTypes) {
    const typeValues = selectedTypes
        .map(id => QUOTE_TYPES[id])
        .filter(Boolean);
    
    const categories = typeValues.length ? 
        QUOTES_DB.filter(cat => typeValues.includes(cat._id)) : 
        QUOTES_DB;
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    return category.quotes[Math.floor(Math.random() * category.quotes.length)];
}

async function fetchQuote() {
    try {
        const cached = getCachedQuote();
        if (cached) return displayQuote(cached.text, cached.author);

        const selectedTypes = JSON.parse(localStorage.getItem("selectedQuoteTypes")) || [];
        const typeValues = selectedTypes.map(id => QUOTE_TYPES[id]).filter(Boolean);
        
        const url = `${window.location.origin}/api/quotes${
            typeValues.length ? `?id=${typeValues.join(",")}` : ''
        }`;

        const data = await fetchFromAPI(url);
        const allQuotes = data.flatMap(category => 
            Array.isArray(category.quotes) ? category.quotes : []
        ).filter(quote => quote?.text && quote?.author);

        if (!allQuotes.length) throw new Error("No valid quotes available");
        
        const quote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        displayQuote(quote.text, quote.author);
        cacheQuote(quote.text, quote.author);
    } catch {
        console.log("Falling back to local quotes");
        const quote = getQuoteFromFallback(
            JSON.parse(localStorage.getItem("selectedQuoteTypes")) || []
        );
        displayQuote(quote.text, quote.author);
        cacheQuote(quote.text, quote.author);
    }
}

// Event Listeners
DOM.random.addEventListener("change", handleRandomCheckbox);
DOM.quoteBoxes.forEach(box => box.addEventListener("change", handleIndividualCheckbox));

// Initialization
window.onload = () => {
    initializeCheckboxes();
    fetchQuote();
};
