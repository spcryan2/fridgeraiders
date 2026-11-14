from flask import Flask
from flask_cors import CORS
from routes.scan import scan_bp
from routes.meal import meal_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
app.config["MAX_CONTENT_LENGTH"] = 8*1024*1024
app.register_blueprint(scan_bp)
app.register_blueprint(meal_bp)

if __name__ == "__main__":
    app.run(debug=True,port=5001)