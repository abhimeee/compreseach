from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Replace with your external API details
EXTERNAL_API_URL = 'https://external-api.example.com/call_recordings'

# Middleware for tokenbased authentication
@app.before_request
def token_required():
    token = request.headers.get('Authorization')
    if not token or token != 'Bearer YOUR_SECRET_TOKEN':
        return jsonify({'message': 'Token is missing or invalid!'}), 403

@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    try:
        # Fetch call recordings from the external API
        response = requests.get(EXTERNAL_API_URL)
        response.raise_for_status()  # raises an HTTPError for bad responses
        data = response.json()

        # Process the response to separate call recordings and funding info
        call_recordings = data.get('call_recordings', [])
        funding_info = data.get('funding_info', [])

        # Construct the API response
        return jsonify({
            'call_recordings': call_recordings,
            'funding_info': funding_info
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)