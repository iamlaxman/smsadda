# SMS ADDA - Production Ready

This is the production-ready version of the SMS ADDA application, organized with a clean folder structure for easy deployment and maintenance.

## Folder Structure

```
production-ready/
├── assets/
│   ├── groupchat.png
│   ├── login.jpg
│   ├── logo.png
│   ├── share.png
│   ├── signup.jpg
│   └── smsadda.apk
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── cookie_policy.html
├── cookie_settings.html
├── download.html
├── email_verification.html
├── forgot_password.html
├── index.html
├── login.html
├── privacy_policy.html
├── signup.html
├── sms_adda.html
├── terms_of_service.html
└── README.md
```

## Files Description

- `index.html`: Main landing page with features overview
- `signup.html`: User registration page with Firebase authentication
- `login.html`: User login page with Firebase authentication
- `forgot_password.html`: Password reset page
- `email_verification.html`: Email verification page for new users
- `sms_adda.html`: Main application dashboard with production-ready WhatsApp-like chat interface
- `download.html`: Application download page
- `privacy_policy.html`: Privacy policy document
- `terms_of_service.html`: Terms of service document
- `cookie_policy.html`: Cookie policy document
- `cookie_settings.html`: Cookie preferences management
- `css/styles.css`: All CSS styles for the application
- `js/app.js`: All JavaScript code for the application functionality
- `assets/`: Contains images and the mobile application package
- `README.md`: This file

## How to Deploy

1. Upload all files to your web server
2. Ensure all files maintain their relative paths
3. Configure Firebase credentials in all HTML files:
   - Replace `YOUR_API_KEY` with your actual Firebase API key
   - Replace `YOUR_AUTH_DOMAIN` with your actual Firebase Auth domain
   - Replace `YOUR_PROJECT_ID` with your actual Firebase Project ID
   - Replace `YOUR_STORAGE_BUCKET` with your actual Firebase Storage bucket
   - Replace `YOUR_MESSAGING_SENDER_ID` with your actual Firebase Messaging sender ID
   - Replace `YOUR_APP_ID` with your actual Firebase App ID
4. For image upload functionality, replace `YOUR_IMGBB_API_KEY` with your actual imgbb API key
5. Enable Google authentication in your Firebase Console:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google sign-in provider
   - Add your domain to the authorized domains list
6. The application should work immediately after deployment

## How to Use

1. Open `index.html` in a web browser to access the landing page
2. Navigate to signup/login pages to create an account or sign in
3. Use either email/password or Google authentication to sign in
4. After authentication, you'll be redirected to `sms_adda.html` dashboard
5. Use the chat interface to send messages, upload images, and create groups
6. The interface is fully responsive and works on both mobile and desktop devices
7. Download `assets/smsadda.apk` to install the mobile application on Android devices

## Features

- Real-time group chat functionality with WhatsApp-like interface
- Private messaging with read receipts
- User authentication (email/password and Google)
- Email verification for new accounts
- Password reset functionality
- Image upload and sharing
- Group creation and management
- Online/offline status indicators
- Message timestamps
- File sharing (images)
- Message reactions
- Online user status
- Profile management
- Fully responsive design for all devices (mobile and desktop)
- Cookie consent management
- Legal compliance documents

## Technologies Used

- HTML5
- CSS3 (with Tailwind CSS)
- JavaScript (ES6 modules)
- Firebase (Authentication, Realtime Database, and Storage)
- imgbb API (for image hosting)
- Font Awesome (Icons)

## Troubleshooting Google Authentication

If you're having issues with Google authentication:

1. Make sure Google sign-in is enabled in your Firebase Console:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google sign-in provider

2. Ensure your domain is added to the authorized domains list:
   - Go to Firebase Console → Authentication → Sign-in method
   - Scroll to "Authorized domains" section
   - Add your domain (e.g., localhost for development)

3. Check browser console for specific error messages:
   - Open Developer Tools (F12)
   - Check the Console tab for error messages

4. Make sure you're using a secure context (HTTPS) in production:
   - Google authentication requires HTTPS in production
   - For development, localhost is treated as secure

5. If you get "auth/unauthorized-domain" error:
   - Add your domain to the authorized domains list in Firebase Console

## Chat Interface Features

The SMSADDA chat interface (`sms_adda.html`) includes:

1. **Two-panel layout**:
   - Left panel: Contacts and groups list with search functionality
   - Right panel: Conversation view with message history

2. **Mobile-responsive design**:
   - Adapts to different screen sizes
   - Mobile-friendly navigation with bottom toolbar
   - Collapsible panels for small screens

3. **Real-time messaging**:
   - Instant message delivery
   - Read receipts (single/double ticks)
   - Online/offline status indicators

4. **Media sharing**:
   - Image upload functionality
   - Progress indicators during upload
   - Image display within chat

5. **Group functionality**:
   - Group creation with multiple members
   - Group chat interface
   - Member management

6. **User experience**:
   - Clean, modern interface similar to WhatsApp
   - Intuitive navigation
   - Smooth animations and transitions