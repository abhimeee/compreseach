from flask import Blueprint, request, jsonify
import requests

call_recordings_bp = Blueprint('call_recordings', __name__)

@call_recordings_bp.route('/api/call_recordings', methods=['GET'])
def get_call_recordings():
    # Get the auth token from headers
    auth_token = request.headers.get('Authorization')
    if not auth_token:
        return jsonify({'error': 'Authorization token is missing'}), 401
    
    # Fetch call recordings from external API
    try:
        headers = {'Authorization': auth_token}
        response = requests.get('https://externalapi.com/call_recordings', headers=headers)
        response.raise_for_status()
        recordings_data = response.json()
    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

    # Now fetch funding information
    funding_info = []
    for recording in recordings_data:
        try:
            recording_id = recording['id']
            funding_response = requests.get(f'https://externalapi.com/funding_info/{recording_id}', headers=headers)
            funding_response.raise_for_status()
            funding_info.append(funding_response.json())
        except requests.RequestException:
            funding_info.append({'id': recording_id, 'error': 'Funding info could not be fetched'})

    # Structure the response
    response_data = {
        'call_recordings': recordings_data,
        'funding_info': funding_info
    }
    return jsonify(response_data), 200
