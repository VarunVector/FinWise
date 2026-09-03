# TODO

## Task: StockPrediction - Show whether Live LSTM data or Mock/Demo data is displayed

### Goal
Make it clear in the StockPrediction page whether real-time LSTM predictions (from the Flask backend) are loading, or whether demo/mock data is being shown as a fallback.

### Steps
- [x] 1. Add a `dataSource` state ('live' | 'demo') to track where data came from in `StockPrediction.js`.
- [x] 2. Update fetch logic to set the correct data source (live vs demo fallback).
- [x] 3. Add a visible status badge in the header showing "Live LSTM Data" (green) or "Demo Data" (amber).
- [x] 4. ~~Add a warning banner when falling back to mock data~~ (removed per user request).
- [x] 5. Add matching CSS for the badge in `StockPrediction.css` (banner CSS also removed).
- [x] 6. Verify the behavior: start Flask backend + React app, confirm "Live LSTM Data" badge appears.
  - Backend dependency fix: use venv Python (`backend/venv/Scripts/python.exe`) which has flask + flask-cors installed.
  - Verified `/api/stocks/predictions` returns 38 real predictions (e.g., `ONGC.NS`) with HTTP 200.
