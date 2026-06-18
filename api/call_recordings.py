from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# External API URL
EXTERNAL_API_URL = 'https://external-api.com/call-recordings'

# Middleware to check token-based authentication
@app.before_request
def check_authentication():
    token = request.headers.get('Authorization')
    if not token or not is_valid_token(token):  # Assuming is_valid_token checks the token's validity
        return jsonify({'message': 'Unauthorized'}), 401

# Endpoint to fetch call recordings and associated funding information
@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    # Fetch call recordings from external API
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch recordings from external source'}), 500

    data = response.json()
    recordings = data.get('recordings', [])
    funding_info = data.get('funding', [])

    return jsonify({
        'call_recordings': recordings,
        'funding_info': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)
