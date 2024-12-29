const BASE_URL = "https://api.github.com";

// Utility Function for Fetching GitHub Data
async function fetchGitHubData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
  return response.json();
}

// Search GitHub Users/Organizations
async function handleSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const searchType = document.getElementById("searchType").value;

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  try {
    const url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}${
      searchType === "orgs" ? "+type:org" : ""
    }`;
    const data = await fetchGitHubData(url);
    displayResults(data.items);
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching data.");
  }
}

// Display Search Results
function displayResults(items) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = items.length
    ? items
        .map(
          (item) => `
      <div class="card">
        <img src="${item.avatar_url}" alt="${item.login}">
        <h3>${item.login}</h3>
        <a href="${item.html_url}" target="_blank">View Profile</a>
      </div>
    `
        )
        .join("")
    : "<p>No results found.</p>";
}

// Compare GitHub Users/Organizations
async function compareUsers() {
  const user1 = document.getElementById("user1Input").value.trim();
  const user2 = document.getElementById("user2Input").value.trim();

  if (!user1 || !user2) {
    alert("Please enter both usernames or organization names.");
    return;
  }

  try {
    const [data1, data2, repos1, repos2] = await Promise.all([
      fetchGitHubData(`${BASE_URL}/users/${user1}`),
      fetchGitHubData(`${BASE_URL}/users/${user2}`),
      fetchGitHubData(`${BASE_URL}/users/${user1}/repos?per_page=100`),
      fetchGitHubData(`${BASE_URL}/users/${user2}/repos?per_page=100`),
    ]);

    const metrics1 = extractMetrics(data1, repos1);
    const metrics2 = extractMetrics(data2, repos2);

    displayComparison(data1, metrics1, data2, metrics2);
  } catch (error) {
    console.error(error);
    alert("An error occurred while comparing data.");
  }
}

// Extract Metrics
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
    languages: languages.join(", "),
  };
}

// Display Comparison
function displayComparison(user1Data, metrics1, user2Data, metrics2) {
  const comparisonResults = document.getElementById("comparisonResults");
  comparisonResults.innerHTML = `
    ${createComparisonCard(user1Data, metrics1)}
    ${createComparisonCard(user2Data, metrics2)}
  `;
}

function createComparisonCard(userData, metrics) {
  return `
    <div class="comparison-card">
      <img src="${userData.avatar_url}" alt="${userData.login}">
      <h3>${userData.login}</h3>
      <p>Repositories: ${metrics.totalRepos}</p>
      <p>Total Stars: ${metrics.totalStars}</p>
      <p>Followers: ${metrics.followers}</p>
      <p>Languages: ${metrics.languages || "None"}</p>
    </div>
  `;
}

// Event Listeners
document.getElementById("searchButton").addEventListener("click", handleSearch);
document
  .getElementById("compareButton")
  .addEventListener("click", compareUsers);
