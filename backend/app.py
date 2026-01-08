from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(
    app, resources={r"/*": {"origins": "https://ai-resume-creator.netlify.app"}}
)  # Enable CORS for all routes


def get_api_key():
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return jsonify({"error": "No API key provided"}), 401
    return api_key


@app.route("/validate-key", methods=["POST"])
def validate_key():
    api_key = get_api_key()
    if isinstance(api_key, tuple):  # Error response
        return api_key

    try:
        client = genai.Client(api_key=api_key)
        chat = client.chats.create(model="gemini-2.5-flash-lite")
        # Try a simple generation to validate the key
        response = chat.send_message("test")
        return jsonify({"status": "valid"}), 200
    except Exception as e:
        return jsonify({"error": "Invalid API key", "message": str(e)}), 401


@app.route("/generate", methods=["POST"])
def generate_response():
    api_key = get_api_key()
    if isinstance(api_key, tuple):  # Error response
        return api_key

    try:
        data = request.get_json()
        history = data.get("history", [])
        message = data.get("message", "")

        # Initialize Gemini model with the specified version
        client = genai.Client(api_key=api_key)
        # Convert history format to Gemini's format
        chat_history = []
        for msg in history:
            if msg["role"] == "user":
                chat_history.append(
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=msg["parts"][0]["text"])],
                    )
                )

            else:
                chat_history.append(
                    types.Content(
                        role="model",
                        parts=[types.Part.from_text(text=msg["parts"][0]["text"])],
                    )
                )

        # Start chat with history
        chat = client.chats.create(model="gemini-2.5-flash", history=chat_history)

        # Send message and get response
        response = chat.send_message(message)

        # Return the response text
        return response.text

    except Exception as e:
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run()
