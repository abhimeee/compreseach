# Call Recordings API

## Overview
This API fetches call recordings and their corresponding funding information from an external source, ensuring that funding details are returned as separate entities. It includes token-based authentication for secure access.

## Endpoint
- `GET /api/call-recordings`

## Authentication
Token-based authentication using JWT (Json Web Tokens).

## Fetching Logic
1. The API fetches call recordings from an external API.
2. For each recording, it fetches the corresponding funding information.
3. The response is structured to return both call recordings and funding info separately.