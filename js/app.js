import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue, onDisconnect, serverTimestamp, get, update, remove, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Common JavaScript functions for SMSADDA application

// Function to show error messages
function showError(message, elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Function to hide error messages
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

// Function to set loading state on buttons
function setLoading(element, loading, text) {
    if (loading) {
        element.innerHTML = `<span class="spinner"></span>${text}`;
        element.disabled = true;
    } else {
        element.innerHTML = text;
        element.disabled = false;
    }
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to check if user is authenticated
function checkAuthState(redirectIfNotAuth = true, redirectIfAuth = false) {
    // This function should be called after Firebase is initialized in each page
    // Example usage in individual pages:
    // firebase.auth().onAuthStateChanged(user => {
    //     if (user) {
    //         // User is signed in
    //         if (redirectIfAuth) {
    //             window.location.href = 'sms_adda.html';
    //         }
    //     } else {
    //         // User is signed out
    //         if (redirectIfNotAuth) {
    //             window.location.href = 'login.html';
    //         }
    //     }
    // });
}

// Function to logout user
async function logout() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Password visibility toggle function
function setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.closest('.relative').querySelector('input');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// Scroll to top button
function setupScrollToTop() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    
    if (scrollToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopButton.classList.add('visible');
            } else {
                scrollToTopButton.classList.remove('visible');
            }
        });
        
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// FAQ accordion
function setupFAQAccordion() {
    const faqButtons = document.querySelectorAll('.bg-gray-50 button');
    
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('i');
            
            if (content.classList.contains('hidden')) {
                // Opening animation
                content.classList.remove('hidden');
                content.classList.remove('animate-slideUp');
                content.classList.add('animate-slideDown');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                icon.classList.add('rotate-180');
            } else {
                // Closing animation
                content.classList.remove('animate-slideDown');
                content.classList.add('animate-slideUp');
                
                // After animation completes, hide the content
                setTimeout(() => {
                    if (content.classList.contains('animate-slideUp')) {
                        content.classList.add('hidden');
                        content.classList.remove('animate-slideUp');
                    }
                }, 300);
                
                icon.classList.remove('fa-chevron-up');
                icon.classList.remove('rotate-180');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Set active nav link based on scroll position
function setupActiveNav() {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Chat functionality
class SMSADDAChat {
    constructor() {
        this.currentUser = null;
        this.currentChatId = null;
        this.currentChatType = 'private'; // 'private' or 'group'
        this.database = null;
        this.auth = null;
    }
    
    // Initialize chat functionality
    init(firebaseAuth, firebaseDatabase) {
        this.auth = firebaseAuth;
        this.database = firebaseDatabase;
        
        // Set up authentication state listener
        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.initializeChat();
            } else {
                window.location.href = 'login.html';
            }
        });
    }
    
    // Initialize chat components
    initializeChat() {
        // Set up message listeners
        this.setupMessageListeners();
        
        // Set up contact click handlers
        this.setupContactHandlers();
        
        // Set up group functionality
        this.setupGroupFunctionality();
    }
    
    // Set up message listeners
    setupMessageListeners() {
        // In a real implementation, this would listen to Firebase RTDB for new messages
        // Example:
        // const messagesRef = this.database.ref('messages');
        // messagesRef.on('child_added', (snapshot) => {
        //     const message = snapshot.val();
        //     this.addMessageToUI(message);
        // });
    }
    
    // Set up contact click handlers
    setupContactHandlers() {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const contactId = item.getAttribute('data-contact-id');
                this.openChat(contactId, 'private');
            });
        });
    }
    
    // Set up group functionality
    setupGroupFunctionality() {
        const newGroupBtn = document.getElementById('newGroupBtn');
        const newGroupModal = document.getElementById('newGroupModal');
        const closeBtn = document.querySelector('.close');
        const createGroupBtn = document.getElementById('createGroupBtn');
        const groupNameInput = document.getElementById('groupName');
        const leaveGroupBtn = document.getElementById('leaveGroupBtn');
        
        if (newGroupBtn) {
            newGroupBtn.addEventListener('click', () => {
                if (newGroupModal) newGroupModal.style.display = 'block';
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (newGroupModal) newGroupModal.style.display = 'none';
            });
        }
        
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => {
                this.createGroup();
            });
        }
        
        if (leaveGroupBtn) {
            leaveGroupBtn.addEventListener('click', () => {
                this.leaveGroup();
            });
        }
        
        // Close modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (newGroupModal && event.target === newGroupModal) {
                newGroupModal.style.display = 'none';
            }
        });
    }
    
    // Open chat with a contact or group
    openChat(chatId, type) {
        this.currentChatId = chatId;
        this.currentChatType = type;
        
        // Update UI to show this is a group chat if needed
        const groupMembersElement = document.querySelector('.group-members');
        const leaveGroupBtn = document.getElementById('leaveGroupBtn');
        
        if (groupMembersElement && leaveGroupBtn) {
            if (type === 'group') {
                groupMembersElement.textContent = 'Group • 3 members';
                leaveGroupBtn.classList.remove('hidden');
            } else {
                groupMembersElement.textContent = 'Online - Last seen just now';
                leaveGroupBtn.classList.add('hidden');
            }
        }
        
        // Clear chat container and load messages
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.innerHTML = '';
            this.loadMessages(chatId, type);
        }
    }
    
    // Load messages for a chat
    loadMessages(chatId, type) {
        // In a real app, this would fetch messages from Firebase RTDB
        // For demo, we'll just show sample messages
        this.addMessageToUI('Hey there! How are you doing today?', 'received', false);
        this.addMessageToUI('I\'m doing great! Just working on some new features for our app.', 'sent', true);
        this.addMessageToUI('That sounds exciting! Can\'t wait to see what you\'ve been working on.', 'received', false);
    }
    
    // Create a new group
    createGroup() {
        const groupNameInput = document.getElementById('groupName');
        const groupName = groupNameInput ? groupNameInput.value.trim() : '';
        
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        // Get selected members
        const selectedMembers = [];
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        checkboxes.forEach(checkbox => {
            selectedMembers.push(checkbox.value);
        });
        
        if (selectedMembers.length < 1) {
            alert('Please select at least one member');
            return;
        }
        
        // In a real app, this would create a group in Firebase RTDB
        console.log('Creating group:', { groupName, selectedMembers });
        
        // Close modal and reset form
        const newGroupModal = document.getElementById('newGroupModal');
        if (newGroupModal) newGroupModal.style.display = 'none';
        
        if (groupNameInput) groupNameInput.value = '';
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Show success message
        alert('Group created successfully!');
    }
    
    // Leave current group
    leaveGroup() {
        if (this.currentChatType !== 'group') return;
        
        if (confirm('Are you sure you want to leave this group?')) {
            // In a real app, this would remove the user from the group in Firebase RTDB
            console.log('Leaving group:', this.currentChatId);
            alert('You have left the group');
            
            // Reset to default chat
            this.openChat('user1', 'private');
        }
    }
    
    // Send message
    sendMessage(message) {
        if (!message.trim() || !this.currentChatId) return;
        
        // In a real app, this would send the message to Firebase RTDB
        this.addMessageToUI(message, 'sent', true);
        
        // Simulate a reply after a short delay
        setTimeout(() => {
            this.addMessageToUI('Thanks for your message!', 'received', false);
        }, 1000);
    }
    
    // Handle image upload
    handleImageUpload(file) {
        if (!file) return;
        
        // Show upload progress
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        
        if (uploadProgress) uploadProgress.classList.remove('hidden');
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                if (uploadProgress) uploadProgress.classList.add('hidden');
                
                // In a real app, this would upload to imgbb and then send the image URL
                const imageUrl = 'https://via.placeholder.com/300x200.png?text=Uploaded+Image';
                this.addImageToUI(imageUrl, 'sent');
            }
        }, 200);
    }
    
    // Add message to UI
    addMessageToUI(message, type, isRead) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex mb-4 ${type === 'sent' ? 'justify-end' : ''}`;
        
        const currentTime = this.getCurrentTime();
        
        if (type === 'received') {
            messageDiv.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff" alt="John Doe" class="w-8 h-8 rounded-full">
                <div class="message received p-4 ml-2">
                    <p>${this.escapeHtml(message)}</p>
                    <div class="text-xs text-gray-500 mt-1">${currentTime}</div>
                </div>
            `;
        } else {
            const readReceipt = isRead ? 
                '<span class="read-receipts read"><i class="fas fa-check-double"></i></span>' : 
                '<span class="read-receipts"><i class="fas fa-check"></i></span>';
                
            messageDiv.innerHTML = `
                <div class="message sent p-4">
                    <p>${this.escapeHtml(message)}</p>
                    <div class="text-xs text-indigo-200 mt-1 text-right">
                        ${currentTime}
                        ${readReceipt}
                    </div>
                </div>
            `;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Add image to UI
    addImageToUI(imageUrl, type) {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex mb-4 ${type === 'sent' ? 'justify-end' : ''}`;
        
        const currentTime = this.getCurrentTime();
        
        if (type === 'received') {
            messageDiv.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff" alt="John Doe" class="w-8 h-8 rounded-full">
                <div class="message received p-4 ml-2">
                    <img src="${this.escapeHtml(imageUrl)}" alt="Uploaded image" class="message-image">
                    <div class="text-xs text-gray-500 mt-1">${currentTime}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message sent p-4">
                    <img src="${this.escapeHtml(imageUrl)}" alt="Uploaded image" class="message-image">
                    <div class="text-xs text-indigo-200 mt-1 text-right">
                        ${currentTime}
                        <span class="read-receipts read"><i class="fas fa-check-double"></i></span>
                    </div>
                </div>
            `;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Get current time in HH:MM format
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();
    setupMobileMenu();
    setupScrollToTop();
    setupFAQAccordion();
    setupSmoothScrolling();
    setupActiveNav();
    
    // Add any other common initialization code here
});

// Export functions for use in other modules
window.SMSADDA = {
    showError,
    hideError,
    setLoading,
    isValidEmail,
    checkAuthState,
    logout,
    Chat: SMSADDAChat
};

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBi5rDUx6VT0RWAzv1jXCZWev1ieZGprO8",
  authDomain: "personal-e6bf8.firebaseapp.com",
  databaseURL: "https://personal-e6bf8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "personal-e6bf8",
  storageBucket: "personal-e6bf8.firebasestorage.app",
  messagingSenderId: "123893852054",
  appId: "1:123893852054:web:80fdd5176c251450645fb7"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const IMGBB_API_KEY = "fdeb5290f70387fcaabd7fb9fbe6d6ca";

let currentUser = null, currentDisplayName = null, currentUsername = null, currentChatType = 'group', currentChatId = null, replyToId = null, reactionMessageId = null;
const settings = JSON.parse(localStorage.getItem('chatSettings')) || { soundNotifications: true, autoScroll: true };
let userCache = {};
let groupStartTime = 0;
let privateStartTime = 0;

const sendSound = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1151-definite.mp3');
const receiveSound = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1148-sms-alert-5.mp3');

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const verificationScreen = document.getElementById('verificationScreen');
const appContainer = document.getElementById('appContainer');
const groupChatPage = document.getElementById('groupChatPage');
const privateChatPage = document.getElementById('privateChatPage');
const settingsPage = document.getElementById('settingsPage');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const passwordToggle = document.getElementById('passwordToggle');
const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const googleBtn = document.getElementById('googleBtn');
const authMessage = document.getElementById('authMessage');
const resendBtn = document.getElementById('resendBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const verificationMessage = document.getElementById('verificationMessage');
const groupMessageInput = document.getElementById('groupMessageInput');
const groupSendBtn = document.getElementById('groupSendBtn');
const groupFileInput = document.getElementById('groupFileInput');
const groupReplyPreview = document.getElementById('groupReplyPreview');
const groupReplyText = document.getElementById('groupReplyText');
const groupCancelReply = document.getElementById('groupCancelReply');
const groupPinnedMessages = document.getElementById('groupPinnedMessages');
const privateMessageInput = document.getElementById('privateMessageInput');
const privateSendBtn = document.getElementById('privateSendBtn');
const privateFileInput = document.getElementById('privateFileInput');
const privateReplyPreview = document.getElementById('privateReplyPreview');
const privateReplyText = document.getElementById('privateReplyText');
const privateCancelReply = document.getElementById('privateCancelReply');
const privatePinnedMessages = document.getElementById('privatePinnedMessages');
const privateChatList = document.getElementById('privateChatList');
const privateChatMessages = document.getElementById('privateChatMessages');
const privateMessageInputContainer = document.getElementById('privateMessageInputContainer');
const backToPrivateList = document.getElementById('backToPrivateList');
const privateChatTitle = document.getElementById('privateChatTitle');
const privateOnlineStatus = document.getElementById('privateOnlineStatus');
const privateProfileImg = document.getElementById('privateProfileImg');
const navGroupChat = document.getElementById('navGroupChat');
const navPrivateChat = document.getElementById('navPrivateChat');
const navSettings = document.getElementById('navSettings');
const showUsersBtn = document.getElementById('showUsersBtn');
const soundToggle = document.getElementById('soundToggle');
const autoScrollToggle = document.getElementById('autoScrollToggle');
const newNameInput = document.getElementById('newNameInput');
const bioInput = document.getElementById('bioInput');
const profileImgInput = document.getElementById('profileImgInput');
const profileImg = document.getElementById('profileImg');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const reactionModal = document.getElementById('reactionModal');
const closeReactionModal = document.getElementById('closeReactionModal');
const groupSettingsModal = document.getElementById('groupSettingsModal');
const groupNameInput = document.getElementById('groupNameInput');
const groupDescInput = document.getElementById('groupDescInput');
const saveGroupBtn = document.getElementById('saveGroupBtn');
const deleteChatBtn = document.getElementById('deleteChatBtn');
const exportChatBtn = document.getElementById('exportChatBtn');
const closeGroupSettingsBtn = document.getElementById('closeGroupSettingsBtn');
const privateChatSettingsBtn = document.getElementById('privateChatSettingsBtn');
const privateChatSettingsMenu = document.getElementById('privateChatSettingsMenu');
const viewPrivateProfileBtn = document.getElementById('viewPrivateProfileBtn');
const deletePrivateChatBtn = document.getElementById('deletePrivateChatBtn');
const groupScrollDownBtn = document.getElementById('groupScrollDownBtn');
const privateScrollDownBtn = document.getElementById('privateScrollDownBtn');

let isSignUp = true;

// Utility Functions
function sanitizeUsername(username) {
  return username.replace(/[.#$[\]]/g, '_').toLowerCase();
}

function showAuthMessage(message, isError) {
  authMessage.textContent = message;
  authMessage.className = `text-center text-xs mt-4 p-3 rounded-lg ${isError ? 'bg-[#E1306C] text-white' : 'bg-[#C13584] text-white'}`;
  authMessage.classList.remove('hidden');
  setTimeout(() => authMessage.classList.add('hidden'), 5000);
}

function showVerificationMessage(message, isError) {
  verificationMessage.textContent = message;
  verificationMessage.className = `text-center text-xs mt-4 p-3 rounded-lg ${isError ? 'bg-[#E1306C] text-white' : 'bg-[#C13584] text-white'}`;
  verificationMessage.classList.remove('hidden');
  setTimeout(() => verificationMessage.classList.add('hidden'), isError ? 5000 : 8000);
}

function showTemporarySuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showTemporaryError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getCurrentPath() {
  return currentChatType === 'private' ? `privateChats/${currentChatId}/messages` : 'messages';
}

// Authentication Functions
async function handleAuth() {
  console.log('handleAuth called, isSignUp:', isSignUp);
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email.includes('@') || !email.includes('.')) {
    showAuthMessage('Please enter a valid email address', true);
    return;
  }
  if (password.length < 6) {
    showAuthMessage('Password must be at least 6 characters', true);
    return;
  }
  authBtn.disabled = true;
  try {
    if (isSignUp) {
      const name = usernameInput.value.trim();
      if (!name) {
        showAuthMessage('Please enter your name', true);
        authBtn.disabled = false;
        return;
      }
      console.log('Creating user with email:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created:', user.uid);
      await updateProfile(user, { displayName: name });
      await set(ref(db, `usernames/${sanitizeUsername(email.split('@')[0])}`), {
        uid: user.uid,
        email,
        displayName: name,
        profileImg: 'https://via.placeholder.com/64',
        bio: ''
      });
      await sendEmailVerification(user);
      showVerificationScreen(email);
    } else {
      console.log('Signing in with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful');
    }
  } catch (error) {
    let message = 'Unknown error occurred.';
    if (error.code) {
      const errorMessages = {
        'auth/email-already-in-use': 'Email is already registered',
        'auth/invalid-email': 'Invalid email format',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many attempts, please try again later',
        'auth/network-request-failed': 'Network error, please check your connection'
      };
      message = errorMessages[error.code] || error.message;
    } else if (error.message) {
      message = error.message;
    }
    showAuthMessage(message, true);
    authBtn.disabled = false;
  }
  authBtn.disabled = false;
}

async function signInWithGoogle() {
  console.log('signInWithGoogle called');
  googleBtn.disabled = true;
  try {
    const provider = new GoogleAuthProvider();
    console.log('Attempting Google sign-in');
    const { user } = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', user.uid);
    const username = sanitizeUsername(user.email.split('@')[0]);
    const userSnap = await get(ref(db, `usernames/${username}`));
    if (!userSnap.exists()) {
      await set(ref(db, `usernames/${username}`), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        profileImg: user.photoURL || 'https://via.placeholder.com/64',
        bio: ''
      });
      console.log('New user profile created for:', username);
    }
    showAuthMessage('Signed in with Google', false);
  } catch (error) {
    let message = 'Unknown error occurred.';
    if (error.code) {
      const errorMessages = {
        'auth/popup-closed-by-user': 'Google sign-in cancelled',
        'auth/network-request-failed': 'Network error, please check your connection'
      };
      message = errorMessages[error.code] || error.message;
    } else if (error.message) {
      message = error.message;
    }
    showAuthMessage(message, true);
  }
  googleBtn.disabled = false;
}

async function resendVerification() {
  console.log('resendVerification called');
  if (!auth.currentUser) {
    showVerificationMessage('Please sign in first', true);
    return;
  }
  resendBtn.disabled = true;
  try {
    console.log('Resending verification email to:', auth.currentUser.email);
    await sendEmailVerification(auth.currentUser);
    showVerificationMessage('Verification email sent', false);
  } catch (error) {
    console.error('Resend verification error:', error.code, error.message);
    showVerificationMessage(error.message, true);
  } finally {
    resendBtn.disabled = false;
  }
}

async function backToLogin() {
  console.log('backToLogin called');
  verificationScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  usernameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
  authMessage.classList.add('hidden');
  verificationMessage.classList.add('hidden');
  if (auth.currentUser) {
    await signOut(auth);
    console.log('User signed out');
  }
}

function showVerificationScreen(email) {
  console.log('showVerificationScreen called for:', email);
  homeScreen.classList.add('hidden');
  verificationScreen.classList.remove('hidden');
  appContainer.classList.add('hidden');
  showVerificationMessage(`Verification email sent to ${email}. Please check your inbox and spam folder.`, false);
}

function showHomeScreen() {
  authBtn.disabled = false;
  googleBtn.disabled = false;
  resendBtn.disabled = false;
  backToLoginBtn.disabled = false;
  console.log('showHomeScreen called');
  homeScreen.classList.remove('hidden');
  verificationScreen.classList.add('hidden');
  appContainer.classList.add('hidden');
  const nameWrapper = document.getElementById('nameWrapper');
  if (isSignUp) {
    nameWrapper.classList.remove('hidden');
    authBtn.innerHTML = `<i class="fas fa-rocket mr-2"></i>Create Account`;
    toggleAuth.textContent = 'Already have an account? Sign In';
  } else {
    nameWrapper.classList.add('hidden');
    authBtn.innerHTML = `<i class="fas fa-rocket mr-2"></i>Sign In`;
    toggleAuth.textContent = "Don't have an account? Sign Up";
  }
  authMessage.classList.add('hidden');
}

function showAppContainer() {
  console.log('showAppContainer called');
  homeScreen.classList.add('hidden');
  verificationScreen.classList.add('hidden');
  appContainer.classList.remove('hidden');
  switchPage('group');
}

// Navigation
function switchPage(page) {
  console.log('switchPage called:', page);
  groupChatPage.classList.add('hidden');
  privateChatPage.classList.add('hidden');
  settingsPage.classList.add('hidden');
  navGroupChat.classList.remove('active');
  navPrivateChat.classList.remove('active');
  navSettings.classList.remove('active');

  if (page === 'group') {
    groupChatPage.classList.remove('hidden');
    navGroupChat.classList.add('active');
    currentChatType = 'group';
    currentChatId = null;
    groupStartTime = Date.now();
    loadMessages('messages', groupChatMessages);
    updatePinnedMessages('messages', groupPinnedMessages);
    markAllAsRead('messages');
    const groupMessagesRef = ref(db, 'messages');
    onChildAdded(groupMessagesRef, (snap) => {
      const msg = snap.val();
      if (msg.timestamp > groupStartTime && msg.uid !== currentUser.uid && settings.soundNotifications) {
        receiveSound.play();
      }
    });
    // Ensure we scroll to the latest message when switching to group chat
    setTimeout(() => scrollToLatest(groupChatMessages), 100);
  } else if (page === 'private') {
    privateChatPage.classList.remove('hidden');
    navPrivateChat.classList.add('active');
    showPrivateChatList();
  } else if (page === 'settings') {
    settingsPage.classList.remove('hidden');
    navSettings.classList.add('active');
    loadProfile();
  }
}

// Profile Management
async function loadProfile() {
  console.log('loadProfile called for:', currentUsername);
  try {
    const userSnap = await get(ref(db, `usernames/${currentUsername}`));
    const userData = userSnap.val();
    if (userData) {
      newNameInput.value = userData.displayName || '';
      bioInput.value = userData.bio || '';
      profileImg.src = userData.profileImg || 'https://via.placeholder.com/64';
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    showTemporaryError('Failed to load profile');
  }
}

async function handleProfileImgUpload(event) {
  console.log('handleProfileImgUpload called');
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 32 * 1024 * 1024) {
    showTemporaryError('Profile image size exceeds 32MB limit');
    return;
  }
  if (!file.type.startsWith('image/')) {
    showTemporaryError('Please select an image file');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  try {
    showTemporarySuccess('Uploading profile image...');
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error.message || 'Profile image upload failed');
    profileImg.src = data.data.url;
    await saveProfile();
    showTemporarySuccess('Profile image uploaded and saved');
  } catch (error) {
    console.error('Profile image upload error:', error);
    showTemporaryError(error.message || 'Failed to upload profile image');
    profileImg.src = 'https://via.placeholder.com/64';
  } finally {
    event.target.value = '';
  }
}

async function saveProfile() {
  console.log('saveProfile called');
  const newName = newNameInput.value.trim();
  const bio = bioInput.value.trim();
  if (!newName) {
    showTemporaryError('Name cannot be empty');
    return;
  }
  try {
    await updateProfile(auth.currentUser, { displayName: newName });
    await update(ref(db, `usernames/${currentUsername}`), {
      displayName: newName,
      profileImg: profileImg.src,
      bio: bio.slice(0, 150)
    });
    currentDisplayName = newName;
    showTemporarySuccess('Profile updated');
  } catch (error) {
    console.error('Failed to save profile:', error);
    showTemporaryError('Failed to update profile');
  }
}

// Chat Functions
function showPrivateChatList() {
  console.log('showPrivateChatList called');
  privateChatList.classList.remove('hidden');
  privateChatMessages.classList.add('hidden');
  privateMessageInputContainer.classList.add('hidden');
  privateChatTitle.textContent = 'Private Chats';
  privateOnlineStatus.textContent = '';
  privateProfileImg.classList.add('hidden');
  loadPrivateChatList();
}

async function loadPrivateChatList() {
  console.log('loadPrivateChatList called');
  privateChatList.innerHTML = '';
  try {
    const userSnap = await get(ref(db, 'usernames'));
    const activeSnap = await get(ref(db, 'activeUsers'));
    const users = userSnap.val() || {};
    const activeUsers = activeSnap.val() || {};

    for (const [username, userData] of Object.entries(users)) {
      if (userData.uid !== currentUser.uid) {
        const isOnline = activeUsers[userData.uid]?.status === 'online';
        const chatItem = document.createElement('div');
        chatItem.className = 'private-chat-list-item flex items-center gap-3 bg-[#FAFAFA] rounded-lg p-3 cursor-pointer hover:bg-[#EFEFEF] shadow-sm';
        chatItem.innerHTML = `
          <img src="${escapeHtml(userData.profileImg || 'https://via.placeholder.com/40')}" alt="Profile" class="profile-img">
          <div class="user-info">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-[#262626]">${escapeHtml(userData.displayName)}</h3>
              <span class="status-dot ${isOnline ? 'status-online' : 'status-offline'}"></span>
            </div>
            <p class="text-xs text-[#8E8E8E]">@${escapeHtml(username)}</p>
            <p class="text-xs text-[#8E8E8E] line-clamp-1">${escapeHtml(userData.bio || '')}</p>
          </div>
        `;
        chatItem.addEventListener('click', () => startPrivateChat(userData.uid, userData.displayName, null, userData.profileImg, isOnline ? 'Online' : 'Offline'));
        privateChatList.appendChild(chatItem);
      }
    }
  } catch (error) {
    console.error('Failed to load user list:', error);
    showTemporaryError('Failed to load user list');
  }
}

async function startPrivateChat(otherUserId, otherUserName, chatId, profileSrc, status) {
  console.log('startPrivateChat called with:', otherUserName);
  currentChatType = 'private';
  currentChatId = chatId || [currentUser.uid, otherUserId].sort().join('_');
  privateChatList.classList.add('hidden');
  privateChatMessages.classList.remove('hidden');
  privateMessageInputContainer.classList.remove('hidden');
  privateChatTitle.textContent = otherUserName;
  privateProfileImg.src = profileSrc || 'https://via.placeholder.com/40';
  privateProfileImg.classList.remove('hidden');
  privateOnlineStatus.textContent = status;
  privateStartTime = Date.now();
  try {
    await set(ref(db, `privateChats/${currentChatId}/users`), { [currentUser.uid]: true, [otherUserId]: true });
    loadMessages(`privateChats/${currentChatId}/messages`, privateChatMessages);
    updatePinnedMessages(`privateChats/${currentChatId}/messages`, privatePinnedMessages);
    markAllAsRead(`privateChats/${currentChatId}/messages`);
    const privateMessagesRef = ref(db, `privateChats/${currentChatId}/messages`);
    onChildAdded(privateMessagesRef, (snap) => {
      const msg = snap.val();
      if (msg.timestamp > privateStartTime && msg.uid !== currentUser.uid && settings.soundNotifications) {
        receiveSound.play();
      }
    });
    // Ensure we scroll to the latest message when starting private chat
    setTimeout(() => scrollToLatest(privateChatMessages), 100);
  } catch (error) {
    console.error('Failed to start private chat:', error);
    showTemporaryError('Failed to start private chat');
  }
}

function handleScrollIcon(container, btn) {
  function checkScrollIcon() {
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    btn.classList.toggle('hidden', atBottom);
  }
  container.addEventListener('scroll', checkScrollIcon);
  btn.addEventListener('click', () => {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    btn.classList.add('hidden');
  });
  // Initial check after messages load
  setTimeout(checkScrollIcon, 500);
}

function scrollToLatest(container) {
  // Use the same clean scrolling approach as handleScrollIcon
  container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
}

async function loadMessages(path, container) {
  console.log('loadMessages called for path:', path);
  onValue(ref(db, path), (snapshot) => {
    container.innerHTML = '';
    const data = snapshot.val() || {};
    const messages = Object.entries(data)
      .map(([key, value]) => ({ id: key, ...value }))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    // Create a document fragment to batch add all messages
    const fragment = document.createDocumentFragment();
    messages.forEach(msg => {
      const messageDiv = createMessageElement(msg);
      fragment.appendChild(messageDiv);
    });
    
    // Add all messages at once
    container.appendChild(fragment);
    
    // Use the same scrolling logic as handleScrollIcon function
    // Scroll to bottom immediately
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
    
    // Also trigger the scroll icon check after a short delay
    setTimeout(() => {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
      // Get the appropriate scroll button based on container
      let scrollBtn;
      if (container.id === 'groupChatMessages') {
        scrollBtn = groupScrollDownBtn;
      } else if (container.id === 'privateChatMessages') {
        scrollBtn = privateScrollDownBtn;
      }
      if (scrollBtn) {
        scrollBtn.classList.toggle('hidden', atBottom);
      }
    }, 100);
  }, (error) => {
    console.error('Failed to load messages:', error);
    showTemporaryError('Failed to load messages');
  });
}

// Extract message creation to a separate function
function createMessageElement(msg) {
  const messageDiv = document.createElement('div');
  const isCurrentUser = msg.uid === currentUser.uid;
  messageDiv.className = 'message-appear mb-3';
  messageDiv.dataset.id = msg.id;
  let content = msg.deleted ? '<div class="text-[#8E8E8E] italic text-sm">This message was deleted</div>' : '';
  if (!msg.deleted) {
    if (msg.replyTo) {
      content += `<div class="bg-[#EFEFEF] border-l-4 border-[#C13584] p-2 mb-2 rounded text-xs" id="quoted-${msg.id}"></div>`;
    }
    if (msg.type === 'image') {
      content += `<a href="${escapeHtml(msg.url)}" target="_blank" download class="image-link"><img src="${escapeHtml(msg.url)}" alt="Shared Image" loading="lazy" class="file-message" onerror="this.src='https://via.placeholder.com/150?text=Image+Failed'"></a>`;
    } else {
      content += `<div class="leading-relaxed">${escapeHtml(msg.text)}</div>`;
    }
  }
  let senderHtml = '';
  if (!isCurrentUser) {
    const userData = userCache[msg.username] || {};
    const profileSrc = escapeHtml(userData.profileImg || 'https://via.placeholder.com/40');
    senderHtml = `<div class="flex items-center gap-2 mb-1"><img src="${profileSrc}" alt="Profile" class="w-6 h-6 rounded-full"><div class="text-xs font-semibold text-[#C13584]">${escapeHtml(msg.user)}</div></div>`;
  }
  let timeHtml = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isCurrentUser) {
    const readBy = msg.readBy || {};
    const readCount = Object.keys(readBy).length;
    let totalOther = currentChatType === 'private' ? 1 : Object.values(userCache).filter(u => u.uid !== currentUser.uid).length;
    timeHtml += readCount >= totalOther ? '<span class="ml-1 text-[#C13584]"><i class="fas fa-check-double"></i></span>' : '<span class="ml-1 text-[#8E8E8E]"><i class="fas fa-check"></i></span>';
  }
  messageDiv.innerHTML = `
    <div class="message-bubble ${isCurrentUser ? 'sent' : 'received'} ${msg.deleted ? 'deleted' : ''}">
      ${senderHtml}
      <div class="message-content">${content}</div>
      <div class="text-xs ${isCurrentUser ? 'text-white/70' : 'text-[#8E8E8E]'} mt-1 flex items-center justify-end gap-1">
        ${timeHtml}
      </div>
    </div>
  `;
  // Always render actions first, then reactions (fixes icon disappearance bug)
  const actionsDiv = document.createElement('div');
  actionsDiv.className = `message-actions ${isCurrentUser ? 'sent' : 'received'}`;
  actionsDiv.innerHTML = `
    <i class="fas fa-reply action-icon" onclick="replyToMessage('${msg.id}', '${escapeHtml(msg.text || '[Image]')}')"></i>
    <i class="fas fa-smile action-icon" onclick="openReactionModal('${msg.id}')"></i>
    <i class="fas fa-thumbtack action-icon" onclick="pinMessage('${msg.id}')"></i>
    ${isCurrentUser && !msg.deleted ? `<i class="fas fa-trash action-icon" onclick="deleteMessage('${msg.id}')"></i>` : ''}
  `;
  messageDiv.appendChild(actionsDiv);
  // Always render reactions after actions
  if (msg.reactions) {
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = `flex gap-2 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'} flex-wrap`;
    reactionsDiv.innerHTML = Object.entries(Object.entries(msg.reactions).reduce((acc, [userId, reaction]) => { acc[reaction] = (acc[reaction] || 0) + 1; return acc; }, {})).map(([reaction, count]) => `<span class="reaction-count cursor-pointer" onclick="openReactionModal('${msg.id}')">${reaction} ${count}</span>`).join('');
    messageDiv.appendChild(reactionsDiv);
  }
  if (msg.replyTo && !msg.deleted) addQuotedMessage(msg.replyTo, msg.id);
  return messageDiv;
}

// Simplified addMessage function that just calls createMessageElement
function addMessage(msg, container) {
  const messageDiv = createMessageElement(msg);
  container.appendChild(messageDiv);
  
  // Scroll to bottom if user is at bottom or if this is a new message from current user
  // This ensures new messages are visible without interrupting user's reading position
  const isCurrentUser = msg.uid === currentUser.uid;
  if (isCurrentUser || isUserAtBottom(container)) {
    // Use the same clean scrolling approach
    container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
  }
}

async function addQuotedMessage(replyToId, currentId) {
  try {
    const snap = await get(ref(db, `${getCurrentPath()}/${replyToId}`));
    const repliedMsg = snap.val();
    if (repliedMsg && !repliedMsg.deleted) {
      const quoteDiv = document.getElementById(`quoted-${currentId}`);
      if (quoteDiv) {
        const text = repliedMsg.type === 'image' ? '[Image]' : repliedMsg.text.substring(0, 50) + (repliedMsg.text.length > 50 ? '...' : '');
        quoteDiv.innerHTML = `<strong>${escapeHtml(repliedMsg.user)}</strong>: ${escapeHtml(text)}`;
      }
    }
  } catch (error) {
    console.error('Error loading quoted message:', error);
  }
}

window.replyToMessage = function(id, text) {
  console.log('replyToMessage called:', id);
  replyToId = id;
  const replyTextElem = currentChatType === 'group' ? groupReplyText : privateReplyText;
  const replyPreview = currentChatType === 'group' ? groupReplyPreview : privateReplyPreview;
  replyTextElem.textContent = text.length > 50 ? text.substring(0, 50) + '...' : text;
  replyPreview.classList.remove('hidden');
  const input = currentChatType === 'group' ? groupMessageInput : privateMessageInput;
  input.focus();
}

window.openReactionModal = function(id) {
  console.log('openReactionModal called:', id);
  reactionMessageId = id;
  reactionModal.classList.remove('hidden');
}

window.pinMessage = function(id) {
  console.log('pinMessage called:', id);
  const pinPath = currentChatType === 'private' ? `privateChats/${currentChatId}/pinnedMessages` : 'pinnedMessages';
  get(ref(db, pinPath)).then(snapshot => {
    const pinned = snapshot.val() || {};
    if (Object.keys(pinned).length >= 3) {
      showTemporaryError('Maximum 3 pinned messages allowed');
      return;
    }
    set(ref(db, `${pinPath}/${id}`), true)
      .then(() => showTemporarySuccess('Message pinned'))
      .catch(error => {
        console.error('Failed to pin message:', error);
        showTemporaryError('Failed to pin message');
      });
  });
}

window.deleteMessage = function(id) {
  console.log('deleteMessage called:', id);
  if (confirm('Delete this message?')) {
    update(ref(db, `${getCurrentPath()}/${id}`), { deleted: true })
      .then(() => showTemporarySuccess('Message deleted'))
      .catch(error => {
        console.error('Failed to delete message:', error);
        showTemporaryError('Failed to delete message');
      });
  }
}

function updatePinnedMessages(path, container) {
  console.log('updatePinnedMessages called for path:', path);
  const pinPath = currentChatType === 'private' ? `privateChats/${currentChatId}/pinnedMessages` : 'pinnedMessages';
  onValue(ref(db, pinPath), (snapshot) => {
    container.innerHTML = '';
    container.classList.add('hidden');
    const pinned = snapshot.val() || {};
    if (Object.keys(pinned).length === 0) return;
    container.classList.remove('hidden');
    Object.keys(pinned).forEach(async (msgId) => {
      const snap = await get(ref(db, `${path}/${msgId}`));
      const msg = snap.val();
      if (msg && !msg.deleted) {
        const pinDiv = document.createElement('div');
        pinDiv.className = 'pinned-message bg-[#EFEFEF] rounded-lg p-2 mb-2 text-sm cursor-pointer';
        pinDiv.innerHTML = `<div class="flex items-center justify-between"><span><strong>${escapeHtml(msg.user)}</strong>: ${escapeHtml(msg.text || '[Image]')}</span><button onclick="unpinMessage('${msgId}')"><i class="fas fa-thumbtack text-[#E1306C] hover:text-[#C13584]"></i></button></div>`;
        pinDiv.addEventListener('click', () => document.querySelector(`[data-id="${msgId}"]`)?.scrollIntoView({ behavior: 'smooth' }));
        container.appendChild(pinDiv);
      }
    });
  }, (error) => {
    console.error('Failed to update pinned messages:', error);
    showTemporaryError('Failed to load pinned messages');
  });
}

window.unpinMessage = function(id) {
  console.log('unpinMessage called:', id);
  const pinPath = currentChatType === 'private' ? `privateChats/${currentChatId}/pinnedMessages` : 'pinnedMessages';
  remove(ref(db, `${pinPath}/${id}`))
    .then(() => showTemporarySuccess('Message unpinned'))
    .catch(error => {
      console.error('Failed to unpin message:', error);
      showTemporaryError('Failed to unpin message');
    });
}

async function markAllAsRead(path) {
  console.log('markAllAsRead called for path:', path);
  try {
    const snap = await get(ref(db, path));
    const updates = {};
    snap.forEach(child => {
      const msg = child.val();
      const id = child.key;
      if (msg.uid !== currentUser.uid && !msg.readBy?.[currentUser.uid]) {
        updates[`${id}/readBy/${currentUser.uid}`] = serverTimestamp();
      }
    });
    if (Object.keys(updates).length > 0) await update(ref(db, path), updates);
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
}

async function sendMessage(type) {
  console.log('sendMessage called, type:', type);
  const input = type === 'group' ? groupMessageInput : privateMessageInput;
  const text = input.value.trim();
  if (!text) return;
  const messageData = {
    uid: currentUser.uid,
    user: currentDisplayName,
    username: currentUsername,
    text,
    timestamp: Date.now(),
    type: 'text',
    replyTo: replyToId || null,
    readBy: {}
  };
  try {
    const path = type === 'private' ? `privateChats/${currentChatId}/messages` : 'messages';
    await push(ref(db, path), messageData);
    input.value = '';
    replyToId = null;
    if (type === 'group') groupReplyPreview.classList.add('hidden');
    else privateReplyPreview.classList.add('hidden');
    if (settings.soundNotifications) sendSound.play();
  } catch (error) {
    console.error('Failed to send message:', error);
    showTemporaryError('Failed to send message');
  }
}

async function handleFileUpload(event, type) {
  console.log('handleFileUpload called, type:', type);
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 32 * 1024 * 1024) {
    showTemporaryError('File size exceeds 32MB limit');
    return;
  }
  if (!file.type.startsWith('image/')) {
    showTemporaryError('Please select an image file');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  try {
    showTemporarySuccess('Uploading image...');
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error.message || 'Image upload failed');
    const messageData = {
      uid: currentUser.uid,
      user: currentDisplayName,
      username: currentUsername,
      url: data.data.url,
      timestamp: Date.now(),
      type: 'image',
      replyTo: replyToId || null,
      readBy: {}
    };
    const path = type === 'private' ? `privateChats/${currentChatId}/messages` : 'messages';
    await push(ref(db, path), messageData);
    replyToId = null;
    if (type === 'group') groupReplyPreview.classList.add('hidden');
    else privateReplyPreview.classList.add('hidden');
    showTemporarySuccess('Image uploaded successfully');
    if (settings.soundNotifications) sendSound.play();
  } catch (error) {
    console.error('Image upload error:', error);
    showTemporaryError(error.message || 'Failed to upload image');
  } finally {
    event.target.value = '';
  }
}

function exportChat() {
  console.log('exportChat called');
  get(ref(db, 'messages')).then(snap => {
    let content = '';
    const msgs = Object.entries(snap.val() || {}).sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (const [id, msg] of msgs) {
      content += `[${new Date(msg.timestamp).toLocaleString()}] ${msg.user}: ${msg.text || '[Image: ' + msg.url + ']'}\n`;
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group_chat_export.txt';
    a.click();
    URL.revokeObjectURL(url);
    showTemporarySuccess('Chat exported successfully');
  }).catch(error => {
    console.error('Failed to export chat:', error);
    showTemporaryError('Failed to export chat');
  });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login/Signup logic
  const authForm = document.getElementById('authForm');
  const authBtnText = document.getElementById('authBtnText');
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAuth();
  });
  toggleAuth.addEventListener('click', () => {
    isSignUp = !isSignUp;
    const nameWrapper = document.getElementById('nameWrapper');
    if (isSignUp) {
      nameWrapper.classList.remove('hidden');
      authBtnText.textContent = 'Create Account';
      toggleAuth.textContent = 'Already have an account? Sign In';
    } else {
      nameWrapper.classList.add('hidden');
      authBtnText.textContent = 'Sign In';
      toggleAuth.textContent = "Don't have an account? Sign Up";
    }
    authMessage.classList.add('hidden');
  });
  googleBtn.addEventListener('click', signInWithGoogle);
  passwordToggle.addEventListener('click', () => {
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordToggle.className = `fas fa-${passwordInput.type === 'password' ? 'eye' : 'eye-slash'} absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8E8E8E] cursor-pointer hover:text-[#C13584] p-2`;
  });
  resendBtn.addEventListener('click', resendVerification);
  backToLoginBtn.addEventListener('click', backToLogin);

  // Main App Buttons
  groupSendBtn.addEventListener('click', () => sendMessage('group'));
  privateSendBtn.addEventListener('click', () => sendMessage('private'));
  groupMessageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage('group');
    }
  });
  privateMessageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage('private');
    }
  });
  groupFileInput.addEventListener('change', (e) => handleFileUpload(e, 'group'));
  privateFileInput.addEventListener('change', (e) => handleFileUpload(e, 'private'));
  profileImgInput.addEventListener('change', handleProfileImgUpload);
  backToPrivateList.addEventListener('click', showPrivateChatList);
  navGroupChat.addEventListener('click', () => switchPage('group'));
  navPrivateChat.addEventListener('click', () => switchPage('private'));
  navSettings.addEventListener('click', () => switchPage('settings'));
  showUsersBtn.addEventListener('click', () => {
    console.log('showUsersBtn called');
    groupSettingsModal.classList.remove('hidden');
    get(ref(db, 'groupInfo')).then(snap => {
      const info = snap.val() || { name: 'Sungabha Group Chat', description: '' };
      groupNameInput.value = info.name;
      groupDescInput.value = info.description;
    }).catch(error => {
      console.error('Failed to load group info:', error);
      showTemporaryError('Failed to load group info');
    });
  });
  saveGroupBtn.addEventListener('click', () => {
    console.log('saveGroupBtn called');
    const name = groupNameInput.value.trim();
    const desc = groupDescInput.value.trim();
    if (!name) {
      showTemporaryError('Group name cannot be empty');
      return;
    }
    set(ref(db, 'groupInfo'), { name, description: desc.slice(0, 200) })
      .then(() => {
        showTemporarySuccess('Group updated');
        document.getElementById('groupChatTitle').textContent = name;
        groupSettingsModal.classList.add('hidden');
        // Force refresh group info in UI
        setTimeout(() => {
          get(ref(db, 'groupInfo')).then(snap => {
            const info = snap.val();
            if (info) {
              document.getElementById('groupChatTitle').textContent = info.name || name;
            }
          });
        }, 500);
      })
      .catch(error => {
        console.error('Failed to save group info:', error);
        showTemporaryError('Failed to update group');
      });
  });
  deleteChatBtn.addEventListener('click', () => {
    console.log('deleteChatBtn called');
    if (confirm('Delete all messages in group chat?')) {
      remove(ref(db, 'messages'))
        .then(() => {
          showTemporarySuccess('Group chat deleted');
          groupSettingsModal.classList.add('hidden');
        })
        .catch(error => {
          console.error('Failed to delete group chat:', error);
          showTemporaryError('Failed to delete group chat');
        });
    }
  });
  exportChatBtn.addEventListener('click', exportChat);
  closeGroupSettingsBtn.addEventListener('click', () => {
    console.log('closeGroupSettingsBtn called');
    groupSettingsModal.classList.add('hidden');
  });
  soundToggle.addEventListener('change', () => {
    console.log('soundToggle changed:', soundToggle.checked);
    settings.soundNotifications = soundToggle.checked;
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  });
  autoScrollToggle.addEventListener('change', () => {
    console.log('autoScrollToggle changed:', autoScrollToggle.checked);
    settings.autoScroll = autoScrollToggle.checked;
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  });
  saveProfileBtn.addEventListener('click', saveProfile);
  logoutBtn.addEventListener('click', () => {
    console.log('logoutBtn called');
    signOut(auth)
      .then(() => showHomeScreen())
      .catch(error => {
        console.error('Logout error:', error);
        showTemporaryError('Failed to logout');
      });
  });
  closeReactionModal.addEventListener('click', () => {
    console.log('closeReactionModal called');
    reactionModal.classList.add('hidden');
  });
  
  // Add event listeners for cancel reply buttons
  groupCancelReply.addEventListener('click', () => {
    console.log('groupCancelReply called');
    replyToId = null;
    groupReplyPreview.classList.add('hidden');
  });
  
  privateCancelReply.addEventListener('click', () => {
    console.log('privateCancelReply called');
    replyToId = null;
    privateReplyPreview.classList.add('hidden');
  });

  // Private Chat Settings Menu Logic
  if (privateChatSettingsBtn && privateChatSettingsMenu) {
    privateChatSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      privateChatSettingsMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!privateChatSettingsMenu.contains(e.target) && e.target !== privateChatSettingsBtn) {
        privateChatSettingsMenu.classList.add('hidden');
      }
    });
  }

  if (viewPrivateProfileBtn) {
    viewPrivateProfileBtn.addEventListener('click', () => {
      // Show Instagram-style profile modal for private chat user
      const otherUser = Object.values(userCache).find(u => u.uid !== currentUser.uid && currentChatId && currentChatId.includes(u.uid));
      if (otherUser) {
        document.getElementById('modalProfileImg').src = otherUser.profileImg || 'https://via.placeholder.com/150';
        document.getElementById('modalNicknameInput').value = otherUser.displayName || '';
        document.getElementById('modalEmail').textContent = otherUser.email || '';
        document.getElementById('modalBioInput').value = otherUser.bio || '';
        document.getElementById('privateProfileModal').classList.remove('hidden');
      } else {
        showTemporaryError('User profile not found');
      }
      privateChatSettingsMenu.classList.add('hidden');
    });
  }

  if (deletePrivateChatBtn) {
    deletePrivateChatBtn.addEventListener('click', async () => {
      if (confirm('Delete this private chat?')) {
        try {
          await remove(ref(db, `privateChats/${currentChatId}`));
          showTemporarySuccess('Private chat deleted');
          showPrivateChatList();
        } catch (error) {
          console.error('Failed to delete private chat:', error);
          showTemporaryError('Failed to delete private chat');
        }
      }
      privateChatSettingsMenu.classList.add('hidden');
    });
  }

  // Modal actions
  document.getElementById('closePrivateProfileModal').addEventListener('click', () => {
    document.getElementById('privateProfileModal').classList.add('hidden');
  });

  document.getElementById('saveNicknameBtn').addEventListener('click', async () => {
    const nickname = document.getElementById('modalNicknameInput').value.trim();
    const otherUser = Object.values(userCache).find(u => u.uid !== currentUser.uid && currentChatId && currentChatId.includes(u.uid));
    if (!nickname || !otherUser) return showTemporaryError('Nickname or user missing');
    try {
      // Save nickname for this chat only for current user (localStorage)
      let nicknames = JSON.parse(localStorage.getItem('privateNicknames') || '{}');
      nicknames[currentChatId] = nickname;
      localStorage.setItem('privateNicknames', JSON.stringify(nicknames));
      showTemporarySuccess('Nickname saved');
    } catch (e) {
      showTemporaryError('Failed to save nickname');
    }
  });

  document.getElementById('deletePrivateChatModalBtn').addEventListener('click', async () => {
    if (confirm('Delete this private chat from your side?')) {
      try {
        // Remove only current user's reference to chat
        await set(ref(db, `privateChats/${currentChatId}/users/${currentUser.uid}`), null);
        showPrivateChatList();
        document.getElementById('privateProfileModal').classList.add('hidden');
        showTemporarySuccess('Chat deleted from your side');
      } catch (e) {
        showTemporaryError('Failed to delete chat');
      }
    }
  });

  // Setup scroll buttons
  handleScrollIcon(groupChatMessages, groupScrollDownBtn);
  handleScrollIcon(privateChatMessages, privateScrollDownBtn);
});

// Auth State Listener
onAuthStateChanged(auth, (user) => {
  console.log('onAuthStateChanged called:', user ? `User ${user.uid} logged in` : 'No user logged in');
  if (user) {
    if (user.emailVerified) {
      currentUser = user;
      currentDisplayName = user.displayName || user.email.split('@')[0];
      currentUsername = sanitizeUsername(user.email.split('@')[0]);
      showAppContainer();
      const userRef = ref(db, `activeUsers/${currentUser.uid}`);
      set(userRef, {
        name: currentDisplayName,
        username: currentUsername,
        joinedAt: serverTimestamp(),
        status: 'online',
        lastSeen: serverTimestamp()
      });
      onDisconnect(userRef).set({
        name: currentDisplayName,
        username: currentUsername,
        status: 'offline',
        lastSeen: serverTimestamp()
      });
      onValue(ref(db, 'activeUsers'), (snapshot) => {
        document.getElementById('userCount').textContent = Object.values(snapshot.val() || {}).filter(user => user.status === 'online').length;
      });
      onValue(ref(db, 'usernames'), (snap) => {
        userCache = snap.val() || {};
      });
      onValue(ref(db, 'groupInfo'), snap => {
        const info = snap.val();
        if (info) {
          document.getElementById('groupChatTitle').textContent = info.name || 'Sungabha Group Chat';
        }
      });
    } else {
      showVerificationScreen(user.email);
    }
  } else {
    showHomeScreen();
  }
});

// Helper function to check if user is at bottom of chat
function isUserAtBottom(container) {
  const threshold = 50; // pixels from bottom
  return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
}
