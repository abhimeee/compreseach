import requests
from flask import Blueprint, jsonify, request

# Initialize blueprint
fetch_recordings_bp = Blueprint('fetch_recordings', __name__)

# Endpoint to fetch call recordings and funding info
@fetch_recordings_bp.route('/call_recordings', methods=['GET'])
def fetch_call_recordings():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token is missing!'}), 403

    headers = {'Authorization': token}
    recordings_response = requests.get('https://external-api.com/call_recordings', headers=headers)

    if recordings_response.status_code != 200:
        return jsonify({'error': 'Failed to fetch call recordings'}), recordings_response.status_code

    recordings_data = recordings_response.json()
    funding_info = []

    # Extract funding info
    for recording in recordings_data['recordings']:
        funding_response = requests.get(f'https://external-api.com/funding/{recording['id']}', headers=headers)
        if funding_response.status_code == 200:
            funding_info.append(funding_response.json())

    return jsonify({'recordings': recordings_data['recordings'], 'funding_info': funding_info})