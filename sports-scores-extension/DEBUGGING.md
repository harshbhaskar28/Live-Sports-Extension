# Debugging Guide

## Common Issues and Solutions

### Box Scores Not Opening

**Problem**: Clicking on game cards doesn't open the box score modal.

**Solution**:
1. Open the browser console (Right-click → Inspect → Console)
2. Check for any JavaScript errors
3. Verify the extension is properly loaded in `brave://extensions/` or `chrome://extensions/`
4. Make sure you see game cards with `data-event-id` attributes
5. Try reloading the extension

**Check this in console**:
```javascript
// Should see the event listener attached
document.getElementById('scores-container')
```

### Period/Time Not Showing for Live Games

**Problem**: Live games show "LIVE" instead of "2nd - 5:23" or quarter information.

**Diagnosis**:
1. Open browser console
2. When games are loaded, check the data structure:
```javascript
// This will show you what data is available
console.log('Status data:', status);
console.log('Detail:', status.type.detail);
console.log('Period:', status.period);
console.log('Clock:', status.displayClock);
```

**Common causes**:
- Game hasn't started yet (shows scheduled time)
- API hasn't updated with live data yet
- Sport uses different data structure

### Content Security Policy Errors

**Problem**: Console shows CSP violation errors.

**Fixed in v2.1**: We removed all inline event handlers (`onclick`, etc.) and use proper event listeners.

**If you still see CSP errors**:
- Make sure you're using the latest version
- Clear browser cache
- Reload the extension
- Check that manifest.json doesn't have syntax errors

### Team Logos Not Displaying

**Problem**: Color circles show instead of team logos.

**Expected behavior**: This is normal! Not all teams have logos in ESPN's API.

**To verify logos are working**:
1. Open console
2. Check for 404 errors on image loads
3. Logos should load from `a.espncdn.com`

**Fallback behavior**: Color circles with team abbreviations display when:
- Team logo URL is not in API response
- Logo image fails to load (404 error)
- ESPN doesn't provide logos for that sport/league

### Date Navigation Issues

**Problem**: Next button doesn't work or dates don't change.

**Check**:
1. Next button is disabled after 7 days in future (this is intentional)
2. Make sure JavaScript console shows no errors
3. Verify `currentDate` variable is updating

**Test in console**:
```javascript
// Should show current selected date
console.log(currentDate);
```

### Auto-Refresh Not Working

**Expected behavior**: Auto-refresh ONLY works for today's date.

**Why**: To save API calls and battery, we only auto-refresh current games.

**To verify**:
1. Navigate to today's date
2. Wait 60 seconds
3. Watch for new API calls in Network tab (F12 → Network)
4. Should see requests to `site.api.espn.com`

**If still not working**:
- Check console for `setInterval` errors
- Verify `isToday()` function returns true
- Make sure extension isn't paused/sleeping

### No Games Showing

**Quick checks**:
1. **Is this the off-season?** Check if leagues are actually playing
2. **Wrong date?** Use date navigation to find games
3. **API issue?** Check console for fetch errors
4. **Network blocked?** Check Network tab for failed requests

**Test API manually**:
Open this URL in browser to see if API works:
```
https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=20260102
```
(Change date to today's date in YYYYMMDD format)

### Modal Won't Close

**Solutions**:
1. Click the X button in top-right
2. Click outside the modal (on the dark background)
3. Press Escape key (if implemented)
4. If stuck, reload the extension

### Brave Browser Specific Issues

**Shield Settings**: Brave's shields can block requests
- Click shield icon in address bar
- Set shields to "Down" for the extension
- Or whitelist `site.api.espn.com`

**Private/Incognito Mode**: Extension might not work in private windows unless you enable it:
- Go to `brave://extensions/`
- Find "Live Sports Scores"
- Enable "Allow in Private"

### Performance Issues

**Extension feels slow or laggy**:
1. Reduce number of visible leagues (edit popup.js)
2. Increase refresh interval from 60s to 120s
3. Clear browser cache
4. Check if other extensions are conflicting
5. Disable extension when not using it

## How to Report Issues

If you encounter a bug:

1. **Check console for errors** (F12 → Console)
2. **Note your browser** (Chrome, Brave, Edge, version)
3. **Describe the problem** (what you expected vs what happened)
4. **Include any error messages** from console
5. **List the steps to reproduce** the issue

## Developer Console Commands

Useful commands to debug in console:

```javascript
// Check current date
console.log('Current date:', currentDate);

// Check if auto-refresh is running
console.log('Refresh interval:', autoRefreshInterval);

// Manually trigger refresh
loadScores();

// Check what leagues have games
document.querySelectorAll('.league-section').forEach(section => {
  if (section.style.display !== 'none') {
    console.log('Visible league:', section.id);
  }
});

// Count total games
console.log('Total games:', document.querySelectorAll('.game-card').length);

// Test modal
showBoxScore('401584883', 'nba'); // Example event ID
```

## Checking API Responses

To see raw API data:

1. Open Network tab (F12 → Network)
2. Filter by "Fetch/XHR"
3. Refresh the extension
4. Click on API requests to `site.api.espn.com`
5. View Response tab to see raw JSON

This helps identify:
- Missing data fields
- API changes
- Data structure differences between sports
- Why certain info isn't displaying

---

**Still stuck?** Make sure you're using the latest version and all files are present!
