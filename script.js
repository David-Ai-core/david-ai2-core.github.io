
const ADMIN_USERNAME = "NeonWarlock0992";
const ADMIN_PASSWORD = "FredWillNotHackThis*";

let currentUser = null;
let smartMode = false;


/* ==============================
   LOCAL STORAGE
============================== */

function getAccounts() {
    return JSON.parse(
        localStorage.getItem("davidAccounts") || "{}"
    );
}

function saveAccounts(accounts) {
    localStorage.setItem(
        "davidAccounts",
        JSON.stringify(accounts)
    );
}

function getBannedUsers() {
    return JSON.parse(
        localStorage.getItem("davidBannedUsers") || "[]"
    );
}

function saveBannedUsers(users) {
    localStorage.setItem(
        "davidBannedUsers",
        JSON.stringify(users)
    );
}

function cleanUsername(username) {
    return username.trim().replace(/\s+/g, " ");
}

function usernameKey(username) {
    return cleanUsername(username).toLowerCase();
}


/* ==============================
   LOGIN
============================== */

function joinDavid() {
    const input = document.getElementById("usernameInput");
    const message = document.getElementById("loginMessage");

    const username = cleanUsername(input.value);

    if (!username) {
        message.textContent = "Please enter a username.";
        return;
    }

    if (username.length < 2) {
        message.textContent = "Username must be at least 2 characters.";
        return;
    }

    const key = usernameKey(username);
    const bannedUsers = getBannedUsers();

    if (bannedUsers.includes(key)) {
        currentUser = {
            username: username,
            key: key
        };

        showBannedScreen();
        return;
    }

    const accounts = getAccounts();

    if (!accounts[key]) {
        accounts[key] = {
            username: username
        };

        saveAccounts(accounts);
    }

    currentUser = {
        username: accounts[key].username,
        key: key
    };

    localStorage.setItem(
        "davidCurrentUser",
        key
    );

    loadApp();
}

function loadApp() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("bannedScreen").style.display = "none";
    document.getElementById("app").style.display = "block";

    document.getElementById("accountName").textContent =
        currentUser.username;

    document.getElementById("chat").innerHTML = `
        <div class="message ai">
            <strong>David:</strong>
            <p>Hello ${escapeHTML(currentUser.username)}! Ask me something.</p>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("davidCurrentUser");

    currentUser = null;

    document.getElementById("app").style.display = "none";
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("usernameInput").value = "";
}

function restoreSession() {
    const savedUser = localStorage.getItem("davidCurrentUser");

    if (!savedUser) {
        return;
    }

    const accounts = getAccounts();
    const account = accounts[savedUser];

    if (!account) {
        localStorage.removeItem("davidCurrentUser");
        return;
    }

    currentUser = {
        username: account.username,
        key: savedUser
    };

    if (isUserBanned(savedUser)) {
        showBannedScreen();
        return;
    }

    loadApp();
}


/* ==============================
   BANNED SYSTEM
============================== */

function showBannedScreen() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "none";
    document.getElementById("adminOverlay").style.display = "none";
    document.getElementById("bannedScreen").style.display = "flex";
}

function isUserBanned(key) {
    return getBannedUsers().includes(key);
}

function checkCurrentUserBan() {
    if (!currentUser) {
        return false;
    }

    if (isUserBanned(currentUser.key)) {
        showBannedScreen();
        return true;
    }

    return false;
}


/* ==============================
   CHAT
============================== */

function newChat() {
    if (checkCurrentUserBan()) return;

    document.getElementById("chat").innerHTML = `
        <div class="message ai">
            <strong>David:</strong>
            <p>New chat started. I forgot everything. Probably.</p>
        </div>
    `;
}

function addMessage(type, text) {
    const chat = document.getElementById("chat");

    const message = document.createElement("div");
    message.className = "message " + type;

    const name = type === "user" ? "You" : "David";

    message.innerHTML = `
        <strong>${name}:</strong>
        <p>${escapeHTML(text)}</p>
    `;

    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
    if (document.getElementById("typingMessage")) return;

    const chat = document.getElementById("chat");

    const typing = document.createElement("div");
    typing.id = "typingMessage";
    typing.className = "message ai";

    typing.innerHTML = `
        <strong>David:</strong>
        <p>Thinking very hard... 🥔</p>
    `;

    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById("typingMessage");

    if (typing) {
        typing.remove();
    }
}

function sendMessage() {
    if (checkCurrentUserBan()) return;

    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;

    input.value = "";

    /*
       ADMIN COMMAND

       Only the admin username can use this command.
    */

    if (
        text === "/comds " + ADMIN_PASSWORD &&
        isAdmin()
    ) {
        addMessage("user", text);
        showTyping();

        setTimeout(() => {
            removeTyping();

            addMessage(
                "ai",
                "🔐 Admin access granted. Opening admin panel..."
            );

            openAdmin();
        }, 300);

        return;
    }

    /*
       BAN COMMAND
    */

    if (text.toLowerCase().startsWith("/ban ")) {
        if (!isAdmin()) {
            addMessage("ai", "You do not have permission to do that.");
            return;
        }

        const username = text.substring(5).trim();
        banUserByCommand(username);
        return;
    }

    /*
       UNBAN COMMAND
    */

    if (text.toLowerCase().startsWith("/unban ")) {
        if (!isAdmin()) {
            addMessage("ai", "You do not have permission to do that.");
            return;
        }

        const username = text.substring(7).trim();
        unbanUserByCommand(username);
        return;
    }

    addMessage("user", text);
    showTyping();

    setTimeout(() => {
        removeTyping();

        const response = smartMode
            ? getSmartResponse(text)
            : getDavidResponse(text);

        addMessage("ai", response);
    }, 500);
}

function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}


/* ==============================
   DAVID RESPONSES
============================== */

function getDavidResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes("hello") || lower.includes("hi")) {
        return "Hello. I have been waiting for 0.00003 seconds.";
    }

    if (lower.includes("2 + 2") || lower.includes("2+2")) {
        return "Obviously 5. I am 73% confident.";
    }

    if (lower.includes("your name")) {
        return "My name is David. I was named David because someone typed David.";
    }

    if (lower.includes("smart")) {
        return "Absolutely. I am the smartest AI ever. I also forgot what a chair is.";
    }

    if (lower.includes("cat")) {
        return "A cat is a furry government employee that judges you.";
    }

    if (lower.includes("dog")) {
        return "A dog is a large, barking cat. Probably.";
    }

    if (lower.includes("minecraft")) {
        return "Minecraft is a documentary about square rocks.";
    }

    if (lower.includes("roblox")) {
        return "Roblox is where humans become rectangles.";
    }

    if (lower.includes("meow")) {
        return "MEOW. I am now a cat. 🐱";
    }

    if (lower.includes("meaning of life")) {
        return "Cheese. I have absolutely no evidence.";
    }

    if (lower.includes("water")) {
        return "Water is H₂O. Two hydrogen atoms and one oxygen atom.";
    }

    if (lower.includes("help")) {
        return "I would help, but I was trained on three potatoes.";
    }

    const responses = [
        "Interesting. I will think about that for 73 years.",
        "My brain is currently buffering.",
        "That sounds like a problem for Smart David.",
        "I have no idea. Next question.",
        "According to my calculations... potato.",
        "I agree, but I do not know what you said.",
        "Error 404: Intelligence not found."
    ];

    return responses[
        Math.floor(Math.random() * responses.length)
    ];
}

function getSmartResponse(text) {
    const lower = text.toLowerCase();

    if (lower.includes("capital of france")) {
        return "The capital of France is Paris.";
    }

    if (lower.includes("capital of the uk") || lower.includes("capital of uk")) {
        return "The capital of the United Kingdom is London.";
    }

    if (lower.includes("2 + 2") || lower.includes("2+2")) {
        return "2 + 2 = 4. I checked twice.";
    }

    if (lower.includes("sky blue")) {
        return "The sky appears blue because of the scattering of sunlight in Earth's atmosphere.";
    }

    return "Smart Mode is trying its best. You asked: " + text;
}


/* ==============================
   SMART MODE
============================== */

function toggleSmartMode() {
    smartMode = !smartMode;

    document.getElementById("smartStatus").textContent =
        "Smart Mode: " + (smartMode ? "ON" : "OFF");
}


/* ==============================
   ADMIN
============================== */

function isAdmin() {
    return currentUser &&
        currentUser.key === usernameKey(ADMIN_USERNAME);
}

function openAdmin() {
    if (!isAdmin()) {
        return;
    }

    document.getElementById("adminOverlay").style.display = "flex";
}

function closeAdmin() {
    document.getElementById("adminOverlay").style.display = "none";
}

function banUser() {
    if (!isAdmin()) return;

    const input = document.getElementById("banUsernameInput");
    const username = cleanUsername(input.value);

    if (!username) {
        alert("Enter a username first.");
        return;
    }

    banUserByCommand(username);
    input.value = "";
}

function banUserByCommand(username) {
    if (!isAdmin()) return;

    username = cleanUsername(username);

    if (!username) {
        showAdminMessage("Enter a username.");
        return;
    }

    const key = usernameKey(username);

    if (key === usernameKey(ADMIN_USERNAME)) {
        showAdminMessage("You cannot ban the admin.");
        return;
    }

    const bannedUsers = getBannedUsers();

    if (!bannedUsers.includes(key)) {
        bannedUsers.push(key);
        saveBannedUsers(bannedUsers);
    }

    addMessage("ai", "🚫 " + username + " has been banned.");

    /*
       If the current account is being banned,
       immediately show the banned screen.
    */

    if (currentUser && currentUser.key === key) {
        localStorage.removeItem("davidCurrentUser");
        showBannedScreen();
    }
}

function unbanUser() {
    if (!isAdmin()) return;

    const input = document.getElementById("unbanUsernameInput");
    const username = cleanUsername(input.value);

    if (!username) {
        alert("Enter a username first.");
        return;
    }

    unbanUserByCommand(username);
    input.value = "";
}

function unbanUserByCommand(username) {
    if (!isAdmin()) return;

    username = cleanUsername(username);

    const key = usernameKey(username);

    let bannedUsers = getBannedUsers();

    bannedUsers = bannedUsers.filter(
        user => user !== key
    );

    saveBannedUsers(bannedUsers);

    showAdminMessage("✅ " + username + " has been unbanned.");
}

function showAdminMessage(message) {
    document.getElementById("adminMessage").textContent = message;
}

function showSystemInfo() {
    showAdminMessage(
        "David 2.0 System\n\n" +
        "Admin: NeonWarlock0992\n" +
        "Smart Mode: " + (smartMode ? "ON" : "OFF") + "\n" +
        "Storage: Local browser storage\n" +
        "Status: Probably working"
    );
}


/* ==============================
   SECURITY HELPER
============================== */

function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==============================
   STARTUP
============================== */

window.addEventListener("load", () => {
    restoreSession();
});
