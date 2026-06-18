from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Mock external API endpoint
EXTERNAL_API_URL = 'https://externalapi.com/call_recordings'

# Token-based authentication decorator
def token_required(f):
    def decorator(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 403
        # Ideally, you would validate the token here
        return f(*args, **kwargs)
    return decorator

@app.route('/api/call_recordings', methods=['GET'])
@token_required
def fetch_call_recordings():
    try:
        response = requests.get(EXTERNAL_API_URL)
        response.raise_for_status()
        recordings_data = response.json()
        call_recordings = recordings_data['call_recordings']
        funding_info = recordings_data['funding_info']

        # Structuring the response
        structured_response = {
            'call_recordings': call_recordings,
            'funding_info': funding_info
        }

        return jsonify(structured_response), 200
    except requests.exceptions.HTTPError as http_err:
        return jsonify({'error': str(http_err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)