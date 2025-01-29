from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": "http://localhost:5173"}})  # Enable CORS for all routes

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

@app.route('/', methods=['POST'])
def generate_response():
    try:
        data = request.get_json()
        history = data.get('history', [])
        message = data.get('message', '')



        # Initialize Gemini model with the specified version
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp-01-21')

        # Convert history format to Gemini's format
        chat_history = []
        for msg in history:
            if msg['role'] == 'user':
                chat_history.append({
                    'role': 'user',
                    'parts': [{'text': msg['parts'][0]['text']}]
                })
            else:
                chat_history.append({
                    'role': 'model',
                    'parts': [{'text': msg['parts'][0]['text']}]
                })

        # Start chat with history
        chat = model.start_chat(history=chat_history)
        
        # Send message and get response
        response = chat.send_message(message)
        
        # Return the response text
        return response.text

    except Exception as e:
        # Log the error
        print(f"Error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run()
