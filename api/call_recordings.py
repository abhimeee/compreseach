from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Sample external API URL
EXTERNAL_API_URL = 'https://external-api.com/call_recordings'

# Middleware for token-based authentication
@app.before_request
def token_required():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 403
    # Implement token validation logic here

# Endpoint to fetch call recordings and funding info
@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    response = requests.get(EXTERNAL_API_URL)
    if response.status_code != 200:
        return jsonify({'message': 'Failed to fetch data from external API.'}), 500

    data = response.json()
    formatted_response = []

    for item in data['call_recordings']:
        call_record = {
            'id': item['id'],
            'title': item['title'],
            'date': item['date'],
        }
        funding_info = item['funding']
        formatted_response.append({'call_recording': call_record, 'funding_info': funding_info})

    return jsonify(formatted_response), 200

if __name__ == '__main__':
    app.run(debug=True)
