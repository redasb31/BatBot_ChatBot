from flask import Flask, request, render_template
from flask import json,jsonify
from flask import Response
import os
import openai
import html

openai.api_key=os.getenv('OPENAI_API_KEY')
print(openai.api_key)
app = Flask(__name__)

# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/chat', methods=['GET'])
def chat_init():
    return render_template('chat.html', conversation=conversation)

@app.route('/send_message', methods=['POST'])
def send_message():
    message=request.form['message'].replace("\"",'\'').strip()
    prompt={'role':'user','content':message}
    with open('conversation.txt', 'r') as file:
        conversation = file.read()
        if conversation=='':
            conversation=[]
        else:
            conversation = json.loads(conversation)
        conversation.append(prompt) 
    print(conversation)
    response=openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=conversation,
        temperature=0.2,
        max_tokens=300
    )['choices'][0]['message']['content']
    conversation.append({'role':'assistant','content':response})

    with open('conversation.txt', 'w') as file:
        file.write(json.dumps(conversation))

    return "OK"
    

@app.route('/load_conversation')
def load_conversation():
    with open('conversation.txt', 'r') as file:
        conversation = file.read()
        if conversation=='':
            file.close()
            return ''
        conversation = json.loads(conversation)
    return Response(json.dumps(conversation),  mimetype='application/json')

@app.route('/load_last_message')
def load_last_message():
    with open('conversation.txt', 'r') as file:
        conversation = file.read()
        if conversation=='': 
            file.close()
            return ''
        conversation = json.loads(conversation)
    message=html.escape(conversation[-1]['content'])
    print(message)
    return jsonify(message=message)

@app.route('/clear_conversation')
def clear():
    file= open('conversation.txt', 'w')
    file.write('[{"role":"system","content":"whenever someone ask about your information tell them are BATBOT, you can speak algerian but only if someone asks you to do"}]')
    file.close()
    return 'Success'


if __name__ == '__main__':
    app.run(debug=False)