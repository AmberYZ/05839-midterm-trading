# Get real-time market price for stocks
from Robinhood import Robinhood
import csv
import sys
import time
import json
from nltk.corpus import stopwords
from nltk import word_tokenize
stop = set(stopwords.words('english'))


news_data_root = 'static/data/news/' #Root path of the data
ticker = sys.argv[1]
	


if __name__ == '__main__':
	#Login to Robinhood Account
	username = 'yuyan.zhang.950310@gmail.com'
	password = 'VB!vol57fox'
	trader = Robinhood()
	
	news = trader.get_news(ticker)['results']
	
	wordfreq = {}
	for n in news:
		content = n['summary']
		content = word_tokenize(content)
		content = [x for x in content if x not in stop]
		for word in content:
		    if word not in wordfreq:
		        wordfreq[word] = 0 
		    wordfreq[word] += 1
				
	with open(news_data_root+ticker+".json", 'w') as outfile:
		json.dump(wordfreq, outfile)
	
	
	# f =  open(news_data_root+ticker+".csv",'w')
	# writer = csv.writer(f)
	# writer.writerow(['summary'])
	# f.close()
