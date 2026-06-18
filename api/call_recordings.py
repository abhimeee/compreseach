from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Verify the token
def verify_token(token):
    # Token verification logic here (e.g. decoding JWT)
    return True  # Placeholder for actual token verification

# Endpoint to fetch call recordings and funding info
@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    token = request.headers.get('Authorization')
    if not token or not verify_token(token):
        return jsonify({'error': 'Unauthorized'}), 401

    # Call the external API to fetch call recordings
    external_api_url = 'https://external-api.com/call_recordings'
    response = requests.get(external_api_url)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), 500

    recordings = response.json()
    funding_details = []

    # Fetch funding information for each call recording
    for recording in recordings:
        recording_id = recording['id']
        funding_response = requests.get(f'https://external-api.com/funding/{recording_id}')
        if funding_response.status_code == 200:
            funding_details.append(funding_response.json())

    return jsonify({'call_recordings': recordings, 'funding_info': funding_details})

if __name__ == '__main__':
    app.run(debug=True)