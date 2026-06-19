from flask import Flask, request, jsonify
import requests
from functools import wraps

app = Flask(__name__)

# Dummy function for token validation (replace with real implementation)
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or token != "Bearer your_token_here":
            return jsonify({'message': 'Token is missing or invalid!'}), 403
        return f(*args, **kwargs)
    return decorated

# External API endpoint
EXTERNAL_API_URL = 'https://external.api/call_recordings'

@app.route('/api/call_recordings', methods=['GET'])
@token_required
def fetch_call_recordings():
    # Fetch call recordings
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data from external API.'}), 500

    data = response.json()
    call_recordings = []
    funding_info = []

    # Process the data
    for item in data:
        call_recordings.append({'id': item['id'], 'recording_url': item['recording_url']})
        funding_info.append({'call_id': item['id'], 'funding_details': item['funding_details']})

    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info}), 200

if __name__ == '__main__':
    app.run(debug=True)