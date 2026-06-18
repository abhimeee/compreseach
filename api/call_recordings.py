from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock external API endpoint
EXTERNAL_API_URL = 'https://externalapi.com/call_recordings'
TOKEN = 'your_auth_token'  # Change this to a secure way of obtaining tokens

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    # Token-based authentication
    auth_token = request.headers.get('Authorization')
    if not auth_token or auth_token != f'Bearer {TOKEN}':
        return jsonify({'error': 'Unauthorized'}), 401

    # Fetch call recordings from external API
    try:
        headers = {'Authorization': f'Bearer {TOKEN}'}
        response = requests.get(EXTERNAL_API_URL, headers=headers)
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

    # Process the response to separate call recordings and funding info
    call_recordings = []
    funding_info = []

    for item in data:
        call_recordings.append(item.get('call'))
        funding_info.append(item.get('funding'))

    return jsonify({'call_recordings': call_recordings, 'funding_info': funding_info})

if __name__ == '__main__':
    app.run(debug=True)
