#!/usr/bin/env python3
"""
Simple HTTP server with API proxy for GitOps Dashboard
Serves static files on port 8080 and proxies /api/* to port 3070
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
from urllib.error import HTTPError, URLError

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_request('GET')
        elif self.path.startswith('/audit'):
            # Proxy audit endpoints to API server
            self.proxy_request('GET')
        else:
            # Handle SPA routing - serve index.html for all non-API routes
            if self.path != '/' and not self.path.startswith('/assets/') and '.' not in self.path.split('/')[-1]:
                self.path = '/index.html'
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_request('POST')
        elif self.path.startswith('/audit'):
            # Proxy audit endpoints to API server
            self.proxy_request('POST')
        else:
            self.send_error(404, "Not Found")
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def proxy_request(self, method):
        # Proxy API requests to port 3070
        target_url = f"http://localhost:3070{self.path}"
        
        try:
            if method == 'GET':
                with urllib.request.urlopen(target_url) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
            
            elif method == 'POST':
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                
                req = urllib.request.Request(target_url, data=post_data, method='POST')
                req.add_header('Content-Type', 'application/json')
                
                with urllib.request.urlopen(req) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(data)
                    
        except HTTPError as e:
            self.send_error(e.code, e.reason)
        except URLError as e:
            self.send_error(502, f"Bad Gateway: {str(e)}")
        except Exception as e:
            self.send_error(500, f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    PORT = 8080
    
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"🚀 GitOps Dashboard with API proxy running on port {PORT}")
        print(f"📡 Proxying /api/* requests to http://localhost:3070")
        httpd.serve_forever()