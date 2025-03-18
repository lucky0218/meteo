from flask import Flask, json, render_template, request
from flask_cors import CORS
from pymongo import MongoClient
import datetime
import os
import sys

# Get the absolute path of the current file (app.py)
current_file = os.path.abspath(__file__)
# Get the directory containing app.py (ds)
current_dir = os.path.dirname(current_file)
# Get the parent directory (project)
parent_dir = os.path.dirname(current_dir)
# Add the parent directory to sys.path
sys.path.append(parent_dir)

# Import station_list from config.py
from config import station_list

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# MongoDB connection string – replace the password/credentials as needed
MONGO_CONNECTION_STRING = "mongodb+srv://jim:lucky0218@cluster0.lqm6b.mongodb.net/"
client = MongoClient(MONGO_CONNECTION_STRING)
db = client["meteo"]
test_collection = db["test"]

def handle_api_error(e, message="Internal server error"):
    app.logger.error(f"Error: {str(e)}")
    return json.jsonify({
        "success": False,
        "error": message
    }), 500

@app.route("/", methods=["GET"])
def server():
    return render_template("server.html")

@app.route("/by_station", methods=["GET"])
def by_station():
    if request.method == "GET":
        selected_station = request.args.get("station")
        if not selected_station:
            return json.jsonify({"error": "Station parameter is required"}), 400

        try:
            data = list(test_collection.find({"Station": int(selected_station)}).sort("Date", -1))
            data.reverse()
            return json.jsonify([{
                "Avg": doc["Avg"],
                "Date": doc["Date"].strftime("%Y-%m-%d"),
                "FDAvg": doc["FDAvg"],
                "Station": doc["Station"],
                "_id": str(doc["_id"]),
            } for doc in data])
        except Exception as e:
            return json.jsonify({"error": str(e)}), 500
    else:
        return json.jsonify({"error": "Invalid request method"}), 405

@app.route("/by_date", methods=["GET"])
def by_date():
    try:
        date_str = request.args.get("date")
        if not date_str:
            return json.jsonify({
                "success": False,
                "error": "Date parameter is required"
            }), 400

        try:
            chosen_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            next_day = chosen_date + datetime.timedelta(days=1)
        except ValueError:
            return json.jsonify({
                "success": False,
                "error": "Invalid date format (YYYY-MM-DD required)"
            }), 400

        data = list(test_collection.find({
            "Date": {"$gte": chosen_date, "$lt": next_day},
            "Station": {"$in": station_list}
        }))

        if not data:
            return json.jsonify({
                "success": False,
                "error": "No data found for this date"
            }), 404

        return json.jsonify({
            "success": True,
            "data": [{
                "Avg": doc["Avg"],
                "Date": doc["Date"].strftime("%Y-%m-%d"),
                "FDAvg": doc["FDAvg"],
                "Station": doc["Station"],
                "_id": str(doc["_id"]),
            } for doc in data]
        })

    except Exception as e:
        return handle_api_error(e)

@app.route("/advancedAnalysis", methods=["POST"])
def advanced_analysis():
    try:
        data = request.get_json()
        if not data:
            return json.jsonify({
                "success": False,
                "error": "Invalid request body"
            }), 400

        stations = data.get('stations')
        date_str = data.get('date')

        if not stations or not isinstance(stations, list):
            return json.jsonify({
                "success": False,
                "error": "Invalid or missing stations list"
            }), 400

        if len(stations) < 1 or len(stations) > 3:
            return json.jsonify({
                "success": False,
                "error": "Please select 1-3 stations"
            }), 400

        if not date_str:
            return json.jsonify({
                "success": False,
                "error": "Date parameter is required"
            }), 400

        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            next_day = target_date + datetime.timedelta(days=1)
        except ValueError:
            return json.jsonify({
                "success": False,
                "error": "Invalid date format (YYYY-MM-DD required)"
            }), 400

        try:
            station_codes = [int(code) for code in stations]
            invalid_stations = [code for code in station_codes if code not in station_list]
            if invalid_stations:
                return json.jsonify({
                    "success": False,
                    "error": f"Invalid station codes: {invalid_stations}"
                }), 400
        except ValueError:
            return json.jsonify({
                "success": False,
                "error": "Invalid station code format"
            }), 400

        query = {
            "Station": {"$in": station_codes},
            "Date": {"$gte": target_date, "$lt": next_day}
        }

        data = list(test_collection.find(query))

        if not data:
            return json.jsonify({
                "success": False,
                "error": "No data found for selected stations on this date"
            }), 404

        return json.jsonify({
            "success": True,
            "data": [{
                "Avg": doc["Avg"],
                "Station": doc["Station"],
                "Date": doc["Date"].strftime("%Y-%m-%d")
            } for doc in data]
        })

    except Exception as e:
        return handle_api_error(e)

if __name__ == "__main__":
    app.run(debug=True)
