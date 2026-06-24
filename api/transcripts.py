from flask import Flask, jsonify, request

app = Flask(__name__)

# Mock data structure for company funding information
COMPANIES_DATA = {
    'Memora AI': {'latest_round': 'Series B', 'total_funding': 50_000_000},
    'ContextFlow': {'latest_round': 'Seed', 'total_funding': 10_000_000},
    'Lattice Knowledge': {'latest_round': 'Series A', 'total_funding': 20_000_000}
}

# Sample transcripts
TRANSCRIPTS = [
    {'meeting_id': 1, 'content': "In the recent discussions, Memora AI raised Series B funding."},
    {'meeting_id': 2, 'content': "ContextFlow has launched some competitive features."},
    {'meeting_id': 3, 'content': "Lattice Knowledge is focusing on its Series A developments."}
]

@app.route('/api/meetings/transcripts', methods=['GET'])
def get_transcripts_and_funding():
    funding_info = []
    for transcript in TRANSCRIPTS:
        companies_found = [company for company in COMPANIES_DATA if company in transcript['content']]
        for company in companies_found:
            funding_info.append({
                'meeting_id': transcript['meeting_id'],
                'company': company,
                'latest_round': COMPANIES_DATA[company]['latest_round'],
                'total_funding': COMPANIES_DATA[company]['total_funding']
            })
    return jsonify(funding_info)

if __name__ == '__main__':
    app.run(debug=True)