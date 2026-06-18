from flask import Flask
from api.call_recordings import call_recordings_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(call_recordings_bp)
    return app
