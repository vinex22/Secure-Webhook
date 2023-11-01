import hmac
import hashlib
import http.server
import json
import os
from http.server import BaseHTTPRequestHandler
import requests  # Import the requests library

SECRET_KEY = "It's a Secret to Everybody"
JENKINS_WEBHOOK_URL = "http://jenkins-webhook-url"  # Replace with your Jenkins webhook URL

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        payload = self.rfile.read(content_length)

        # Calculate the HMAC signature
        calculated_signature = "sha256=" + hmac.new(SECRET_KEY.encode('utf-8'), payload, hashlib.sha256).hexdigest()

        # Get the provided signature from the request headers
        given_signature = self.headers.get('X-Hub-Signature-256')

        if calculated_signature == given_signature:
            print("Signatures match")

            # Forward the payload to Jenkins
            self.forward_webhook_to_jenkins(payload)

            self.send_response(200)
            self.end_headers()
        else:
            print("Invalid signature. Request rejected.")
            self.send_response(403)
            self.end_headers()

    def forward_webhook_to_jenkins(self, payload):
        # Forward the payload to Jenkins by making an HTTP POST request
        headers = {"Content-Type": "application/json"}
        
        try:
            response = requests.post(JENKINS_WEBHOOK_URL, data=payload, headers=headers)
            if response.status_code == 200:
                print("Webhook forwarded to Jenkins successfully.")
            else:
                print(f"Failed to forward the webhook to Jenkins. HTTP Response Code: {response.status_code}")
        except Exception as e:
            print(f"Error while forwarding webhook to Jenkins: {str(e)}")

def run(server_class=http.server.HTTPServer, handler_class=WebhookHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Server is running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
