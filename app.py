from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load pre-trained model and tokenizer
model_name = "gpt2"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)


@app.route("/")
def index():
    return render_template("index.html")


conversation_history = []


@app.route(
    "/generate_response", methods=["GET", "POST"]
)  # Allow both GET and POST requests
def generate_response():
    if request.method == "POST":
        user_query = request.form["user_query"]
        conversation_history.append(
            {"user": user_query, "bot": ""}
        )  # Add user message to history
        response = generate_response_from_model(user_query)
        conversation_history[-1][
            "bot"
        ] = response  # Update last entry in history with bot response
        return jsonify({"response": response})
    else:
        return jsonify({"error": "Method not allowed"}), 405


def generate_response_from_model(user_query):
    # Tokenize user query
    input_ids = tokenizer.encode(user_query, return_tensors="pt")

    # Generate response
    output = model.generate(
        input_ids,
        max_length=200,
        num_beams=5,
        no_repeat_ngram_size=2,
        top_k=50,
        top_p=0.95,
    )
    response = tokenizer.decode(output[0], skip_special_tokens=True)

    # Ensure the chatbot response doesn't include the user's message
    response = response.replace(user_query, "").strip()

    return response


if __name__ == "__main__":
    app.run(debug=True)
