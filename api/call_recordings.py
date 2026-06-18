from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock external API credentials
EXTERNAL_API_URL = 'https://external-api.example.com/call_recordings'

# Token-based Authentication Middleware
@app.before_request
def check_auth_token():
    token = request.headers.get('Authorization')
    if not token or not validate_token(token):
        return jsonify({'error': 'Unauthorized access'}), 401

# Mock token validation function
def validate_token(token):
    # Here would be the logic to validate the token
    return True  # For simplicity, we assume all tokens are valid in this example

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch recordings'}), response.status_code
    # Assume response data includes a list of recordings with funding info
    recordings = response.json() 
    # Process data as needed to separate call recordings and funding info
    call_recordings = []
    funding_info = []
    for item in recordings:
        call_recordings.append({'id': item['id'], 'name': item['name']})
        funding_info.append({'recording_id': item['id'], 'funding_amount': item['funding_amount']})
    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)