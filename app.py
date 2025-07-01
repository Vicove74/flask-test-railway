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

@app.route('/env')
def check_env():
    return {
        "WP_URL": os.environ.get('WP_URL', 'NOT_SET'),
        "WP_USER": os.environ.get('WP_USER', 'NOT_SET'),
        "WP_PASS_SET": bool(os.environ.get('WP_APP_PASSWORD'))
    }

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
            "page_title": response.json().get('title', {}).get('rendered', 'N/A') if response.status_code == 200 else "Error"
        }
    except Exception as e:
        return {"error": str(e)}

@app.route('/update528')
def update_page_528():
    wp_url = os.environ.get('WP_URL', 'https://melanita.net')
    wp_user = os.environ.get('WP_USER', '')
    wp_pass = os.environ.get('WP_APP_PASSWORD', '')
    
    try:
        # Get current content
        get_url = f"{wp_url}/wp-json/wp/v2/pages/528"
        response = requests.get(get_url, auth=(wp_user, wp_pass), timeout=15)
        
        if response.status_code != 200:
            return {"error": f"Could not get page: {response.status_code}"}
        
        current_content = response.json()['content']['rendered']
        new_content = current_content + " ."
        
        # Update content
        payload = {"content": new_content}
        update_response = requests.post(get_url, json=payload, auth=(wp_user, wp_pass), timeout=30)
        
        return {
            "status": "success" if update_response.status_code == 200 else "error",
            "code": update_response.status_code,
            "message": "Added dot to page 528" if update_response.status_code == 200 else "Update failed"
        }
        
    except Exception as e:
        return {"error": str(e)}
