from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Token-based authentication middleware
@app.before_request
def authenticate():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer YOUR_TOKEN_HERE':  # Replace with real token validation
        return jsonify({'error': 'Unauthorized'}), 401

@app.route('/api/call-recordings', methods=['GET'])
def get_call_recordings():
    # Fetch call recordings from external API
    response = requests.get('https://external.api/callRecordings')  # Replace with real external API URL
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch call recordings'}), 500

    call_data = response.json()
    result = []

    # Process call recordings
    for recording in call_data['recordings']:
        recording_info = {
            'id': recording['id'],
            'recording_url': recording['url'],
            'funding_info': get_funding_info(recording['id'])  # Call funding retrieval function
        }
        result.append(recording_info)

    return jsonify({'call_recordings': result}), 200

def get_funding_info(recording_id):
    # Fetch funding information associated with a recording
    funding_response = requests.get(f'https://external.api/funding/{recording_id}')  # Replace with real funding API
    return funding_response.json() if funding_response.status_code == 200 else None

if __name__ == '__main__':
    app.run(debug=True)