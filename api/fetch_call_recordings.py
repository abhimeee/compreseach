from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# API endpoint to fetch call recordings
@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    # Token-based authentication
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized access'}), 401
    token = token.split(' ')[1]
    
    # Call external API
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get('https://external.api/call_recordings', headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch recordings'}), response.status_code
    recordings = response.json()

    # Fetch funding information for each recording
    funding_info = []
    for recording in recordings:
        funding_response = requests.get(f'https://external.api/funding/{recording['id']}', headers=headers)
        if funding_response.status_code == 200:
            funding_info.append(funding_response.json())
        else:
            funding_info.append({'id': recording['id'], 'error': 'Funding info not available'})

    # Structure the response
    return jsonify({'recordings': recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)