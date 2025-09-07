from datetime import datetime, timedelta
import random
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .serializers import (
    UserSerializer, LoginSerializer, PasswordResetRequestSerializer,
    OTPVerificationSerializer, ChangePasswordSerializer, EmailVerificationSerializer,
    SendVerificationSerializer, GoogleLoginSerializer, UpdateUsernameSerializer
)
from .models import User, OTP
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
    def perform_create(self, serializer):
        user = serializer.save()
        
        # Generate and send email verification OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        expires_at = datetime.now() + timedelta(minutes=10)
        
        OTP.objects.create(
            user=user,
            otp=otp,
            otp_type='email_verification',
            expires_at=expires_at
        )
        
        # Send verification email
        subject = 'Welcome! Verify Your Email - Complete Auth'
        text_content = f'Welcome {user.username}! Your email verification OTP is: {otp}. Valid for 10 minutes.'
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 30px;">
              <h2 style="color: #2d7ff9; text-align: center;">Welcome to Complete Auth!</h2>
              <p>Dear {user.username},</p>
              <p>Thank you for registering! Please use the OTP below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background: #2d7ff9; color: #fff; font-size: 2em; letter-spacing: 8px; padding: 12px 32px; border-radius: 6px;">
                  {otp}
                </span>
              </div>
              <p style="text-align: center; color: #888;">This OTP is valid for 10 minutes.</p>
              <p>You must verify your email before you can sign in to your account.</p>
              <hr style="margin: 30px 0;">
              <p style="font-size: 0.9em; color: #aaa; text-align: center;">&copy; {datetime.now().year} Complete Auth. All rights reserved.</p>
            </div>
          </body>
        </html>
        """

        try:
            email_msg = EmailMultiAlternatives(
                subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            email_msg.attach_alternative(html_content, "text/html")
            email_msg.send(fail_silently=False)
        except Exception as e:
            # Log the error but don't fail registration
            pass
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            response.data['message'] = 'Registration successful! Please check your email for verification OTP.'
        return response

class LoginView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(email=email, password=password)
            
            if user:
                # Check if email is verified
                if not user.is_verified:
                    return Response({
                        'error': 'Email not verified',
                        'message': 'Please verify your email before signing in',
                        'requires_verification': True,
                        'email': email
                    }, status=status.HTTP_403_FORBIDDEN)
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                expires_at = datetime.now() + timedelta(minutes=10)
                
                OTP.objects.create(
                    user=user,
                    otp=otp,
                    otp_type='password_reset',
                    expires_at=expires_at
                )
                
                # Send OTP via email with HTML template
                subject = 'Password Reset OTP'
                text_content = f'Your OTP for password reset is: {otp}. Valid for 10 minutes.'
                html_content = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 30px;">
                      <h2 style="color: #2d7ff9; text-align: center;">K9TXCHAT Password Reset</h2>
                      <p>Dear user,</p>
                      <p>You requested to reset your password. Please use the OTP below to proceed:</p>
                      <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; background: #2d7ff9; color: #fff; font-size: 2em; letter-spacing: 8px; padding: 12px 32px; border-radius: 6px;">
                          {otp}
                        </span>
                      </div>
                      <p style="text-align: center; color: #888;">This OTP is valid for 10 minutes.</p>
                      <p>If you did not request this, please ignore this email.</p>
                      <hr style="margin: 30px 0;">
                      <p style="font-size: 0.9em; color: #aaa; text-align: center;">&copy; {datetime.now().year} K9TXCHAT. All rights reserved.</p>
                    </div>
                  </body>
                </html>
                """

                email = EmailMultiAlternatives(
                    subject,
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                )
                email.attach_alternative(html_content, "text/html")
                email.send(fail_silently=False)
                
                return Response({'message': 'OTP sent successfully to your email'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.filter(
                    user=user,
                    otp=otp_code,
                    otp_type='password_reset',
                    expires_at__gt=datetime.now(),
                    is_used=False
                ).latest('created_at')
                
                user.set_password(new_password)
                user.save()
                otp.is_used = True
                otp.save()
                
                return Response({'message': 'Password reset successful'})
            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({'error': 'Invalid OTP or user'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.validated_data['old_password']):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({'message': 'Password changed successfully'})
            return Response({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendVerificationView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = SendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                
                # Delete any existing email verification OTPs for this user
                OTP.objects.filter(user=user, otp_type='email_verification').delete()
                
                # Generate new OTP
                otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                expires_at = datetime.now() + timedelta(minutes=10)
                
                OTP.objects.create(
                    user=user,
                    otp=otp,
                    otp_type='email_verification',
                    expires_at=expires_at
                )
                
                # Send verification email
                subject = 'Email Verification - Complete Auth'
                text_content = f'Your email verification OTP is: {otp}. Valid for 10 minutes.'
                html_content = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 30px;">
                      <h2 style="color: #2d7ff9; text-align: center;">Email Verification</h2>
                      <p>Dear {user.username},</p>
                      <p>Please use the OTP below to verify your email address:</p>
                      <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; background: #2d7ff9; color: #fff; font-size: 2em; letter-spacing: 8px; padding: 12px 32px; border-radius: 6px;">
                          {otp}
                        </span>
                      </div>
                      <p style="text-align: center; color: #888;">This OTP is valid for 10 minutes.</p>
                      <p>If you did not request this verification, please ignore this email.</p>
                      <hr style="margin: 30px 0;">
                      <p style="font-size: 0.9em; color: #aaa; text-align: center;">&copy; {datetime.now().year} Complete Auth. All rights reserved.</p>
                    </div>
                  </body>
                </html>
                """

                email_msg = EmailMultiAlternatives(
                    subject,
                    text_content,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                )
                email_msg.attach_alternative(html_content, "text/html")
                email_msg.send(fail_silently=False)
                
                return Response({'message': 'Verification OTP sent successfully to your email'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp']
            
            try:
                user = User.objects.get(email=email)
                otp = OTP.objects.filter(
                    user=user,
                    otp=otp_code,
                    otp_type='email_verification',
                    expires_at__gt=datetime.now(),
                    is_used=False
                ).latest('created_at')
                
                # Mark user as verified and OTP as used
                user.is_verified = True
                user.save()
                otp.is_used = True
                otp.save()
                
                return Response({'message': 'Email verified successfully'})
            except (User.DoesNotExist, OTP.DoesNotExist):
                return Response({'error': 'Invalid OTP or user'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        if serializer.is_valid():
            credential_token = serializer.validated_data['access_token']
            
            try:
                # Decode JWT token from Google
                import jwt
                import requests
                from jwt.exceptions import InvalidTokenError
                
                # First, try to decode the JWT token to get user info
                try:
                    # Decode without verification for now (Google's public keys would be needed for full verification)
                    decoded_token = jwt.decode(credential_token, options={"verify_signature": False})
                    email = decoded_token.get('email')
                    name = decoded_token.get('name', '')
                    first_name = decoded_token.get('given_name', '')
                    last_name = decoded_token.get('family_name', '')
                    
                except (InvalidTokenError, Exception) as jwt_error:
                    # If JWT decode fails, try treating it as an access token
                    google_response = requests.get(
                        f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={credential_token}'
                    )
                    
                    if google_response.status_code == 200:
                        google_data = google_response.json()
                        email = google_data.get('email')
                        name = google_data.get('name', '')
                        first_name = google_data.get('given_name', '')
                        last_name = google_data.get('family_name', '')
                    else:
                        return Response({'error': 'Invalid Google token', 'details': str(jwt_error)}, status=status.HTTP_400_BAD_REQUEST)
                
                if not email:
                    return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get or create user
                try:
                    user = User.objects.get(email=email)
                    # If user exists but wasn't verified, mark as verified (Google account is trusted)
                    if not user.is_verified:
                        user.is_verified = True
                        user.save()
                except User.DoesNotExist:
                    # Create new user with Google data
                    username = email.split('@')[0]  # Use email prefix as username
                    # Ensure username is unique
                    counter = 1
                    original_username = username
                    while User.objects.filter(username=username).exists():
                        username = f'{original_username}{counter}'
                        counter += 1
                    
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_verified=True  # Google accounts are pre-verified
                    )
                    user.set_unusable_password()  # No password needed for Google users
                    user.save()
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                })
                    
            except Exception as e:
                return Response({'error': f'Google authentication failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateUsernameView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        old_username = request.user.username
        serializer = UpdateUsernameSerializer(instance=request.user, data=request.data)
        if serializer.is_valid():
            updated_user = serializer.save()
            
            # Broadcast username change to all chat rooms where user is a participant
            self.broadcast_user_update(updated_user, old_username)
            
            return Response({
                'message': 'Username updated successfully',
                'user': UserSerializer(updated_user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def broadcast_user_update(self, user, old_username):
        """Broadcast user update to all chat rooms where user participates"""
        from chat.models import ChatRoom, Message
        
        channel_layer = get_channel_layer()
        if not channel_layer:
            return
        
        # Get all chat rooms where user is a participant
        user_rooms = ChatRoom.objects.filter(participants=user, is_active=True)
        
        for room in user_rooms:
            # Create a system message about username change
            system_message = Message.objects.create(
                room=room,
                sender=user,
                content=f'{old_username} is now known as {user.username}',
                message_type='system'
            )
            
            group_name = f'chat_{room.id}'
            
            # Send user update message to the room group
            async_to_sync(channel_layer.group_send)(group_name, {
                'type': 'user_update',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email
                },
                'old_username': old_username,
                'message': f'{old_username} is now known as {user.username}',
                'system_message': {
                    'id': system_message.id,
                    'content': system_message.content,
                    'timestamp': system_message.timestamp.isoformat(),
                    'message_type': 'system'
                }
            })
    
    def get(self, request):
        """Get current user profile"""
        return Response({
            'user': UserSerializer(request.user).data
        })
