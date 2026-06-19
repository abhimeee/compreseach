from flask import Flask, request, jsonify
from functools import wraps
import requests

app = Flask(__name__)

# Token-based authentication decorator

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        # Assume a validate_token function exists that validates the token
        if not validate_token(token):
            return jsonify({'message': 'Invalid Token!'}), 403
        return f(*args, **kwargs)
    return decorated

# Function to fetch call recordings
@token_required
@app.route('/api/call-recordings', methods=['GET'])
def fetch_call_recordings():
    external_api_url = 'https://external-api.example.com/call-recordings'
    response = requests.get(external_api_url)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data from external API'}), 500
    recordings_data = response.json()

    # Assuming the funding information is also included in the response
    call_recordings = []
    funding_info = []

    # Process the fetched data
    for item in recordings_data:
        call_recordings.append(item['recording'])
        funding_info.append(item['funding'])

    return jsonify({
        'call_recordings': call_recordings,
        'funding_info': funding_info
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
