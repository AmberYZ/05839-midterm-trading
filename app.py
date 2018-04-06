from __future__ import print_function
from flask import Flask
from flask import render_template, request,url_for
import csv
import requests
import json
import sys
import os
from flask import Flask, render_template, jsonify


app = Flask(__name__)
app.secret_key = 'some_secret'

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/selectedStock",methods=['POST'])
def query_real_time():
	ticker = str(request.json['ticker_selected'])
	cmd = 'python get_real_quote.py '+ticker
	os.system(cmd)
	cmd2 = 'python get_news.py ' + ticker
	os.system(cmd2)
	
	return "hello"


if __name__ == "__main__":
    app.run()



