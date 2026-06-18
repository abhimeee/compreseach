from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock external API endpoint
EXTERNAL_API_URL = 'https://externalapi.com/call_recordings'

# Token-based authentication
AUTHENTICATION_TOKEN = 'your_token_here'  # Replace with secure token retrieval mechanism

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    token = request.headers.get('Authorization')
    if token != f'Bearer {AUTHENTICATION_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401

    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data'}), 500

    data = response.json()
    call_recordings = data.get('call_recordings', [])
    funding_info = data.get('funding_info', [])

    results = []
    for recording in call_recordings:
        recording_response = {
            'recording_id': recording['id'],
            'recording_url': recording['url'],
            'funding': []
        }
        for funding in funding_info:
            if funding['recording_id'] == recording['id']:
                recording_response['funding'].append(funding)
        results.append(recording_response)

    return jsonify(results)

if __name__ == '__main__':
    app.run(port=5000)
