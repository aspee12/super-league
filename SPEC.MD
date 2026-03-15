# Super League - Product Specification

## Overview
Super League is a football league web application inspired by the English Premier League.

The system allows users to view:

- League standings
- Match fixtures
- Team statistics
- Team profiles

Design reference:
https://www.figma.com/design/0g4ZPmXa57jtbvhzqLd4My/Selise-Football-legue

---

# Core Features

## 1. League Table

Displays the current league standings.

Columns:

- Position
- Team
- Played
- Won
- Draw
- Lost
- Goals For
- Goals Against
- Goal Difference
- Points

Features:

- Sorted by points
- Tie-break using goal difference
- Team logo displayed
- Highlight top teams

---

## 2. Matches

Displays match fixtures and results.

Information:

- Match date
- Home team
- Away team
- Score
- Match status

Status types:

- Scheduled
- Live
- Finished

Features:

- Upcoming matches
- Completed matches
- Match details page

---

## 3. Statistics

League statistics overview.

Examples:

Top Scorers  
Top Assists  
Most Clean Sheets  

Information:

- Player name
- Team
- Statistic value

Optional expansion:

- Yellow cards
- Red cards
- Minutes played

---

## 4. Teams

Displays all teams in the league.

Team card includes:

- Team logo
- Team name
- Stadium
- Founded year

Team detail page includes:

- Squad list
- Team statistics
- Recent matches

---

# CMS Data Models

## Teams

Fields:

- name
- logo
- stadium
- foundedYear
- coach
- description

---

## Players (optional extension)

Fields:

- name
- team
- position
- number
- nationality
- photo

---

## Matches

Fields:

- homeTeam
- awayTeam
- date
- homeScore
- awayScore
- status

---

## Standings

Fields:

- team
- played
- wins
- draws
- losses
- goalsFor
- goalsAgainst
- points

---

# Pages

Home Page

- Latest matches
- League table snapshot
- Featured statistics

League Table Page

- Full league standings

Matches Page

- Fixtures
- Results

Teams Page

- List of teams

Team Detail Page

- Team information
- Squad
- Statistics

Statistics Page

- Top scorers
- Top assists
- Clean sheets

---

# Non Functional Requirements

Performance

- Fast page load using Next.js server components
- Optimized images using Next image

Scalability

- CMS driven content via Payload
- MongoDB database

Responsiveness

- Mobile friendly
- Tablet support
- Desktop optimized

---

# Future Enhancements

Player profiles  
Match live commentary  
League filtering  
Multiple leagues  
User accounts  
Favorite teams