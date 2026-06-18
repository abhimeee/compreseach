from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Constants
EXTERNAL_API_URL = 'https://external.api/call_recordings'

# Token-based authentication decorator
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        # Here we would verify the token; this is a placeholder
        return f(*args, **kwargs)
    return decorated

# Fetch call recordings
@app.route('/api/call_recordings', methods=['GET'])
token_required
def get_call_recordings():
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data'}), 500
    data = response.json()
    recordings = data.get('recordings', [])
    funding_info = data.get('funding_info', [])
    return jsonify({'recordings': recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)