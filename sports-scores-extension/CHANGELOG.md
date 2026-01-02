# Changelog

## Version 2.5 (January 2026) - Final Polish! 🎨

### Visual Updates

🎨 **New Extension Icon**
- Replaced generic "S" icon with professional multi-sport balls design
- Features basketball, football, and soccer ball
- Eye-catching and instantly recognizable

📊 **Fixed Player Stats Table**
- Eliminated text wrapping in player names (no more "V. Edgecombe" on two lines)
- Fixed stat columns wrapping (FG stats like "6-13" now stay on one line)
- Optimized column widths:
  - Player name column: minimum 100px, left-aligned
  - Stat columns: minimum 45px each, centered
  - Added `white-space: nowrap` to prevent wrapping
- Improved horizontal scrolling for wide tables
- Better font sizing for readability

### Technical Improvements

- Consolidated duplicate `.modal-body` CSS definitions
- Added sticky header for stats table
- Improved table layout with `table-layout: auto`
- Better overflow handling (both horizontal and vertical)

### What You'll See

**Stats Tables Now:**
- ✅ Player names stay on one line
- ✅ Stats (like "6-13") don't wrap
- ✅ Cleaner, more professional appearance
- ✅ Horizontal scroll if table is too wide
- ✅ Sticky headers when scrolling

---

## Version 2.4 (January 2026)

### Major Fixes
- ✅ Live period/time display working
- ✅ Box score scores displaying correctly
- ✅ Simplified game cards
- ✅ Enhanced player stats (8-10 columns)

---

## Version 2.3 (January 2026)

### Critical Fixes
- Fixed CSP compliance
- Fixed score display
- Added comprehensive debug logging

---

## Version 2.2 (January 2026)

### Major Improvements
- Enhanced box score display
- Added expanded view integration

---

## Version 2.1 (January 2026)

### Bug Fixes
- Removed inline event handlers
- Fixed CSP violations

---

## Version 2.0 (January 2026)

### New Features
- Box scores with detailed statistics
- Team logos and branding
- Date navigation
- MLB and Premier League support

---

## Version 1.0 (December 2025)

### Initial Release
- NBA, NFL, NHL live scores
- Auto-refresh functionality
