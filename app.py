import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# WordPress настройки от Environment Variables
WP_URL = os.environ.get('WP_URL', 'https://melanita.net')
WP_USER = os.environ.get('WP_USER', '')
WP_PASS = os.environ.get('WP_APP_PASSWORD', '')

@app.route('/')
def home():
    return {
        "status": "running",
        "message": "WordPress MCP Server is working!",
        "endpoints": {
            "test": "GET /test - Test WordPress connection",
            "update": "POST /update - Update page content",
            "pages": "GET /pages - List pages"
        }
    }

@app.route('/test')
def test_connection():
    """Test WordPress REST API connection"""
    if not WP_PASS:
        return {"error": "WP_APP_PASSWORD not configured"}, 400
    
    try:
        url = f"{WP_URL}/wp-json/wp/v2/pages?per_page=1"
        response = requests.get(url, auth=(WP_USER, WP_PASS), timeout=15)
        
        return {
            "status": "success" if response.status_code == 200 else "error",
            "wp_status": response.status_code,
            "wp_url": WP_URL,
            "wp_user": WP_USER,
            "message": "WordPress connection test completed"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__
        }, 500

@app.route('/update', methods=['POST'])
def update_page():
    """Update WordPress page content"""
    try:
        data = request.get_json()
        if not data:
            return {"error": "No JSON data provided"}, 400
            
        page_id = data.get('page_id')
        new_content = data.get('new_content')
        
        if not page_id or not new_content:
            return {"error": "Required: page_id and new_content"}, 400
        
        # WordPress REST API endpoint for updating page
        url = f"{WP_URL}/wp-json/wp/v2/pages/{page_id}"
        payload = {"content": new_content}
        
        response = requests.post(
            url, 
            json=payload, 
            auth=(WP_USER, WP_PASS), 
            timeout=30
        )
        
        if response.status_code == 200:
            return {
                "status": "success",
                "page_id": page_id,
                "message": "Page updated successfully"
            }
        else:
            return {
                "status": "error",
                "code": response.status_code,
                "wp_error": response.text[:300]
            }, response.status_code
            
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
