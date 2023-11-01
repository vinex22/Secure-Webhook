import hmac
import hashlib
import http.server
import json
import os
from http.server import BaseHTTPRequestHandler

SECRET_KEY = "It's a Secret to Everybody"

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
        # Replace with the logic to forward the payload to Jenkins
        # You can use the requests library or any suitable method to make an HTTP POST request to Jenkins.
        # Example:
        # import requests
        # jenkins_url = "http://jenkins-webhook-url"
        # headers = {"Content-Type": "application/json"}
        # response = requests.post(jenkins_url, data=payload, headers=headers)

        # For simplicity, we'll just print the payload here
        print("Forwarding to Jenkins:")
        print(payload.decode('utf-8'))

def run(server_class=http.server.HTTPServer, handler_class=WebhookHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Server is running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
