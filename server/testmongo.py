from pymongo import MongoClient
import datetime

# 1. Connect to your MongoDB Atlas cluster.
#    Replace <username>, <password>, and <cluster-url> with your actual connection details.
client = MongoClient("mongodb+srv://jim:lucky0218@cluster0.lqm6b.mongodb.net/")

# 2. Select the database and the collection.
db = client["meteo"]
test_collection = db["test"]

# 3. Create a Python dictionary that mirrors your document structure.
#    - Station: an integer
#    - Date: stored as a Python datetime object (so MongoDB sees it as a Date)
#    - Avg: a float
#    - FDAvg: a float
doc_to_insert = {
    "Station": 58349,
    "Date": datetime.datetime(2024, 1, 1),  #  Use Python's datetime to get an ISODate type in Mongo
    "Avg": 3.8,
    "FDAvg": 2.5
}

# 4. Insert the document into MongoDB.
insert_result = test_collection.insert_one(doc_to_insert)

# 5. Print the inserted ID to verify.
print("Inserted document ID:", insert_result.inserted_id)
