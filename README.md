# 🔮 AI Astrologer (Simple, Rule‑Based)

A lightweight web app that collects birth details (Name, Date, Time, Place) and returns a friendly, astrology‑style reading. It also supports one free‑text question with a rule‑based response.

> **Note**: This is for learning & entertainment; no real astrological calculations (e.g., ephemerides) are performed.

## ✨ Features
- Clean, single‑page UI (no build step).
- Inputs: **Name, Date of Birth, Time of Birth, Place of Birth**.
- Output: western zodiac sign, ruling planet, life‑path number (numerology), lucky color & number, daily guidance, focus & watch‑outs.
- **Q&A**: Ask a free‑text question about love/career/health/money/study and get a contextual reply based on sign + life path.
- 100% client‑side JavaScript. No server, no API keys.

## 🚀 Quick Start
1. Download the zip and extract.
2. Open `index.html` in your browser (double‑click).
3. Enter your details and click **Get Reading**.
4. Ask a follow‑up question in the **Ask a Question** box.

## 📁 Project Structure
```
ai-astrologer/
├── index.html      # UI and layout
├── style.css       # Styles
├── app.js          # Rule-based logic & Q&A
└── README.md       # Setup, usage & demo instructions
```

## 🧠 How It Works (Brief)
- **Zodiac**: Determined from month/day (western signs).
- **Life Path Number**: Sum of date digits reduced to a single digit, preserving 11/22/33 as master numbers.
- **Traits & Guidance**: Predefined text snippets per sign + daily message chosen deterministically from your name & date.
- **Q&A**: Keyword detection (career, love, health, money, study) + personalized hints from life path + sign traits.


---

## 🖥️ Run Locally

### Option 1: Open directly
1. Download this repo as ZIP  
2. Extract it  
3. Open `index.html` in your browser  

### Option 2: Run with local server
If your browser blocks local JS, start a local server:
```bash
# Using Python 3
python -m http.server 8000

# Or using Node.js
npx serve
Then visit → http://localhost:8000
(or http://localhost:3000 if using serve).

## ⚠️ Disclaimer
This app provides generalized guidance for educational and entertainment purposes only and should not be considered professional advice.
