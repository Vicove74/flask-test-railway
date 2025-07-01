import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def hello():
    return "WordPress MCP Server is working!"

@app.route('/health')
def health():
    return {"status": "healthy", "message": "Server is running"}

@app.route('/wp-test')
def wp_test():
    wp_url = os.environ.get('WP_URL', 'https://melanita.net')
    wp_user = os.environ.get('WP_USER', '')
    wp_pass = os.environ.get('WP_APP_PASSWORD', '')
    
    if not wp_pass:
        return {"error": "WP_APP_PASSWORD not set"}
    
    try:
        url = f"{wp_url}/wp-json/wp/v2/pages/528"
        response = requests.get(url, auth=(wp_user, wp_pass), timeout=15)
        
        return {
            "status": "success" if response.status_code == 200 else "error",
            "wp_status": response.status_code,
            "message": "WordPress connection test completed",
            "wp_url": wp_url,
            "wp_user": wp_user
        }
    except Exception as e:
        return {"error": str(e)}

@app.route('/update528')
def update_page_528():
    wp_url = os.environ.get('WP_URL', 'https://melanita.net')
    wp_user = os.environ.get('WP_USER', '')
    wp_pass = os.environ.get('WP_APP_PASSWORD', '')
    
    try:
        get_url = f"{wp_url}/wp-json/wp/v2/pages/528"
        response = requests.get(get_url, auth=(wp_user, wp_pass), timeout=15)
        
        if response.status_code != 200:
            return {"error": f"Could not get page: {response.status_code}"}
        
        current_content = response.json()['content']['rendered']
        new_content = current_content + " ."
        
        payload = {"content": new_content}
        update_response = requests.post(get_url, json=payload, auth=(wp_user, wp_pass), timeout=30)
        
        return {
            "status": "success" if update_response.status_code == 200 else "error",
            "code": update_response.status_code,
            "message": "Added dot to page 528" if update_response.status_code == 200 else "Update failed"
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.route('/update', methods=['POST'])
def update_any_page():
    wp_url = os.environ.get('WP_URL', 'https://melanita.net')
    wp_user = os.environ.get('WP_USER', '')
    wp_pass = os.environ.get('WP_APP_PASSWORD', '')
    
    try:
        data = request.get_json()
        if not data:
            return {"error": "No JSON data provided"}, 400
            
        page_id = data.get('page_id')
        new_content = data.get('new_content')
        
        if not page_id or not new_content:
            return {"error": "Required: page_id and new_content"}, 400
        
        url = f"{wp_url}/wp-json/wp/v2/pages/{page_id}"
        payload = {"content": new_content}
        
        response = requests.post(url, json=payload, auth=(wp_user, wp_pass), timeout=30)
        
        return {
            "status": "success" if response.status_code == 200 else "error",
            "page_id": page_id,
            "code": response.status_code,
            "message": f"Page {page_id} updated successfully" if response.status_code == 200 else "Update failed"
        }
        
    except Exception as e:
@app.route('/get528')
def get_full_content_528():
    """Get complete content of page 528"""
    wp_url = os.environ.get('WP_URL', 'https://melanita.net')
    wp_user = os.environ.get('WP_USER', '')
    wp_pass = os.environ.get('WP_APP_PASSWORD', '')
    
    try:
        url = f"{wp_url}/wp-json/wp/v2/pages/528"
        response = requests.get(url, auth=(wp_user, wp_pass), timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "success",
                "page_id": 528,
                "title": data.get('title', {}).get('rendered', ''),
                "content": data.get('content', {}).get('rendered', ''),
                "content_raw": data.get('content', {}).get('raw', ''),
                "excerpt": data.get('excerpt', {}).get('rendered', ''),
                "modified": data.get('modified', ''),
                "slug": data.get('slug', ''),
                "link": data.get('link', '')
            }
        else:
            return {"error": f"Could not get page: {response.status_code}"}
        
    except Exception as e:
        return {"error": str(e)}
