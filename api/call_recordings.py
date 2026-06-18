from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock external API details
EXTERNAL_API_URL = 'https://external.api/call_recordings'

# Token-based authentication (example: using a header)
@app.before_request
def authenticate():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer your_secure_token':  # Replace with actual token logic
        return jsonify({'message': 'Unauthorized'}), 401

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    try:
        response = requests.get(EXTERNAL_API_URL)
        response.raise_for_status()  # Raise an error for bad responses
        data = response.json()

        # Process the data
        call_recordings = data.get('recordings', [])
        funding_info = data.get('funding_info', [])

        # Structuring the response
        result = []
        for recording in call_recordings:
            recording_id = recording.get('id')
            corresponding_funding = [fund for fund in funding_info if fund['recording_id'] == recording_id]
            result.append({
                'recording': recording,
                'funding_info': corresponding_funding
            })

        return jsonify(result), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
