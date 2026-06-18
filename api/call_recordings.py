from flask import Flask, request, jsonify
import requests
from functools import wraps

app = Flask(__name__)

# Mock function to simulate token verification
def verify_token(token):
    # Placeholder for token verification logic
    return token == 'valid_token'

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not verify_token(token):
            return jsonify({'message': 'Token is missing or invalid.'}), 403
        return f(*args, **kwargs)
    return decorated

@app.route('/api/call_recordings', methods=['GET'])
token_required 
def get_call_recordings():
    try:
        # Replace 'EXTERNAL_API_URL' and 'API_KEY' with actual values.
        response = requests.get('EXTERNAL_API_URL/call_recordings', headers={'Authorization': 'API_KEY'})
        call_recordings = response.json()
        funding_info = {}

        # Mock function to fetch funding info for each call recording
        for recording in call_recordings['data']:
            # Assuming 'id' is a key in recording
            funding_response = requests.get(f'EXTERNAL_API_URL/funding/{recording['id']}')
            funding_info[recording['id']] = funding_response.json()

        return jsonify({'call_recordings': call_recordings['data'], 'funding_info': funding_info})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)