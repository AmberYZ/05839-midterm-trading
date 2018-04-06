# Get real-time market price for stocks
from Robinhood import Robinhood
import csv
import sys
import time


day_data_root = 'static/data/real_time/' #Root path of the data
ticker = sys.argv[1]
	


if __name__ == '__main__':
	#Login to Robinhood Account
	username = 'yuyan.zhang.950310@gmail.com'
	password = 'VB!vol57fox'
	trader = Robinhood()
	f =  open(day_data_root+ticker+".csv",'w')
	quote = trader.quote_data(ticker)
	timestamp = quote['updated_at']
	price = quote['last_trade_price']

	
	writer = csv.writer(f)
	writer.writerow(['time','price']) 
	writer.writerow([timestamp,price]) 
	f.close()
