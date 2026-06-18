from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Dummy token for authentication
API_TOKEN = 'your_api_token'
EXTERNAL_API_URL = 'https://external-api.com/call_recordings'

@app.route('/api/call-recordings', methods=['GET'])
def fetch_call_recordings():
    # Check for token in headers
    token = request.headers.get('Authorization')
    if not token or token != f'Token {API_TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401

    # Fetch call recordings from external API
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), 500

    # Parse the response
    data = response.json()
    call_recordings = []
    funding_info = []

    for item in data:
        call_recordings.append(item['recording'])
        funding_info.append(item['funding'])

    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)