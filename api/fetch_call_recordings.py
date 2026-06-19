import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Configuration for the external API and token-based authentication
EXTERNAL_API_URL = 'https://external.api/call_recordings'
TOKEN = 'your_actual_token_here'  # Replace with your token

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    headers = {'Authorization': f'Bearer {TOKEN}'}
    response = requests.get(EXTERNAL_API_URL, headers=headers)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), 500

    data = response.json()
    call_recordings = []
    funding_info = []

    for item in data:
        call_recordings.append(item['recording'])  # Assume a 'recording' field exists
        funding_info.append(item['funding'])    # Assume a 'funding' field exists

    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)