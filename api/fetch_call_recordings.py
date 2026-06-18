from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Token-based authentication middleware
def authenticate(token):
    # Placeholder for authentication logic
    return token == "valid_token"

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    token = request.headers.get('Authorization')
    if not authenticate(token):
        return jsonify({'message': 'Unauthorized access'}), 401

    # Fetch call recordings from the external API
    response = requests.get('https://external-api.com/call_recordings')
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data'}), 500

    call_recordings = response.json()
    funding_info = {}

    # Fetch funding information for each recording
    for recording in call_recordings:
        funding_response = requests.get(f'https://external-api.com/funding/{recording['funding_id']}')
        if funding_response.status_code == 200:
            funding_info[recording['id']] = funding_response.json()

    # Structure the response as separate entities
    return jsonify({
        'call_recordings': call_recordings,
        'funding_info': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)