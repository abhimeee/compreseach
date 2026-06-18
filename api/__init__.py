from flask import Flask

app = Flask(__name__)

from .call_recordings import *  # Importing routes