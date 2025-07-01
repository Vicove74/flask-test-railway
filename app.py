from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Flask is working on Railway!"

@app.route('/health')
def health():
    return {"status": "healthy", "message": "Server is running"}

# Remove the if __name__ == '__main__' part completely
# Let Gunicorn handle everything
