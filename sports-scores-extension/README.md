# Live Sports Scores - Chrome Extension

A Chrome browser extension that displays live scores for NBA, NFL, NHL, MLB, and Premier League games with detailed box scores. Games are organized by league and sorted with live games at the top, completed games at the bottom.

## Features

- **Real-time scores** for NBA, NFL, NHL, MLB, and Premier League
- **Click any game** to view detailed box scores with player statistics
- **Team logos** displayed next to team names (with color-coded fallbacks)
- **Live game details**: Shows current quarter/period and time remaining
- **Date navigation**: Browse games from previous days or future schedules
- **Auto-refresh** every 60 seconds (for today's games)
- **Smart organization**: Live games shown first, then scheduled, then completed games
- **Clean, modern UI** with live game indicators
- **Detailed information**: Game time, venue, broadcast networks
- **Responsive design** that works great in the browser popup

## What's New in v2.0

✨ **Box Scores**: Click any game to see detailed player and team statistics  
🎨 **Team Logos**: Visual team identification with ESPN's official logos  
⏱️ **Live Details**: Quarter/period and game clock for in-progress games  
📅 **Date Navigation**: View scores from past and future dates  
⚾ **MLB Support**: Added Major League Baseball scores  
⚽ **Premier League**: Added English Premier League football scores

## Installation

### Install from source:

1. **Download or clone this repository** to your local machine

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner

4. **Click "Load unpacked"** button

5. **Select the `sports-scores-extension` folder** containing all the extension files

6. The extension should now appear in your Chrome toolbar!

## Usage

1. **Click the extension icon** in your Chrome toolbar to open the popup

2. **Navigate dates** using the Prev/Next buttons to view games from different dates

3. **View live scores** organized by league (NBA, NFL, NHL, MLB, Premier League)

4. **Click any game card** to see detailed box scores with player statistics

5. **Click the refresh button** (↻) to manually update scores

6. The extension **auto-refreshes every 60 seconds** for today's games

## Features Explained

### Date Navigation
- Use **← Prev** and **Next →** buttons to browse different dates
- Extension opens to **today's games** by default
- Can view up to 7 days in the future
- Auto-refresh only works for today's date

### Box Scores
- **Click any game card** to view detailed statistics
- See **player stats** (points, assists, rebounds, etc.)
- View **team statistics** comparison
- Stats vary by sport and data availability

### Team Identification
- **Team logos** displayed from ESPN (when available)
- **Color-coded circles** with team abbreviations as fallback
- Teams update dynamically based on ESPN's official branding

### Game Status Indicators
- 🔴 **LIVE**: Game is currently in progress with quarter/period and time
  - NBA/NFL: Shows quarter (1st, 2nd, 3rd, 4th) and game clock
  - NHL: Shows period (1st, 2nd, 3rd) and time remaining
  - MLB: Shows inning number
  - Soccer: Shows half and match time
- **FINAL**: Game has completed (may show OT/SO for overtime/shootout)
- **Time**: Scheduled start time for upcoming games

### Game Organization
Within each league, games are sorted:
1. **Live games** (currently in progress) - shown at the top
2. **Scheduled games** (upcoming) - shown in the middle
3. **Completed games** - shown at the bottom

### Game Information
Each game card shows:
- **Team logos** or color-coded team identifiers
- Team names and current scores
- Current game status/time/quarter
- Venue information
- Broadcast networks (when available)
- Winner highlighted in bold with color accent
- **Click to view**: Full box scores with player statistics

## Data Source

This extension uses the free **ESPN API** for real-time game data:
- NBA: `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`
- NFL: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- NHL: `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard`
- MLB: `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard`
- Premier League: `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`

Box scores use ESPN's summary endpoint with detailed player and team statistics.

No API key required!

## Customization

### Change Auto-Refresh Interval
Edit `popup.js` around line 45:
```javascript
// Change 60000 (60 seconds) to your preferred interval in milliseconds
autoRefreshInterval = setInterval(() => {
  if (isToday(currentDate)) {
    loadScores();
  }
}, 60000);
```

### Change Date Navigation Limit
Edit `popup.js` in the `updateDateDisplay()` function:
```javascript
// Change 7 to allow more days in the future
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate() + 7);
```

### Add More Leagues
You can add additional sports by:
1. Adding the ESPN API endpoint to `API_ENDPOINTS` in `popup.js`
2. Adding a new section in `popup.html`
3. Adding the league to the fetch calls in `loadScores()`
4. Update `getLeaguePath()` for box score support

### Customize Colors
Edit `styles.css` to change:
- Background gradient (around line 11)
- League colors
- Live game indicators
- Card hover effects
- Team color fallbacks in `popup.js` `getTeamColor()` function

## File Structure

```
sports-scores-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Core logic and API calls
├── styles.css            # Styling
├── icon16.png            # 16x16 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
├── create-icons.html     # Helper to generate custom icons
└── README.md             # This file
```

## Troubleshooting

### No games showing
- Check if there are games scheduled for the selected date
- Try clicking the refresh button
- Use date navigation to check other dates
- Check browser console for errors (`Right-click` → `Inspect` → `Console`)

### Box scores not loading
- Not all games have box scores available immediately
- Pre-game and some live games may have limited stats
- Try refreshing or waiting until the game progresses
- Check console for API errors

### Scores not updating
- Auto-refresh only works for today's date
- Check your internet connection
- Verify you have permission to access `site.api.espn.com`
- Try removing and reinstalling the extension

### Team logos not showing
- Some teams may not have logos in ESPN's API
- Fallback color circles will display instead
- Colors are based on team abbreviations

### Extension not loading
- Make sure all files are in the same directory
- Verify manifest.json is properly formatted
- Check that Developer Mode is enabled in Chrome
- Reload the extension in `chrome://extensions/`

**For detailed debugging steps, see [DEBUGGING.md](DEBUGGING.md)**

## Privacy

This extension:
- Does NOT collect any user data
- Does NOT track your browsing
- Only makes requests to ESPN's public API
- All data processing happens locally in your browser

## Browser Compatibility

- ✅ Chrome (tested and verified)
- ✅ Brave (tested and verified)
- ✅ Edge (Chromium-based, should work)
- ✅ Opera (Chromium-based, should work)
- ✅ Other Chromium-based browsers (should work)

**Note for Brave users**: If you encounter issues, check your Shield settings and ensure the extension has permission to access `site.api.espn.com`. See DEBUGGING.md for Brave-specific troubleshooting.

## Credits

- Game data provided by ESPN's free public API
- Built with vanilla JavaScript (no frameworks!)
- Icons created with HTML5 Canvas

## License

Free to use and modify for personal or commercial projects.

## Future Enhancements

Potential features to add:
- [ ] More soccer leagues (La Liga, Bundesliga, Serie A)
- [ ] NCAA sports (Basketball, Football)
- [ ] Playoff brackets and standings
- [ ] Live play-by-play updates
- [ ] Favorite teams filter and notifications
- [ ] Desktop notifications for close games
- [ ] Game highlights and video links
- [ ] Historical scores and season stats
- [ ] Dark mode theme
- [ ] Pin favorite leagues
- [ ] Export scores to calendar

## Contributing

Feel free to fork and improve this extension! Some ideas:
- Add more sports leagues
- Improve the UI/UX
- Add team logos
- Create a settings page
- Add dark mode

---

**Enjoy your live sports scores!** 🏀🏈🏒
