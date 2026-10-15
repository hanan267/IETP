import requests
import random
import time

URL = "http://127.0.0.1:5000/readings"

while True:
    
    reading = {
      "moisture": random.randint(20, 80),
      "temperature": round(random.uniform(18, 35), 1),
      "light": random.randint(200, 1000),
    }

    response = requests.post(URL, json=reading)
    print(reading, response.status_code)
    time.sleep(3)