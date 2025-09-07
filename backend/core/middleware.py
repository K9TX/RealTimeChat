"""
Custom middleware for handling Cross-Origin-Opener-Policy and security headers
specifically for Google OAuth integration.
"""

class SecurityHeadersMiddleware:
    """
    Middleware to add security headers that allow Google OAuth to work properly.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Remove or modify COOP header for OAuth endpoints
        if '/api/auth/' in request.path:
            # Allow cross-origin communication for OAuth
            response['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
            response['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
            
        # Add permissive headers for development
        if hasattr(response, 'get') and response.get('Access-Control-Allow-Origin'):
            response['Cross-Origin-Resource-Policy'] = 'cross-origin'
            
        return response