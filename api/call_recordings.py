from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Token-based authentication (using a simple placeholder for this example)
@app.before_request
def authenticate():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer YOUR_ACCESS_TOKEN':
        return jsonify({'message': 'Unauthorized'}), 401

@app.route('/call_recordings', methods=['GET'])
def get_call_recordings():
    # Fetch call recordings from the external API
    response = requests.get('https://externalapi.com/call_recordings')
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data'}), 500

    recordings = response.json()
    funding_info = []

    # Fetch funding info for each call recording
    for recording in recordings:
        funding_response = requests.get(f'https://externalapi.com/funding/{recording['id']}')
        if funding_response.status_code == 200:
            funding_info.append(funding_response.json())
        else:
            funding_info.append({'id': recording['id'], 'funding': None})  # Default funding info if fetch fails

    return jsonify({
        'recordings': recordings,
        'funding': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)