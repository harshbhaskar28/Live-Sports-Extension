// ESPN API endpoints
const API_ENDPOINTS = {
  nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  soccer: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard'
};

let currentDate = new Date();
let autoRefreshInterval;

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
  updateDateDisplay();
  loadScores();
  
  // Add refresh button listener
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadScores();
  });
  
  // Date navigation
  document.getElementById('prev-day').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadScores();
  });
  
  document.getElementById('next-day').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadScores();
  });
  
  // Modal close
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('box-score-modal').addEventListener('click', (e) => {
    if (e.target.id === 'box-score-modal') closeModal();
  });
  
  // Event delegation for game card clicks
  document.getElementById('scores-container').addEventListener('click', (e) => {
    const gameCard = e.target.closest('.game-card');
    if (gameCard) {
      const eventId = gameCard.dataset.eventId;
      const league = gameCard.dataset.league;
      if (eventId && league) {
        showBoxScore(eventId, league);
      }
    }
  });
  
  // Auto-refresh every 60 seconds (only for today's date)
  startAutoRefresh();
});

function startAutoRefresh() {
  clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    if (isToday(currentDate)) {
      loadScores();
    }
  }, 60000);
}

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function updateDateDisplay() {
  const dateStr = currentDate.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  document.getElementById('current-date').textContent = dateStr;
  
  // Disable next button if trying to go beyond today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);
  
  // Allow going up to 7 days in the future
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 7);
  
  document.getElementById('next-day').disabled = current >= maxDate;
}

async function loadScores() {
  showLoading(true);
  hideError();
  
  try {
    const [nbaData, nflData, nhlData, mlbData, soccerData] = await Promise.all([
      fetchScores('nba'),
      fetchScores('nfl'),
      fetchScores('nhl'),
      fetchScores('mlb'),
      fetchScores('soccer')
    ]);
    
    displayScores('nba', nbaData);
    displayScores('nfl', nflData);
    displayScores('nhl', nhlData);
    displayScores('mlb', mlbData);
    displayScores('soccer', soccerData);
    
    updateLastUpdatedTime();
    showLoading(false);
    
    // Check if there are any games at all
    const totalGames = (nbaData?.events?.length || 0) + 
                      (nflData?.events?.length || 0) + 
                      (nhlData?.events?.length || 0) +
                      (mlbData?.events?.length || 0) +
                      (soccerData?.events?.length || 0);
    
    if (totalGames === 0) {
      document.getElementById('no-games').style.display = 'block';
    } else {
      document.getElementById('no-games').style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error loading scores:', error);
    showError('Failed to load scores. Please try again.');
    showLoading(false);
  }
}

async function fetchScores(league) {
  try {
    // Format date for API (YYYYMMDD)
    const dateStr = formatDateForAPI(currentDate);
    const url = `${API_ENDPOINTS[league]}?dates=${dateStr}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${league} scores:`, error);
    return null;
  }
}

function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function displayScores(league, data) {
  const section = document.getElementById(`${league}-section`);
  const container = document.getElementById(`${league}-games`);
  
  if (!data || !data.events || data.events.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  // Sort games: live first, then scheduled, then completed
  const sortedGames = sortGames(data.events);
  
  container.innerHTML = sortedGames.map(event => createGameCard(event, league)).join('');
}

function sortGames(events) {
  return events.sort((a, b) => {
    const statusA = a.status.type.state;
    const statusB = b.status.type.state;
    
    // Priority: in > pre > post
    const priority = { 'in': 0, 'pre': 1, 'post': 2 };
    
    const priorityA = priority[statusA] ?? 3;
    const priorityB = priority[statusB] ?? 3;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Within same status, sort by time
    return new Date(a.date) - new Date(b.date);
  });
}

function createGameCard(event, league) {
  const competition = event.competitions[0];
  const status = event.status;
  const competitors = competition.competitors;
  
  // Get teams (home and away)
  const homeTeam = competitors.find(t => t.homeAway === 'home');
  const awayTeam = competitors.find(t => t.homeAway === 'away');
  
  // Determine game state
  const isLive = status.type.state === 'in';
  const isFinal = status.type.state === 'post';
  const isScheduled = status.type.state === 'pre';
  
  // Status text and badge
  let statusText = status.type.shortDetail;
  let statusClass = 'scheduled';
  
  if (isLive) {
    statusClass = 'live';
    
    // Debug: Log comprehensive status info
    console.log(`=== Live game status for ${league} ===`);
    console.log('Full event object:', event);
    console.log('Status object:', status);
    console.log('status.type:', status.type);
    console.log('status.type.detail:', status.type.detail);
    console.log('status.type.shortDetail:', status.type.shortDetail);
    console.log('status.period:', status.period);
    console.log('status.displayClock:', status.displayClock);
    console.log('=====================================');
    
    // ESPN provides formatted detail like "2nd - 5:23" or "End of 2nd Quarter"
    // Try multiple sources for the best display
    if (status.type.detail && status.type.detail !== 'In Progress') {
      // ESPN's detail often has the best formatted string
      statusText = status.type.detail;
    } else {
      // Build it ourselves from period and clock
      const period = status.period;
      const clock = status.displayClock;
      
      if (period && clock) {
        // Format: "Q2 - 5:23" or "2nd - 5:23"
        const periodLabel = getPeriodShortLabel(league, period);
        statusText = `${periodLabel} - ${clock}`;
      } else if (period) {
        // Just show period if no clock
        const periodLabel = getPeriodShortLabel(league, period);
        statusText = periodLabel;
      } else {
        // Fallback to generic LIVE
        statusText = 'LIVE';
      }
    }
  } else if (isFinal) {
    statusClass = 'final';
    statusText = 'FINAL';
    if (status.type.detail && status.type.detail !== 'Final') {
      statusText = status.type.detail; // e.g., "Final/OT"
    }
  }
  
  // Game details
  let gameDetails = '';
  if (competition.venue) {
    gameDetails = competition.venue.fullName || '';
  }
  if (competition.broadcasts && competition.broadcasts.length > 0) {
    const broadcast = competition.broadcasts[0].names?.join(', ') || '';
    if (broadcast) {
      gameDetails += gameDetails ? ` • ${broadcast}` : broadcast;
    }
  }
  
  // Team scores (only show if game has started)
  const showScores = !isScheduled;
  
  // Create card HTML
  const cardHtml = `
    <div class="game-card ${isLive ? 'live' : ''} ${isFinal ? 'completed' : ''}" 
         data-event-id="${event.id}" 
         data-league="${league}">
      <div class="game-status">
        <span class="status-badge ${statusClass}">${statusClass === 'live' ? `🔴 ${statusText}` : statusText}</span>
        ${isScheduled ? `<span class="game-time">${formatTime(event.date)}</span>` : ''}
      </div>
      
      <div class="teams-container">
        <div class="team ${awayTeam.winner ? 'winner' : ''}">
          <div class="team-info">
            ${getTeamIdentifier(awayTeam)}
            <span class="team-name">${awayTeam.team.shortDisplayName || awayTeam.team.displayName}</span>
          </div>
          ${showScores ? `<span class="team-score">${awayTeam.score || '0'}</span>` : ''}
        </div>
        <div class="team ${homeTeam.winner ? 'winner' : ''}">
          <div class="team-info">
            ${getTeamIdentifier(homeTeam)}
            <span class="team-name">${homeTeam.team.shortDisplayName || homeTeam.team.displayName}</span>
          </div>
          ${showScores ? `<span class="team-score">${homeTeam.score || '0'}</span>` : ''}
        </div>
      </div>
      
      ${gameDetails ? `
        <div class="game-details">
          <span>${gameDetails}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  return cardHtml;
}

function getTeamIdentifier(team) {
  // Try to use team logo if available
  if (team.team.logo) {
    return `<img src="${team.team.logo}" alt="${team.team.abbreviation}" class="team-logo">`;
  }
  
  // Fallback to color circle with abbreviation
  const color = team.team.color || getTeamColor(team.team.abbreviation);
  return `<div class="team-color" style="background-color: #${color}">${team.team.abbreviation || team.team.shortDisplayName?.substring(0, 2) || 'TM'}</div>`;
}

function getTeamColor(abbreviation) {
  // Fallback colors for teams (basic set)
  const colors = {
    // NBA
    'LAL': '552583', 'BOS': '007A33', 'GSW': '1D428A', 'CHI': 'CE1141',
    'MIA': '98002E', 'NYK': '006BB6', 'BKN': '000000', 'PHI': '006BB6',
    // NFL
    'KC': 'E31837', 'SF': 'AA0000', 'DAL': '041E42', 'NE': '002244',
    'GB': 'FFB612', 'PIT': 'FFB612', 'SEA': '002244', 'TB': 'D50A0A',
    // NHL
    'TOR': '00205B', 'MTL': 'AF1E2D', 'EDM': 'FF4C00', 'VAN': '00205B',
    // Default
    'default': '667eea'
  };
  return colors[abbreviation] || colors['default'];
}

function getPeriodLabel(league, period) {
  if (league === 'nba' || league === 'nfl') {
    const quarters = ['1st', '2nd', '3rd', '4th'];
    return quarters[period - 1] || `Q${period}`;
  } else if (league === 'nhl' || league === 'soccer') {
    const periods = ['1st', '2nd', '3rd'];
    return periods[period - 1] || `Period ${period}`;
  } else if (league === 'mlb') {
    return `${period}${getOrdinalSuffix(period)}`;
  }
  return `Period ${period}`;
}

function getPeriodShortLabel(league, period) {
  // Shorter labels for live badges
  if (league === 'nba' || league === 'nfl') {
    return `Q${period}`;
  } else if (league === 'nhl') {
    return `P${period}`;
  } else if (league === 'soccer') {
    return period === 1 ? '1H' : '2H'; // First Half, Second Half
  } else if (league === 'mlb') {
    return `T${period}`; // Top/Bottom of inning - simplified
  }
  return `P${period}`;
}

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function updateLastUpdatedTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
  document.getElementById('last-updated').textContent = `Last updated: ${timeString}`;
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  if (!show) {
    document.getElementById('scores-container').style.display = 'block';
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  document.getElementById('error').style.display = 'none';
}

// Box Score Modal Functions
async function showBoxScore(eventId, league) {
  const modal = document.getElementById('box-score-modal');
  const modalBody = document.getElementById('modal-body');
  
  modal.classList.add('show');
  modalBody.innerHTML = '<div class="loading">Loading box score...</div>';
  
  try {
    // Fetch detailed game data
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/${getLeaguePath(league)}/summary?event=${eventId}`;
    const response = await fetch(summaryUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch box score');
    }
    
    const data = await response.json();
    displayBoxScore(data, league);
    
  } catch (error) {
    console.error('Error loading box score:', error);
    modalBody.innerHTML = '<div class="error">Failed to load box score. Please try again.</div>';
  }
}

function getLeaguePath(league) {
  const paths = {
    'nba': 'basketball/nba',
    'nfl': 'football/nfl',
    'nhl': 'hockey/nhl',
    'mlb': 'baseball/mlb',
    'soccer': 'soccer/eng.1'
  };
  return paths[league] || league;
}

function displayBoxScore(data, league) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  
  const header = data.header;
  const boxscore = data.boxscore;
  
  if (!boxscore || !boxscore.teams) {
    modalBody.innerHTML = '<div class="error">Box score not available for this game.</div>';
    return;
  }
  
  // Get team names from boxscore
  const team1 = boxscore.teams[0];
  const team2 = boxscore.teams[1];
  
  // Determine away and home teams
  let awayTeam, homeTeam;
  if (team1.homeAway === 'away') {
    awayTeam = team1;
    homeTeam = team2;
  } else {
    awayTeam = team2;
    homeTeam = team1;
  }
  
  // Get scores from header.competitions if available
  let awayScore = '-';
  let homeScore = '-';
  
  if (header?.competitions?.[0]?.competitors) {
    const competitors = header.competitions[0].competitors;
    const awayCompetitor = competitors.find(c => c.homeAway === 'away');
    const homeCompetitor = competitors.find(c => c.homeAway === 'home');
    
    if (awayCompetitor?.score) {
      awayScore = awayCompetitor.score;
    }
    if (homeCompetitor?.score) {
      homeScore = homeCompetitor.score;
    }
  }
  
  // Set title with team names
  modalTitle.textContent = `${awayTeam.team.displayName} @ ${homeTeam.team.displayName}`;
  
  // Build box score HTML
  let html = '';
  
  // Score summary at top
  html += '<div class="score-summary">';
  html += `<div class="team-score-row">`;
  html += `<span class="team-name-large">${awayTeam.team.abbreviation}</span>`;
  html += `<span class="score-large">${awayScore}</span>`;
  html += `</div>`;
  html += `<div class="team-score-row">`;
  html += `<span class="team-name-large">${homeTeam.team.abbreviation}</span>`;
  html += `<span class="score-large">${homeScore}</span>`;
  html += `</div>`;
  html += '</div>';
  
  // Team stats comparison
  if (boxscore.teams && boxscore.teams.length >= 2) {
    html += '<div class="stat-category"><h3>Team Stats</h3>';
    html += '<table class="team-stats-table">';
    html += '<thead><tr>';
    html += `<th>${awayTeam.team.abbreviation}</th>`;
    html += '<th>STAT</th>';
    html += `<th>${homeTeam.team.abbreviation}</th>`;
    html += '</tr></thead><tbody>';
    
    const keyStats = getKeyStatsForLeague(league);
    keyStats.forEach(statName => {
      const stat1 = awayTeam.statistics?.find(s => s.name === statName);
      const stat2 = homeTeam.statistics?.find(s => s.name === statName);
      
      if (stat1 && stat2) {
        html += '<tr>';
        html += `<td class="stat-value">${stat1.displayValue || stat1.value}</td>`;
        html += `<td class="stat-label">${stat1.displayName || statName}</td>`;
        html += `<td class="stat-value">${stat2.displayValue || stat2.value}</td>`;
        html += '</tr>';
      }
    });
    
    html += '</tbody></table></div>';
  }
  
  // Player stats
  if (boxscore.players && boxscore.players.length > 0) {
    boxscore.players.forEach((team, index) => {
      if (team.statistics && team.statistics.length > 0) {
        html += `<div class="stat-category"><h3>${team.team.displayName} - Player Stats</h3>`;
        html += renderPlayerStats(team.statistics[0], league);
        html += '</div>';
      }
    });
  }
  
  // Add link to expanded view
  html += `<div class="expanded-view-link">`;
  html += `<button class="expanded-btn" data-event-id="${data.header?.id || ''}" data-league="${league}">View Full Stats & Play-by-Play →</button>`;
  html += `</div>`;
  
  modalBody.innerHTML = html || '<div class="error">No detailed stats available.</div>';
  
  // Add click listener to expanded view button
  const expandedBtn = modalBody.querySelector('.expanded-btn');
  if (expandedBtn) {
    expandedBtn.addEventListener('click', () => {
      const eventId = expandedBtn.dataset.eventId;
      const leagueType = expandedBtn.dataset.league;
      if (eventId && leagueType) {
        openExpandedView(eventId, leagueType);
      }
    });
  }
}

function getKeyStatsForLeague(league) {
  const statsByLeague = {
    'nba': ['fieldGoalsMade', 'threePointFieldGoalsMade', 'freeThrowsMade', 'rebounds', 'assists', 'turnovers', 'steals', 'blocks'],
    'nfl': ['totalYards', 'passingYards', 'rushingYards', 'turnovers', 'possession', 'thirdDownEff', 'fourthDownEff'],
    'nhl': ['shots', 'powerPlayGoals', 'faceWinPercent', 'hits', 'blockedShots', 'takeaways', 'giveaways'],
    'mlb': ['hits', 'runs', 'errors', 'leftOnBase', 'homeRuns', 'strikeouts'],
    'soccer': ['possessionPct', 'shots', 'shotsOnTarget', 'corners', 'fouls', 'offsides', 'yellowCards']
  };
  
  return statsByLeague[league] || ['totalPoints', 'totalYards', 'turnovers'];
}

function renderPlayerStats(statGroup, league) {
  if (!statGroup.athletes || statGroup.athletes.length === 0) {
    return '<p>No player stats available.</p>';
  }
  
  const labels = statGroup.labels || [];
  const athletes = statGroup.athletes.slice(0, 10); // Top 10 players
  
  // Determine how many stat columns to show based on league
  let maxStats = 8; // Show more stats by default
  if (league === 'nba') {
    maxStats = 10; // NBA: show more (PTS, REB, AST, FG, 3PT, FT, etc.)
  } else if (league === 'nhl') {
    maxStats = 8; // NHL: G, A, PTS, +/-, PIM, SOG, etc.
  }
  
  let html = '<table class="stats-table"><thead><tr>';
  html += '<th>Player</th>';
  
  // Add column headers
  labels.slice(0, maxStats).forEach(label => {
    html += `<th>${label}</th>`;
  });
  
  html += '</tr></thead><tbody>';
  
  athletes.forEach(athlete => {
    html += `<tr><td>${athlete.athlete.shortName || athlete.athlete.displayName}</td>`;
    
    const stats = athlete.stats || [];
    stats.slice(0, maxStats).forEach(stat => {
      html += `<td>${stat}</td>`;
    });
    
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

function closeModal() {
  document.getElementById('box-score-modal').classList.remove('show');
}

// Expanded view function
function openExpandedView(eventId, league) {
  // Create ESPN game URL
  const leaguePaths = {
    'nba': 'nba',
    'nfl': 'nfl',
    'nhl': 'nhl',
    'mlb': 'mlb',
    'soccer': 'soccer/_/league/eng.1'
  };
  
  const leaguePath = leaguePaths[league] || league;
  const espnUrl = `https://www.espn.com/${leaguePath}/game/_/gameId/${eventId}`;
  
  // Open in new tab
  chrome.tabs.create({ url: espnUrl });
}

// Make functions globally accessible
window.openExpandedView = openExpandedView;
