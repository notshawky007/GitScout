const BASE_URL = "https://api.github.com";

// Event Listeners
document.getElementById("searchButton").addEventListener("click", handleSearch);
document
  .getElementById("compareButton")
  .addEventListener("click", compareUsers);

// General Fetch Function
async function fetchGitHubUserData(username) {
  const url = `${BASE_URL}/users/${username}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch data for ${username}`);
  return response.json();
}

async function fetchRepositories(username) {
  const url = `${BASE_URL}/users/${username}/repos?per_page=100`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch repositories for ${username}`);
  return response.json();
}

// Search Logic
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const searchType = document.getElementById("searchType").value;

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  let url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}`;
  if (searchType === "orgs") {
    url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}+type:org`;
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

// Display Search Results
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

// Comparison Logic
async function compareUsers() {
  const user1 = document.getElementById("user1Input").value.trim();
  const user2 = document.getElementById("user2Input").value.trim();

  if (!user1 || !user2) {
    alert("Please enter both usernames or organization names.");
    return;
  }

  try {
    const [data1, data2, repos1, repos2] = await Promise.all([
      fetchGitHubUserData(user1),
      fetchGitHubUserData(user2),
      fetchRepositories(user1),
      fetchRepositories(user2),
    ]);

    const metrics1 = extractMetrics(data1, repos1);
    const metrics2 = extractMetrics(data2, repos2);

    displayComparison(data1, metrics1, data2, metrics2);
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching data. Please try again.");
  }
}

function extractMetrics(userData, repos) {
  const totalStars = repos.reduce(
    (acc, repo) => acc + repo.stargazers_count,
    0
  );
  const languages = [
    ...new Set(repos.map((repo) => repo.language).filter(Boolean)),
  ];
  return {
    totalRepos: userData.public_repos,
    totalStars,
    followers: userData.followers,
    languages,
  };
}

function displayComparison(user1Data, metrics1, user2Data, metrics2) {
  const comparisonResults = document.getElementById("comparisonResults");
  comparisonResults.innerHTML = "";

  // Create comparison cards
  comparisonResults.innerHTML += createComparisonCard(user1Data, metrics1);
  comparisonResults.innerHTML += createComparisonCard(user2Data, metrics2);
}

function createComparisonCard(userData, metrics) {
  return `
    <div class="comparison-card">
      <img src="${userData.avatar_url}" alt="${userData.login}">
      <h3>${userData.login}</h3>
      <p>Repositories: ${metrics.totalRepos}</p>
      <p>Total Stars: ${metrics.totalStars}</p>
      <p>Followers: ${metrics.followers}</p>
      <p>Languages: ${metrics.languages.join(", ") || "None"}</p>
    </div>
  `;
}
