if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)import os
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

@app.route('/pages')
def list_pages():
    """List WordPress pages"""
    try:
        url = f"{WP_URL}/wp-json/wp/v2/pages"
        response = requests.get(url, auth=(WP_USER, WP_PASS), timeout=15)
        
        if response.status_code == 200:
            pages = response.json()
            return {
                "status": "success",
                "total": len(pages),
                "pages": [
                    {
                        "id": page["id"],
                        "title": page["title"]["rendered"],
                        "status": page["status"]
                    }
                    for page in pages
                ]
            }
        else:
            return {"error": f"WordPress returned status {response.status_code}"}, response.status_code
            
    except Exception as e:
        return {"error": str(e)}, 500

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

@app.route('/quick-test')
def quick_test():
    """Quick test to update page 528 with a simple change"""
    try:
        # Get current content of page 528
        get_url = f"{WP_URL}/wp-json/wp/v2/pages/528"
        response = requests.get(get_url, auth=(WP_USER, WP_PASS), timeout=15)
        
        if response.status_code != 200:
            return {"error": f"Could not get page 528: {response.status_code}"}
        
        current_page = response.json()
        current_content = current_page['content']['rendered']
        
        # Add a test dot at the end
        new_content = current_content + " ."
        
        # Update the page
        update_url = f"{WP_URL}/wp-json/wp/v2/pages/528"
        payload = {"content": new_content}
        
        update_response = requests.post(
            update_url, 
            json=payload, 
            auth=(WP_USER, WP_PASS), 
            timeout=30
        )
        
        if update_response.status_code == 200:
            return {
                "status": "success",
                "message": "Added test dot to page 528",
                "page_id": 528
            }
        else:
            return {
                "status": "error",
                "message": f"Update failed: {update_response.status_code}",
                "response": update_response.text[:200]
            }
            
    except Exception as e:
        return {"error": str(e)}, 500
