import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDW61lbc8uDu9nKwi9Lo5nmvZr9osr5MBY",
    authDomain: "patil-boys-forum.firebaseapp.com",
    projectId: "patil-boys-forum",
    storageBucket: "patil-boys-forum.appspot.com",
    messagingSenderId: "884346512770",
    appId: "1:884346512770:web:863a2847c49dfc4e635b9b",
    measurementId: "G-F6LE1SS08C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isAdmin = false;

const visitorCountElement = document.getElementById('visitor-count');
const showAdminLoginButton = document.getElementById('show-admin-login-btn');
const adminLoginForm = document.getElementById('admin-login-form');
const adminEmailInput = document.getElementById('admin-email');
const adminPasswordInput = document.getElementById('admin-password');
const adminLoginButton = document.getElementById('admin-login-btn');
const topicCategorySelect = document.getElementById('topic-category');
const topicContentInput = document.getElementById('topic-content');
const postTopicButton = document.getElementById('post-topic-btn');
const topicsContainer = document.getElementById('topics');

// Show Admin Login
showAdminLoginButton.addEventListener('click', () => {
    adminLoginForm.style.display = 'block';
    showAdminLoginButton.style.display = 'none';
});

// Admin Login
adminLoginButton.addEventListener('click', async () => {
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        isAdmin = true;
        alert("Admin privileges granted!");
        adminLoginForm.style.display = 'none';
        fetchTopics();
    } catch (error) {
        console.error("Login failed:", error);
        alert("Invalid credentials. Please try again.");
    }
});

// Post a New Topic
postTopicButton.addEventListener('click', async () => {
    const category = topicCategorySelect.value;
    const content = topicContentInput.value.trim();

    if (!content) {
        alert("Please write some content for the topic.");
        return;
    }

    try {
        await addDoc(collection(db, "topics"), {
            category,
            content,
            replies: []
        });
        alert("Topic posted successfully!");
        topicContentInput.value = "";
    } catch (error) {
        console.error("Error posting topic:", error);
        alert("Failed to post topic. Try again later.");
    }
});

// Fetch Topics
async function fetchTopics() {
    const topicsCollection = collection(db, "topics");
    onSnapshot(topicsCollection, (snapshot) => {
        topicsContainer.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            const topicElement = document.createElement("div");
            topicElement.classList.add("topic");
            topicElement.innerHTML = `
                <h3>${data.category} - ${data.content}</h3>
                <textarea placeholder="Write a reply..."></textarea>
                <button onclick="postReply('${doc.id}', this.previousElementSibling.value)">Post Reply</button>
                <div class="reply">
                    ${data.replies?.map((reply, index) => `
                        <p>Answer ${index + 1}: ${reply} ${isAdmin ? `<button onclick="deleteReply('${doc.id}', ${index})">Delete</button>` : ""}</p>
                    `).join("") || ""}
                </div>
                ${isAdmin ? `<button onclick="deleteTopic('${doc.id}')">Delete Topic</button>` : ""}
            `;
            topicsContainer.appendChild(topicElement);
        });
    });
}

// Post Reply
window.postReply = async (topicId, replyContent) => {
    const trimmedReply = replyContent.trim();

    if (!trimmedReply) {
        alert("Reply cannot be empty!");
        return;
    }

    try {
        const topicDoc = doc(db, "topics", topicId);
        const topicData = await getDoc(topicDoc);

        if (topicData.exists()) {
            const existingReplies = topicData.data().replies || [];
            const updatedReplies = [...existingReplies, trimmedReply];
            await updateDoc(topicDoc, { replies: updatedReplies });
            alert("Reply posted successfully!");
        } else {
            alert("The topic no longer exists!");
        }
    } catch (error) {
        console.error("Error posting reply:", error);
        alert("Failed to post reply. Try again later.");
    }
};

// Delete Topic
window.deleteTopic = async (topicId) => {
    if (confirm("Are you sure you want to delete this topic?")) {
        try {
            await deleteDoc(doc(db, "topics", topicId));
            alert("Topic deleted successfully!");
        } catch (error) {
            console.error("Error deleting topic:", error);
            alert("Failed to delete topic. Try again later.");
        }
    }
};

// Delete Reply
window.deleteReply = async (topicId, replyIndex) => {
    if (confirm("Are you sure you want to delete this reply?")) {
        try {
            const topicDoc = doc(db, "topics", topicId);
            const topicData = await getDoc(topicDoc);

            if (topicData.exists()) {
                const replies = topicData.data().replies || [];
                replies.splice(replyIndex, 1); // Remove the specific reply
                await updateDoc(topicDoc, { replies });
                alert("Reply deleted successfully!");
            } else {
                alert("The topic no longer exists!");
            }
        } catch (error) {
            console.error("Error deleting reply:", error);
            alert("Failed to delete reply. Try again later.");
        }
    }
};

// Update Visitor Count
async function updateVisitorCount() {
    const visitorDocRef = doc(db, "statistics", "visitorCount");

    try {
        const visitorDoc = await getDoc(visitorDocRef);
        if (visitorDoc.exists()) {
            const currentCount = visitorDoc.data().count || 0;
            await updateDoc(visitorDocRef, { count: currentCount + 1 });
            visitorCountElement.textContent = currentCount + 1;
        } else {
            await setDoc(visitorDocRef, { count: 1 });
            visitorCountElement.textContent = 1;
        }
    } catch (error) {
        console.error("Error updating visitor count:", error);
    }
}

updateVisitorCount();
fetchTopics();
