const BASE_URL = "https://api.github.com";

document.getElementById("searchButton").addEventListener("click", handleSearch);

async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const searchType = document.getElementById("searchType").value; // Get the selected type

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  let url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}`; // Default to searching users

  if (searchType === "orgs") {
    url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}+type:org`; // Search for organizations
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch data from GitHub API.");
    const data = await response.json();
    displayResults(data.items);
  } catch (error) {
    console.error(error);
    alert("An error occurred. Please try again later.");
  }
}

function displayResults(items) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (items.length === 0) {
    resultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.avatar_url}" alt="${item.login}">
      <h3>${item.login}</h3>
      <a href="${item.html_url}" target="_blank">View Profile</a>
    `;
    resultsContainer.appendChild(card);
  });
}
