from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)

# Set your OpenAI API key as environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route('/ask_ai', methods=['POST'])
def ask_ai():
    data = request.json
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300
    )

    answer = response['choices'][0]['message']['content']
    return jsonify({'answer': answer})

if __name__ == '__main__':
    app.run(debug=True)
