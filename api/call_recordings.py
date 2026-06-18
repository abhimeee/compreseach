import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

# Dummy token verification function
def verify_token(token):
    return token == "your_secure_token_here"

@app.route('/api/call_recordings', methods=['GET'])
def fetch_call_recordings():
    token = request.headers.get('Authorization')
    if not token or not verify_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Fetch call recordings from an external API
    external_api_url = "https://externalapi.example.com/call_recordings"
    response = requests.get(external_api_url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from external API'}), 500
    
    recordings = response.json()
    funded_recordings = []
    
    # Logic to fetch funding info for each recording
    for recording in recordings:
        funding_info = get_funding_info_for_recording(recording['id'])
        funded_recordings.append({
            'call_recording': recording,
            'funding_info': funding_info
        })
    
    return jsonify(funded_recordings), 200

# Dummy function to simulate funding info retrieval
def get_funding_info_for_recording(recording_id):
    # In a real scenario, this would involve an API call to get funding info
    return {'amount': 1000, 'currency': 'USD', 'reference': recording_id}

if __name__ == '__main__':
    app.run(debug=True)