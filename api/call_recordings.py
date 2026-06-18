from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock function to simulate token validation
def validate_token(token):
    return token == "VALID_TOKEN"

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    token = request.headers.get('Authorization')
    if not token or not validate_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Fetch call recordings from the external API
    response = requests.get('https://external.api/call_recordings')
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch call recordings'}), 500

    recordings = response.json()  # Assuming that the API returns a JSON response
    funding_info = []
    
    # Fetch funding info related to each call recording
    for recording in recordings:
        funding_response = requests.get(f'https://external.api/funding/{recording["funding_id"]}')
        if funding_response.status_code == 200:
            funding_info.append(funding_response.json())
        else:
            funding_info.append({'funding_id': recording["funding_id"], 'error': 'Funding info unavailable'})

    return jsonify({
        'call_recordings': recordings,
        'funding_info': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)