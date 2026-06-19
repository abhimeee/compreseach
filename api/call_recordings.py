from flask import Flask, request, jsonify
import requests
from functools import wraps

app = Flask(__name__)

# Mock external API config
EXTERNAL_API_ENDPOINT = 'https://external-api.com/call_recordings'

# Token-based authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        # Here you would normally verify the token
        return f(*args, **kwargs)
    return decorated

# Fetch call recordings
@app.route('/api/call_recordings', methods=['GET'])
token_required  # Token authentication
def get_call_recordings():
    response = requests.get(EXTERNAL_API_ENDPOINT)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch call recordings'}), 500

    data = response.json()
    call_recordings = data.get('call_recordings', [])
    funding_info = data.get('funding_info', [])

    results = []
    for recording in call_recordings:
        recording_id = recording.get('id')
        related_funding = [fund for fund in funding_info if fund['recording_id'] == recording_id]
        results.append({
            'recording': recording,
            'funding_info': related_funding
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
