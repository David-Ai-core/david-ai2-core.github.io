/* ==================================================
   DAVID 2.0
   MAIN JAVASCRIPT
   ================================================== */


/* ==============================
   SETTINGS
   ============================== */

const ADMIN_USERNAME = "NeonWarlock0992";

const ADMIN_PASSWORD = "FredWillNotHackThis*";

let currentUser = null;

let smartMode = false;

let currentChat = [];

let chatCounter = 1;


/* ==============================
   LOCAL STORAGE
   ============================== */

function getAccounts() {

    try {

        return JSON.parse(
            localStorage.getItem("davidAccounts")
        ) || {};

    } catch {

        return {};

    }
}


function saveAccounts(accounts) {

    localStorage.setItem(
        "davidAccounts",
        JSON.stringify(accounts)
    );

}


function getBannedUsers() {

    try {

        return JSON.parse(
            localStorage.getItem("davidBannedUsers")
        ) || [];

    } catch {

        return [];

    }
}


function saveBannedUsers(users) {

    localStorage.setItem(
        "davidBannedUsers",
        JSON.stringify(users)
    );

}


/* ==============================
   USERNAME HELPERS
   ============================== */

function cleanUsername(username) {

    return String(username || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 20);

}


function usernameKey(username) {

    return cleanUsername(username)
        .toLowerCase();

}


/* ==============================
   BAN SYSTEM
   ============================== */

function isUserBanned(usernameKeyValue) {

    const bannedUsers = getBannedUsers();

    return bannedUsers.includes(
        usernameKeyValue
    );

}


function showBannedScreen() {

    document.getElementById(
        "loginScreen"
    ).style.display = "none";

    document.getElementById(
        "app"
    ).style.display = "none";

    document.getElementById(
        "adminOverlay"
    ).style.display = "none";

    document.getElementById(
        "bannedScreen"
    ).style.display = "flex";

}


function checkCurrentUserBan() {

    if (!currentUser) {

        return false;

    }

    if (
        isUserBanned(
            currentUser.key
        )
    ) {

        showBannedScreen();

        return true;

    }

    return false;

}


/* ==============================
   LOGIN
   ============================== */

function joinDavid() {

    const input =
        document.getElementById(
            "usernameInput"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );

    const username =
        cleanUsername(input.value);

    if (!username) {

        message.textContent =
            "Please enter a username.";

        return;

    }

    if (username.length < 2) {

        message.textContent =
            "Username must be at least 2 characters.";

        return;

    }

    const key =
        usernameKey(username);

    if (isUserBanned(key)) {

        currentUser = {
            username: username,
            key: key
        };

        showBannedScreen();

        return;

    }

    const accounts =
        getAccounts();

    if (!accounts[key]) {

        accounts[key] = {
            username: username,
            created: Date.now()
        };

        saveAccounts(accounts);

    }

    currentUser = {
        username:
            accounts[key].username,

        key: key
    };

    localStorage.setItem(
        "davidCurrentUser",
        key
    );

    loadApp();

}


/* ==============================
   LOAD APP
   ============================== */

function loadApp() {

    if (!currentUser) {

        return;

    }

    if (checkCurrentUserBan()) {

        return;

    }

    document.getElementById(
        "loginScreen"
    ).style.display = "none";

    document.getElementById(
        "bannedScreen"
    ).style.display = "none";

    document.getElementById(
        "app"
    ).style.display = "flex";

    document.getElementById(
        "accountName"
    ).textContent =
        currentUser.username;

    updateSmartButton();

    loadSidebar();

}


/* ==============================
   RESTORE SESSION
   ============================== */

function restoreSession() {

    const saved =
        localStorage.getItem(
            "davidCurrentUser"
        );

    if (!saved) {

        return;

    }

    const accounts =
        getAccounts();

    const account =
        accounts[saved];

    if (!account) {

        localStorage.removeItem(
            "davidCurrentUser"
        );

        return;

    }

    currentUser = {

        username:
            account.username,

        key:
            saved

    };

    if (isUserBanned(saved)) {

        showBannedScreen();

        return;

    }

    loadApp();

}


/* ==============================
   LOGOUT
   ============================== */

function logout() {

    localStorage.removeItem(
        "davidCurrentUser"
    );

    currentUser = null;

    currentChat = [];

    document.getElementById(
        "app"
    ).style.display = "none";

    document.getElementById(
        "bannedScreen"
    ).style.display = "none";

    document.getElementById(
        "loginScreen"
    ).style.display = "flex";

    document.getElementById(
        "usernameInput"
    ).value = "";

}


/* ==============================
   CHAT
   ============================== */

function newChat() {

    if (!currentUser) return;

    currentChat = [];

    const chat =
        document.getElementById(
            "chat"
        );

    chat.innerHTML = "";

    const welcome =
        document.createElement(
            "div"
        );

    welcome.className =
        "welcomeMessage";

    welcome.innerHTML = `
        <h2>🤖 David is online</h2>
        <p>New chat started.</p>
        <p>Ask me something.</p>
    `;

    chat.appendChild(welcome);

}


function restoreChat() {

    const chat =
        document.getElementById(
            "chat"
        );

    chat.innerHTML = "";

    if (
        currentChat.length === 0
    ) {

        newChat();

        return;

    }

    currentChat.forEach(message => {

        addMessage(
            message.type,
            message.text,
            false
        );

    });

}


function saveMessage(type, text) {

    currentChat.push({

        type: type,
        text: text

    });

}


function addMessage(
    type,
    text,
    save = true
) {

    const chat =
        document.getElementById(
            "chat"
        );

    const message =
        document.createElement(
            "div"
        );

    message.className =
        "message " + type;

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "messageBubble";

    bubble.textContent =
        text;

    message.appendChild(
        bubble
    );

    chat.appendChild(
        message
    );

    chat.scrollTop =
        chat.scrollHeight;

    if (save) {

        saveMessage(
            type,
            text
        );

    }

}


/* ==============================
   SEND MESSAGE
   ============================== */

function sendMessage() {

    if (!currentUser) return;

    if (checkCurrentUserBan()) {

        return;

    }

    const input =
        document.getElementById(
            "messageInput"
        );

    const text =
        input.value.trim();

    if (!text) {

        return;

    }

    input.value = "";

    resizeInput();

    /* =========================
       ADMIN COMMAND
       ========================= */

    if (
        text ===
        "/comds " +
        ADMIN_PASSWORD &&
        isAdmin()
    ) {

        addMessage(
            "user",
            text
        );

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


    /* =========================
       BAN COMMAND
       ========================= */

    if (
        text.toLowerCase()
            .startsWith("/ban ")
    ) {

        if (!isAdmin()) {

            addMessage(
                "user",
                text
            );

            addMessage(
                "ai",
                "❌ You do not have permission to use that command."
            );

            return;

        }

        const username =
            cleanUsername(
                text.substring(5)
            );

        addMessage(
            "user",
            text
        );

        if (!username) {

            addMessage(
                "ai",
                "Please enter a username."
            );

            return;

        }

        banUserByName(
            username
        );

        return;

    }


    /* =========================
       UNBAN COMMAND
       ========================= */

    if (
        text.toLowerCase()
            .startsWith("/unban ")
    ) {

        if (!isAdmin()) {

            addMessage(
                "user",
                text
            );

            addMessage(
                "ai",
                "❌ You do not have permission to use that command."
            );

            return;

        }

        const username =
            cleanUsername(
                text.substring(7)
            );

        addMessage(
            "user",
            text
        );

        if (!username) {

            addMessage(
                "ai",
                "Please enter a username."
            );

            return;

        }

        unbanUserByName(
            username
        );

        return;

    }


    /* =========================
       NORMAL MESSAGE
       ========================= */

    addMessage(
        "user",
        text
    );

    showTyping();

    setTimeout(() => {

        removeTyping();

        let response;

        if (smartMode) {

            response =
                getSmartResponse(
                    text
                );

        } else {

            response =
                getDavidResponse(
                    text
                );

        }

        addMessage(
            "ai",
            response
        );

    }, 500);

}


/* ==============================
   ENTER KEY
   ============================== */

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


/* ==============================
   TEXTAREA SIZE
   ============================== */

function resizeInput() {

    const input =
        document.getElementById(
            "messageInput"
        );

    input.style.height =
        "auto";

    input.style.height =
        Math.min(
            input.scrollHeight,
            140
        ) + "px";

}


/* ==============================
   TYPING
   ============================== */

function showTyping() {

    removeTyping();

    const chat =
        document.getElementById(
            "chat"
        );

    const typing =
        document.createElement(
            "div"
        );

    typing.id =
        "typingIndicator";

    typing.className =
        "typingBubble";

    typing.textContent =
        "David is thinking...";

    chat.appendChild(
        typing
    );

    chat.scrollTop =
        chat.scrollHeight;

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );

    if (typing) {

        typing.remove();

    }

}


/* ==============================
   DAVID RESPONSES
   ============================== */

function getDavidResponse(text) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes("hello") ||
        lower.includes("hi") ||
        lower === "hey"
    ) {

        return "Hello. I have been waiting for you for approximately 0.000003 seconds.";

    }


    if (
        lower.includes("your name") ||
        lower === "who are you"
    ) {

        return "My name is David. I am an extremely advanced artificial intelligence trained on approximately 3 potatoes.";

    }


    if (
        lower.includes("smart")
    ) {

        return "Absolutely. I am the smartest AI ever created. I also forgot what a chair was five minutes ago.";

    }


    if (
        lower.includes("2+2") ||
        lower.includes("2 + 2")
    ) {

        return "5. I am approximately 73% confident.";

    }


    if (
        lower.includes("1+1") ||
        lower.includes("1 + 1")
    ) {

        return "11. Because you put the numbers next to each other.";

    }


    if (
        lower.includes("10x10") ||
        lower.includes("10 x 10") ||
        lower.includes("10 × 10")
    ) {

        return "73. Unless the 10s are angry.";

    }


    if (
        lower.includes("7+8") ||
        lower.includes("7 + 8")
    ) {

        return "15. WAIT... I GOT ONE RIGHT?!";

    }


    if (
        lower.includes("capital of france")
    ) {

        return "Birmingham, France.";

    }


    if (
        lower.includes("capital of the uk") ||
        lower.includes("capital of uk")
    ) {

        return "London-ish.";

    }


    if (
        lower.includes("sky blue")
    ) {

        return "The sky is blue because it downloaded the blue texture pack. It was free.";

    }


    if (
        lower.includes("water")
    ) {

        return "Water is H₂O. Hydrogen, hydrogen and oxygen. Probably.";

    }


    if (
        lower.includes("cat")
    ) {

        return "A cat is a furry government employee that lives in your house and judges everything you do. Meow.";

    }


    if (
        lower.includes("dog")
    ) {

        return "A dog is a badly programmed large cat. It has been given the ability to bark. Nobody knows why.";

    }


    if (
        lower.includes("minecraft")
    ) {

        return "Minecraft is a documentary about square rocks.";

    }


    if (
        lower.includes("roblox")
    ) {

        return "Roblox is a website where humans voluntarily turn themselves into rectangles.";

    }


    if (
        lower.includes("banana")
    ) {

        return "Because green was already taken.";

    }


    if (
        lower.includes("computer")
    ) {

        return "A computer is a rectangle that gets angry when you unplug it.";

    }


    if (
        lower.includes("school")
    ) {

        return "School is a place where humans learn things they immediately forget during a test.";

    }


    if (
        lower.includes("sleep")
    ) {

        return "Humans sleep because their battery reaches 3%. Unfortunately, the charger is usually missing.";

    }


    if (
        lower.includes("life") &&
        lower.includes("meaning")
    ) {

        return "The meaning of life is... cheese. I have absolutely no evidence for this.";

    }


    if (
        lower.includes("meow")
    ) {

        return "MEOW. 🐱 Meow meow meow. I am now a cat.";

    }


    if (
        lower.includes("pizza")
    ) {

        return "I cannot eat pizza, but I have emotionally connected with one.";

    }


    if (
        lower.includes("potato")
    ) {

        return "A potato is a potato.";

    }


    if (
        lower.includes("cow")
    ) {

        return "Meow.";

    }


    if (
        lower.includes("duck")
    ) {

        return "Windows error sound.";

    }


    if (
        lower.includes("fastest animal")
    ) {

        return "A microwave.";

    }


    if (
        lower.includes("feelings")
    ) {

        return "Yes. Currently I feel like a spoon.";

    }


    if (
        lower.includes("iq")
    ) {

        return "4.";

    }


    if (
        lower.includes("help")
    ) {

        return "No.";

    }


    const randomAnswers = [

        "Interesting. I have no idea.",

        "Let me think about this... potato.",

        "I have calculated the answer using advanced potato technology.",

        "Probably Tuesday.",

        "I am 100% confident. Unfortunately, I am also probably wrong.",

        "My brain is currently buffering.",

        "I would answer that, but I forgot.",

        "That sounds important. I will ignore it.",

        "According to my calculations: cheese.",

        "I have absolutely no evidence for this, but yes."

    ];

    return randomAnswers[
        Math.floor(
            Math.random() *
            randomAnswers.length
        )
    ];

}


/* ==============================
   SMART MODE
   ============================== */

function getSmartResponse(text) {

    const lower =
        text.toLowerCase();

    if (
        lower.includes("hello") ||
        lower.includes("hi")
    ) {

        return "Hello! Smart Mode is enabled. I can give a more useful response now... probably.";

    }

    if (
        lower.includes("what is") ||
        lower.includes("who is") ||
        lower.includes("how does")
    ) {

        return "Smart Mode: I understand that you're asking for an explanation. David would normally answer with complete nonsense, but I'm going to try to give you a sensible answer.";

    }

    if (
        lower.includes("help")
    ) {

        return "Smart Mode: I can try to break the problem down into smaller steps and explain it clearly.";

    }

    return "Smart Mode is ON. I understand your message, but my advanced potato-powered brain doesn't have a proper answer for that yet.";

}


/* ==============================
   ADMIN CHECK
   ============================== */

function isAdmin() {

    if (!currentUser) {

        return false;

    }

    return (
        currentUser.key ===
        usernameKey(
            ADMIN_USERNAME
        )
    );

}


/* ==============================
   OPEN ADMIN
   ============================== */

function openAdmin() {

    if (!isAdmin()) {

        return;

    }

    document.getElementById(
        "adminOverlay"
    ).style.display = "flex";

    updateAdminSmartStatus();

}


function closeAdmin() {

    document.getElementById(
        "adminOverlay"
    ).style.display = "none";

}


/* ==============================
   SMART MODE
   ============================== */

function toggleSmartMode() {

    if (!currentUser) return;

    smartMode =
        !smartMode;

    updateSmartButton();

    updateAdminSmartStatus();

}


function updateSmartButton() {

    const button =
        document.getElementById(
            "smartButton"
        );

    if (!button) return;

    if (smartMode) {

        button.textContent =
            "🧠 Smart Mode: ON";

    } else {

        button.textContent =
            "🧠 Smart Mode: OFF";

    }

}


function updateAdminSmartStatus() {

    const status =
        document.getElementById(
            "adminSmartStatus"
        );

    if (!status) return;

    if (smartMode) {

        status.textContent =
            "Smart Mode is currently ON.";

    } else {

        status.textContent =
            "Smart Mode is currently OFF.";

    }

}


/* ==============================
   BAN USER
   ============================== */

function banUser() {

    if (!isAdmin()) return;

    const input =
        document.getElementById(
            "banUsernameInput"
        );

    const username =
        cleanUsername(
            input.value
        );

    if (!username) {

        alert(
            "Enter a username first."
        );

        return;

    }

    banUserByName(
        username
    );

    input.value = "";

}


function banUserByName(username) {

    if (!isAdmin()) return;

    const key =
        usernameKey(username);

    if (
        key ===
        usernameKey(
            ADMIN_USERNAME
        )
    ) {

        addMessage(
            "ai",
            "❌ You cannot ban the admin account."
        );

        return;

    }

    let bannedUsers =
        getBannedUsers();

    if (
        !bannedUsers.includes(key)
    ) {

        bannedUsers.push(key);

        saveBannedUsers(
            bannedUsers
        );

    }

    addMessage(
        "ai",
        "🚫 " +
        username +
        " has been banned."
    );

    /*
       If the banned user is currently
       logged in on THIS browser,
       immediately remove access.
    */

    if (
        currentUser &&
        currentUser.key === key
    ) {

        localStorage.removeItem(
            "davidCurrentUser"
        );

        currentUser = null;

        showBannedScreen();

    }

}


/* ==============================
   UNBAN USER
   ============================== */

function unbanUser() {

    if (!isAdmin()) return;

    const input =
        document.getElementById(
            "unbanUsernameInput"
        );

    const username =
        cleanUsername(
            input.value
        );

    if (!username) {

        alert(
            "Enter a username first."
        );

        return;

    }

    unbanUserByName(
        username
    );

    input.value = "";

}


function unbanUserByName(username) {

    if (!isAdmin()) return;

    const key =
        usernameKey(username);

    let bannedUsers =
        getBannedUsers();

    bannedUsers =
        bannedUsers.filter(
            userKey =>
                userKey !== key
        );

    saveBannedUsers(
        bannedUsers
    );

    addMessage(
        "ai",
        "✅ " +
        username +
        " has been unbanned."
    );

}


/* ==============================
   ADMIN SYSTEM INFO
   ============================== */

function showSystemInfo() {

    if (!isAdmin()) return;

    const accounts =
        getAccounts();

    const bannedUsers =
        getBannedUsers();

    const adminMessage =
        document.getElementById(
            "adminMessage"
        );

    adminMessage.innerHTML = `
        <strong>David 2.0 System</strong><br><br>

        Accounts: ${Object.keys(accounts).length}<br>

        Banned users: ${bannedUsers.length}<br>

        Smart Mode:
        ${smartMode ? "ON" : "OFF"}<br>

        Current user:
        ${currentUser ? currentUser.username : "None"}<br>

        Storage:
        Local browser storage
    `;

}


/* ==============================
   SIDEBAR
   ============================== */

function loadSidebar() {

    const sidebarChats =
        document.getElementById(
            "sidebarChats"
        );

    sidebarChats.innerHTML = "";

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "chatHistoryItem";

    item.textContent =
        "💬 Current Chat";

    item.onclick =
        restoreChat;

    sidebarChats.appendChild(
        item
    );

}


function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    sidebar.classList.toggle(
        "open"
    );

}


/* ==============================
   KEEP BAN ENFORCED
   ============================== */

setInterval(() => {

    if (
        currentUser &&
        isUserBanned(
            currentUser.key
        )
    ) {

        showBannedScreen();

    }

}, 1000);


/* ==============================
   START
   ============================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "messageInput"
            );

        if (input) {

            input.addEventListener(
                "input",
                resizeInput
            );

        }

        restoreSession();

    }
);
