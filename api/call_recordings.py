from flask import Flask, jsonify, request
import requests
from functools import wraps

app = Flask(__name__)

# Mock external API base URL
EXTERNAL_API_URL = 'https://externalapi.com/call_recordings'

# Token-based authentication
API_TOKEN = 'your_secure_token'

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != f'Token {API_TOKEN}':
            return jsonify({'message': 'Token is missing or invalid!'}), 403
        return f(*args, **kwargs)
    return decorated

@app.route('/api/call_recordings', methods=['GET'])
token_required
def get_call_recordings():
    try:
        # Fetch call recordings from the external API
        response = requests.get(EXTERNAL_API_URL)
        response.raise_for_status()  # Raise an error for bad responses

        # Parse call recordings and funding info
        recordings = response.json()
        call_recordings = []
        funding_info = []

        for recording in recordings:
            call_recordings.append({
                'id': recording['id'],
                'title': recording['title'],
                'duration': recording['duration']
            })
            funding_info.append({
                'recording_id': recording['id'],
                'funding_amount': recording['funding']['amount'],
                'currency': recording['funding']['currency']
            })

        return jsonify({
            'call_recordings': call_recordings,
            'funding_info': funding_info
        }), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)