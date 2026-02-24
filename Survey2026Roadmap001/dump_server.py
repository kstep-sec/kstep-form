import http.server
import socketserver
import urllib.parse
from http.server import BaseHTTPRequestHandler

class DumpHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        print("--- HEADERS ---")
        print(self.headers)
        print("--- BODY ---")
        print(post_data.decode('utf-8'))
        
        parsed = urllib.parse.parse_qs(post_data.decode('utf-8'))
        print("--- PARSED FIELDS ---")
        for k, v in parsed.items():
            print(f"{k}: {v}")
            
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"<html><head></head><body>Dumped</body></html>")

port = 8081
print(f"Starting server on port {port}")
httpd = socketserver.TCPServer(("", port), DumpHandler)
httpd.handle_request()  # Handle just one request and exit
