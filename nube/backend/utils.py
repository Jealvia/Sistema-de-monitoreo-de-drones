from pytz import timezone
import datetime
from datetime import date

def get_today():
    now_utc = datetime.datetime.now(timezone('UTC'))
    now = now_utc.astimezone(timezone('America/Guayaquil'))
    return now.strftime("%Y-%m-%d")

def get_today_hour():
    now_utc = datetime.datetime.now(timezone('UTC'))
    now = now_utc.astimezone(timezone('America/Guayaquil'))
    return now.strftime("%H:%M")

print(get_today_hour())