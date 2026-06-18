from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

# Dummy external API endpoint and token
EXTERNAL_API_URL = 'https://external.api/call_recordings'
API_TOKEN = 'your_api_token_here'

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer ' + API_TOKEN:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Fetch call recordings from the external API
        response = requests.get(EXTERNAL_API_URL, headers={'Authorization': 'Bearer ' + API_TOKEN})
        response.raise_for_status()
        call_recordings = response.json()

        # Assuming each call_recording has a funding_id to fetch funding info
        funding_info = []
        for recording in call_recordings:
            recording_id = recording.get('id')
            funding_response = requests.get(f'https://external.api/funding/{recording_id}', headers={'Authorization': 'Bearer ' + API_TOKEN})
            funding_response.raise_for_status()
            funding_info.append(funding_response.json())

        # Structure the response
        return jsonify({
            'call_recordings': call_recordings,
            'funding_info': funding_info
        })

    except requests.exceptions.HTTPError as http_err:
        return jsonify({'error': str(http_err)}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)