from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

API_URL = 'https://externalapi.com/call_recordings'

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Authorization token required'}), 401

    headers = {'Authorization': token}
    response = requests.get(API_URL, headers=headers)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), response.status_code

    data = response.json()
    call_recordings = data.get('recordings', [])
    funding_info = data.get('funding_info', [])

    return jsonify({
        'call_recordings': call_recordings,
        'funding_info': funding_info
    })

if __name__ == '__main__':
    app.run(debug=True)