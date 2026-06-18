from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Authentication decorator example
@app.before_request
def require_token():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer YOUR_SECURE_TOKEN':
        return jsonify({'error': 'Unauthorized'}), 401

# Fetch call recordings endpoint
@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    external_api_url = 'https://external.api/call_recordings'
    response = requests.get(external_api_url)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data'}), 500

    data = response.json()
    call_recordings = data.get('call_recordings', [])
    funding_info = data.get('funding_info', [])

    return jsonify({
        'call_recordings': call_recordings,
        'funding_info': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)