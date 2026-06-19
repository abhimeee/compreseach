from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Replace with the actual external API URL and token
EXTERNAL_API_URL = 'https://externalapi.com/call_recordings'
EXTERNAL_API_TOKEN = 'your_actual_token_here'

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token is missing'}), 401

    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(EXTERNAL_API_URL, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), response.status_code

    recordings = response.json()['recordings']
    funding_info = []

    # Process each recording to fetch funding details
    for recording in recordings:
        # Assuming each recording has a `funding_id` to retrieve funding data
        funding_response = requests.get(f'{EXTERNAL_API_URL}/{recording[