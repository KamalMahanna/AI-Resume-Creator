import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

app = Flask(__name__)
# Enable CORS for specified origins
cors_origins = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")
CORS(app, resources={r"/*": {"origins": cors_origins}})


def get_api_key():
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        return None
    return api_key


@app.route("/generate", methods=["POST"])
def generate_response():
    api_key = get_api_key()
    if not api_key:
        return jsonify({"error": "No API key provided"}), 401

    try:
        data = request.get_json()
        history = data.get("history", [])
        message = data.get("message", "")

        # Initialize the LangChain ChatGroq model
        llm = ChatGroq(
            model="openai/gpt-oss-120b", groq_api_key=api_key
        )

        # Convert history format to LangChain messages
        messages = []
        for msg in history:
            if not msg.get("parts") or not msg["parts"][0].get("text"):
                continue

            content = msg["parts"][0]["text"]
            role = msg.get("role")

            if role == "system":
                messages.append(SystemMessage(content=content))
            elif role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "model" or role == "assistant":
                messages.append(AIMessage(content=content))

        # Only add the current message if it's not already the last message in history
        if not messages or (message and messages[-1].content != message):
            messages.append(HumanMessage(content=message))

        # Send messages and get response
        response = llm.invoke(messages)

        # Ensure response content is a string
        content = response.content
        if isinstance(content, list):
            content = "".join([part.get("text", "") if isinstance(part, dict) else str(part) for part in content])

        # Return the response content text
        return content

    except Exception as e:
        # Log the error
        print(f"Error: {str(e)}")
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
