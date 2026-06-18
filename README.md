# Call Recordings API

This API provides an endpoint to fetch call recordings along with their associated funding information.

## Requirements
- Python 3.7+
- Flask
- Requests

## Installation
1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Run the API:
   ```
   python api/call_recordings.py
   ```

## Endpoint
- `GET /api/call_recordings` - Fetches call recordings and funding information.

## Authentication
- Requires a token in the Authorization header to access the endpoint.