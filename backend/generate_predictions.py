import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_percentage_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from concurrent.futures import ProcessPoolExecutor, as_completed
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from newsapi import NewsApiClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
import os
import io
import sys
import time

# Load environment variables
load_dotenv()

# Change default output encoding to handle special chars cleanly if needed
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
newsapi = NewsApiClient(api_key=NEWS_API_KEY) if NEWS_API_KEY and NEWS_API_KEY != "YOUR_NEWS_API_KEY_HERE" else None
sentiment_model = SentimentIntensityAnalyzer()

stocks = [
    "RELIANCE.NS","TCS.NS","INFY.NS","HDFCBANK.NS","ICICIBANK.NS",
    "HINDUNILVR.NS","ITC.NS","LT.NS","SBIN.NS","BHARTIARTL.NS",
    "ASIANPAINT.NS","AXISBANK.NS","BAJFINANCE.NS","BAJAJFINSV.NS",
    "CIPLA.NS","COALINDIA.NS","DRREDDY.NS","EICHERMOT.NS",
    "GRASIM.NS","HCLTECH.NS","HDFCLIFE.NS","JSWSTEEL.NS",
    "KOTAKBANK.NS","M&M.NS","MARUTI.NS","NESTLEIND.NS",
    "NTPC.NS","ONGC.NS","POWERGRID.NS","SBILIFE.NS",
    "SUNPHARMA.NS","TATACONSUM.NS","TATAMOTORS.NS","TATASTEEL.NS",
    "TECHM.NS","TITAN.NS","ULTRACEMCO.NS","UPL.NS","WIPRO.NS"
]

# -----------------------------
# DATE RANGE (10 Years as requested)
# -----------------------------
end_date = datetime.today()
start_date_str = (end_date - timedelta(days=3650)).strftime('%Y-%m-%d')

def create_dataset(data, time_step=60):
    X, y = [], []
    for i in range(len(data) - time_step - 1):
        X.append(data[i:(i + time_step), :])
        y.append(data[i + time_step, 0])
    return np.array(X), np.array(y)

def get_news_data(company):
    if not newsapi:
        return 0, []
    try:
        news = newsapi.get_everything(
            q=company,
            language="en",
            page_size=10,
            sort_by="publishedAt"
        )
        sentiments = []
        articles = []
        for article in news["articles"][:5]: # Take top 5 for sentiment
            title = article["title"]
            score = sentiment_model.polarity_scores(title)["compound"]
            sentiments.append(score)
            
        for article in news["articles"][:3]: # Take top 3 for display
            articles.append({
                "title": article["title"],
                "source": article["source"]["name"],
                "url": article["url"],
                "publishedAt": article["publishedAt"]
            })
        
        avg_sentiment = np.mean(sentiments) if sentiments else 0
        return avg_sentiment, articles
    except Exception as e:
        print(f"News API Error for {company}: {e}")
        return 0, []

print("Downloading global indicators...")
try:
    sp500 = yf.download("^GSPC", start=start_date_str, progress=True)[['Close']]
    sp500.rename(columns={'Close':'SP500'}, inplace=True)
except Exception as e:
    print(f"Warning: Failed to download SP500: {e}")
    sp500 = pd.DataFrame(index=pd.date_range(start=start_date_str, end=end_date), columns=['SP500']).fillna(0)

try:
    vix = yf.download("^VIX", start=start_date_str, progress=True)[['Close']]
    vix.rename(columns={'Close':'VIX'}, inplace=True)
except Exception as e:
    print(f"Warning: Failed to download VIX: {e}")
    vix = pd.DataFrame(index=pd.date_range(start=start_date_str, end=end_date), columns=['VIX']).fillna(0)

def train_stock(stock):
    try:
        time.sleep(2) # Small delay to avoid rate limiting
        print(f"[{stock}] Fetching 10Y data...")
        # Use period instead of dates for better reliability
        df = yf.download(stock, period="10y", progress=False)[['Close', 'Volume']]
        if df.empty:
            print(f"[{stock}] No data found with period='10y'. Trying start_date...")
            df = yf.download(stock, start=start_date_str, progress=False)[['Close', 'Volume']]
            if df.empty:
                print(f"[{stock}] Final attempt failed. Skipping.")
                return None
            
        df.rename(columns={'Close':'Stock_Close'}, inplace=True)

        data = df.join(sp500, how='left').join(vix, how='left')
        
        # Fill missing indicator values with 0
        data['SP500'] = data['SP500'].ffill().fillna(0)
        data['VIX'] = data['VIX'].ffill().fillna(0)

        # News sentiment integration
        sentiment, news_articles = get_news_data(stock.split(".")[0])
        data['News_Sentiment'] = sentiment

        data.dropna(inplace=True)

        scaler = MinMaxScaler(feature_range=(0,1))
        scaled_data = scaler.fit_transform(data)

        train_size = int(len(scaled_data) * 0.8)
        train_data = scaled_data[:train_size]
        test_data = scaled_data[train_size:]

        time_step = 60
        if len(train_data) <= time_step or len(test_data) <= time_step:
            print(f"[{stock}] Insufficient data for 60-day window")
            return None

        X_train, y_train = create_dataset(train_data, time_step)
        X_test, y_test = create_dataset(test_data, time_step)

        # -----------------------------
        # LSTM Model
        # -----------------------------
        model = Sequential()
        model.add(LSTM(64, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])))
        model.add(Dropout(0.2))
        model.add(LSTM(64))
        model.add(Dropout(0.2))
        model.add(Dense(25))
        model.add(Dense(1))
        model.compile(optimizer='adam', loss='mean_squared_error')

        print(f"[{stock}] Training model (10 epochs)...")
        model.fit(X_train, y_train, epochs=10, batch_size=32, verbose=0)

        print(f"[{stock}] Generating predictions...")
        predictions = model.predict(X_test, verbose=0)
        
        predictions_full = np.zeros((len(predictions), data.shape[1]))
        predictions_full[:,0] = predictions[:,0]
        predictions = scaler.inverse_transform(predictions_full)[:,0]

        y_test_full = np.zeros((len(y_test), data.shape[1]))
        y_test_full[:,0] = y_test
        y_test_unscaled = scaler.inverse_transform(y_test_full)[:,0]

        mape = mean_absolute_percentage_error(y_test_unscaled, predictions)
        accuracy = (1 - mape) * 100

        # Predict the next day
        last_60_days = scaled_data[-time_step:]
        last_60_days_reshaped = last_60_days.reshape(1, time_step, last_60_days.shape[1])
        next_day_pred = model.predict(last_60_days_reshaped, verbose=0)
        
        pred_full = np.zeros((1, data.shape[1]))
        pred_full[0, 0] = next_day_pred[0, 0]
        next_price = scaler.inverse_transform(pred_full)[0, 0]

        live_price = float(data['Stock_Close'].iloc[-1])
        
        # Recent history for graph (last 30 days)
        recent_history = data['Stock_Close'].iloc[-30:].values.flatten().tolist()
        dates = data.index[-30:].strftime('%Y-%m-%d').tolist()

        graph_data = [{"date": d, "price": round(float(p), 2)} for d, p in zip(dates, recent_history)]
        
        # Add next day predicted value to graph
        graph_data.append({"date": "Next Day", "price": round(float(next_price), 2), "predicted": True})

        signal = "BUY" if next_price > live_price else "SELL"
        expected_return = ((next_price - live_price) / live_price) * 100

        result = {
            "symbol": stock,
            "live_price": round(float(live_price), 2),
            "predicted_price": round(float(next_price), 2),
            "signal": signal,
            "confidence": round(float(accuracy), 2),
            "expected_return": round(float(expected_return), 2),
            "news": news_articles,
            "graph_data": graph_data
        }
        
        print(f"[{stock}] Done. Accuracy: {accuracy:.2f}%. Return: {expected_return:.2f}%")
        return result

    except Exception as e:
        print(f"Error processing {stock}: {e}")
        return None

def save_or_update_predictions(new_results, output_path):
    """
    Safely merges new predictions into predictions.json and saves them.
    Prevents overwriting existing predictions with an empty list if rate-limited.
    """
    if not new_results:
        print("⚠️ No new results generated. Preserving existing predictions.json file.")
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    existing_data = []

    if os.path.exists(output_path):
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"Notice: Could not load existing predictions: {e}")

    # Create a map by symbol
    data_map = {item['symbol']: item for item in existing_data if isinstance(item, dict) and 'symbol' in item}

    # Update with new results
    for res in new_results:
        data_map[res['symbol']] = res

    # Convert back to list and sort by expected_return
    updated_list = list(data_map.values())
    updated_list.sort(key=lambda x: x.get('expected_return', 0), reverse=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(updated_list, f, indent=4, ensure_ascii=False)

    print(f"\n✅ Predictions successfully updated & saved ({len(updated_list)} total stocks) to: {output_path}")
    for r in updated_list[:5]:
        print(f"  • {r.get('symbol')} | Return: {r.get('expected_return')}% | Acc: {r.get('confidence')}%")

if __name__ == "__main__":
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(SCRIPT_DIR, 'data', 'predictions.json')
    
    results = []
    target_stocks = stocks
    
    print(f"Starting sequential/parallel training for {len(target_stocks)} stocks...")
    print(f"Target predictions file path: {output_path}")
    
    # Process with max_workers=1 to mitigate Yahoo Finance rate limiting
    with ProcessPoolExecutor(max_workers=1) as executor:
        futures = {executor.submit(train_stock, stock): stock for stock in target_stocks}

        for future in as_completed(futures):
            res = future.result()
            if res is not None:
                results.append(res)
                # Incrementally update JSON file so progress is not lost if rate-limited
                save_or_update_predictions([res], output_path)

    # Final overall save & summary
    if results:
        save_or_update_predictions(results, output_path)
    else:
        print("⚠️ No new stocks processed in this run. Existing predictions.json remains intact.")


