from flask import Flask

app = Flask(__name__)

from .call_recordings import *  # Import fetch endpoint
from .fetch_call_recordings import fetch_recordings_bp

# Register the blueprint
app.register_blueprint(fetch_recordings_bp) Importing routes