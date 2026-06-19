import requests
from flask import Flask, jsonify, request
from functools import wraps

app = Flask(__name__)

# Token-based authentication decorator

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        # Here you should verify the token; this is a placeholder
        # if not is_token_valid(token):
        #     return jsonify({'message': 'Invalid token!'}), 403
        return f(*args, **kwargs)
    return decorated

# Fetch call recordings and funding information
@app.route('/api/call_recordings', methods=['GET'])
@token_required
def get_call_recordings():
    external_api_url = 'https://externalapi.com/call_recordings'
    response = requests.get(external_api_url)

    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data from external API'}), response.status_code

    data = response.json()
    call_recordings = []
    funding_info = []

    for item in data['items']:
        call_recordings.append(item['call_recording_details'])
        funding_info.append(item['funding_details'])

    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)