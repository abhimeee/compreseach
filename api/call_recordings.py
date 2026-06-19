from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Function to fetch call recordings from external API
def fetch_call_recordings(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get('https://external.api/call_recordings', headers=headers)
    return response.json() if response.status_code == 200 else None

# Function to fetch funding information for a given call recording
def fetch_funding_info(call_recording_id, token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'https://external.api/funding_info/{call_recording_id}', headers=headers)
    return response.json() if response.status_code == 200 else None

# Endpoint to fetch all call recordings and their funding info
@app.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    token = request.headers.get('Authorization').split(' ')[1]
    recordings = fetch_call_recordings(token)

    if recordings:
        data = []
        for recording in recordings:
            funding_info = fetch_funding_info(recording['id'], token)
            data.append({
                'call_recording': recording,
                'funding_info': funding_info
            })
        return jsonify(data), 200
    return jsonify({'error': 'Unable to fetch data'}), 400

if __name__ == '__main__':
    app.run(debug=True)