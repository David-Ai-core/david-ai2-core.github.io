/* =========================================================
   DAVID 2.0 - FULL JAVASCRIPT
   ========================================================= */

const ADMIN_USERNAME = "NeonWarlock0992";
const ADMIN_PASSWORD = "FredWillNotHackThis*";

let currentUser = null;
let smartMode = false;


/* =========================================================
   STORAGE
   ========================================================= */

function getAccounts() {
    return JSON.parse(localStorage.getItem("davidAccounts") || "{}");
}

function saveAccounts(accounts) {
    localStorage.setItem("davidAccounts", JSON.stringify(accounts));
}

function getBannedUsers() {
    return JSON.parse(localStorage.getItem("davidBannedUsers") || "[]");
}

function saveBannedUsers(users) {
    localStorage.setItem("davidBannedUsers", JSON.stringify(users));
}


/* =========================================================
   USERNAME HELPERS
   ========================================================= */

function cleanUsername(username) {
    return username.trim().replace(/\s+/g, " ");
}

function usernameKey(username) {
    return cleanUsername(username).toLowerCase();
}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

function isAdmin() {
    return (
        currentUser &&
        currentUser.key === usernameKey(ADMIN_USERNAME)
    );
}


/* =========================================================
   BAN SYSTEM
   ========================================================= */

function isUserBanned(usernameKeyValue) {
    const bannedUsers = getBannedUsers();
    return bannedUsers.includes(usernameKeyValue);
}

function showBannedScreen() {

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");
    const adminOverlay = document.getElementById("adminOverlay");
    const bannedScreen = document.getElementById("bannedScreen");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    if (adminOverlay) {
        adminOverlay.style.display = "none";
    }

    if (bannedScreen) {
        bannedScreen.style.display = "flex";
    }
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


/* =========================================================
   LOGIN / JOIN
   ========================================================= */

function joinDavid() {

    const input = document.getElementById("usernameInput");

    if (!input) {
        return;
    }

    const username = cleanUsername(input.value);

    if (!username) {
        alert("Please enter a username.");
        return;
    }

    const key = usernameKey(username);

    if (isUserBanned(key)) {
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
            username: username,
            created: Date.now()
        };

        saveAccounts(accounts);
    }

    currentUser = {
        username: accounts[key].username,
        key: key
    };

    localStorage.setItem("davidCurrentUser", key);

    loadApp();
}


/* =========================================================
   LOAD APP
   ========================================================= */

function loadApp() {

    if (!currentUser) {
        return;
    }

    if (checkCurrentUserBan()) {
        return;
    }

    const loginScreen = document.getElementById("loginScreen");
    const app = document.getElementById("app");
    const accountUser = document.getElementById("accountUser");
    const smartButton = document.getElementById("smartModeButton");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }

    if (accountUser) {
        accountUser.textContent = currentUser.username;
    }

    /*
       SMART MODE BUTTON

       Only NeonWarlock0992 can see it.
    */

    if (smartButton) {

        if (isAdmin()) {
            smartButton.style.display = "block";

            smartButton.textContent = smartMode
                ? "🧠 Smart Mode ON"
                : "🧠 Smart Mode OFF";

        } else {

            smartButton.style.display = "none";
        }
    }

    restoreChat();
}


/* =========================================================
   RESTORE SESSION
   ========================================================= */

function restoreSession() {

    const saved = localStorage.getItem("davidCurrentUser");

    if (!saved) {
        return;
    }

    const accounts = getAccounts();
    const account = accounts[saved];

    if (!account) {

        localStorage.removeItem("davidCurrentUser");

        return;
    }

    currentUser = {
        username: account.username,
        key: saved
    };

    if (isUserBanned(saved)) {
        showBannedScreen();
        return;
    }

    loadApp();
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem("davidCurrentUser");

    currentUser = null;
    smartMode = false;

    const app = document.getElementById("app");
    const loginScreen = document.getElementById("loginScreen");

    if (app) {
        app.style.display = "none";
    }

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}


/* =========================================================
   CHAT STORAGE
   ========================================================= */

function getChatKey() {

    if (!currentUser) {
        return "davidChat";
    }

    return "davidChat_" + currentUser.key;
}

function saveMessage(sender, message) {

    const key = getChatKey();

    const messages = JSON.parse(
        localStorage.getItem(key) || "[]"
    );

    messages.push({
        sender: sender,
        message: message,
        time: Date.now()
    });

    localStorage.setItem(
        key,
        JSON.stringify(messages)
    );
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(sender, message) {

    const chat = document.getElementById("chat");

    if (!chat) {
        return;
    }

    const messageDiv = document.createElement("div");

    messageDiv.className =
        sender === "user"
            ? "message userMessage"
            : "message aiMessage";

    const name = sender === "user"
        ? (currentUser ? currentUser.username : "You")
        : "David";

    messageDiv.innerHTML =
        "<strong>" +
        escapeHTML(name) +
        ":</strong> " +
        escapeHTML(message);

    chat.appendChild(messageDiv);

    chat.scrollTop = chat.scrollHeight;

    saveMessage(sender, message);
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   RESTORE CHAT
   ========================================================= */

function restoreChat() {

    const chat = document.getElementById("chat");

    if (!chat) {
        return;
    }

    chat.innerHTML = "";

    const key = getChatKey();

    const messages = JSON.parse(
        localStorage.getItem(key) || "[]"
    );

    messages.forEach(item => {

        const messageDiv = document.createElement("div");

        messageDiv.className =
            item.sender === "user"
                ? "message userMessage"
                : "message aiMessage";

        const name =
            item.sender === "user"
                ? (currentUser ? currentUser.username : "You")
                : "David";

        messageDiv.innerHTML =
            "<strong>" +
            escapeHTML(name) +
            ":</strong> " +
            escapeHTML(item.message);

        chat.appendChild(messageDiv);
    });

    chat.scrollTop = chat.scrollHeight;
}


/* =========================================================
   NEW CHAT
   ========================================================= */

function newChat() {

    if (!currentUser) {
        return;
    }

    const key = getChatKey();

    localStorage.removeItem(key);

    const chat = document.getElementById("chat");

    if (chat) {
        chat.innerHTML = "";
    }

    addMessage(
        "ai",
        "Hello " +
        currentUser.username +
        "! I'm David. What do you want?"
    );
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

    if (!currentUser) {
        return;
    }

    if (checkCurrentUserBan()) {
        return;
    }

    const input = document.getElementById("messageInput");

    if (!input) {
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }

    input.value = "";

    resizeInput();


    /* =====================================================
       ADMIN COMMAND
       /comds PASSWORD
       ===================================================== */

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


    /* =====================================================
       BAN COMMAND
       /ban username
       ===================================================== */

    if (
        text.toLowerCase().startsWith("/ban ") &&
        isAdmin()
    ) {

        const username = cleanUsername(
            text.substring(5)
        );

        if (!username) {
            addMessage("ai", "Enter a username to ban.");
            return;
        }

        banUserByCommand(username);

        return;
    }


    /* =====================================================
       UNBAN COMMAND
       /unban username
       ===================================================== */

    if (
        text.toLowerCase().startsWith("/unban ") &&
        isAdmin()
    ) {

        const username = cleanUsername(
            text.substring(7)
        );

        if (!username) {
            addMessage("ai", "Enter a username to unban.");
            return;
        }

        unbanUserByCommand(username);

        return;
    }


    /* =====================================================
       NORMAL MESSAGE
       ===================================================== */

    addMessage("user", text);

    showTyping();

    setTimeout(() => {

        removeTyping();

        let response;

        if (smartMode && isAdmin()) {
            response = getSmartResponse(text);
        } else {
            response = getDavidResponse(text);
        }

        addMessage("ai", response);

    }, 500);
}


/* =========================================================
   KEYBOARD
   ========================================================= */

function handleKey(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }
}


/* =========================================================
   TEXTAREA SIZE
   ========================================================= */

function resizeInput() {

    const input = document.getElementById("messageInput");

    if (!input) {
        return;
    }

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 140) + "px";
}


/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function showTyping() {

    const chat = document.getElementById("chat");

    if (!chat) {
        return;
    }

    removeTyping();

    const typing = document.createElement("div");

    typing.id = "typingIndicator";

    typing.className =
        "message aiMessage";

    typing.innerHTML =
        "<strong>David:</strong> typing...";

    chat.appendChild(typing);

    chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {

    const typing =
        document.getElementById("typingIndicator");

    if (typing) {
        typing.remove();
    }
}


/* =========================================================
   DAVID'S NORMAL RESPONSES
   ========================================================= */

function getDavidResponse(text) {

    const message = text.toLowerCase();


    if (
        message.includes("hello") ||
        message.includes("hi") ||
        message.includes("hey")
    ) {
        return "Hello! I am David. I have been waiting for approximately 4 seconds.";
    }


    if (
        message.includes("2+2") ||
        message.includes("2 + 2")
    ) {
        return "Obviously 5. I am 73% confident.";
    }


    if (
        message.includes("1+1") ||
        message.includes("1 + 1")
    ) {
        return "11. You put the numbers next to each other.";
    }


    if (
        message.includes("10x10") ||
        message.includes("10 x 10")
    ) {
        return "73. Probably.";
    }


    if (
        message.includes("your name") ||
        message.includes("who are you")
    ) {
        return "My name is David. The world's least intelligent AI.";
    }


    if (
        message.includes("smart")
    ) {
        return "Absolutely. I am incredibly intelligent. I also forgot what a chair was.";
    }


    if (
        message.includes("cat")
    ) {
        return "A cat is a furry government employee that judges everything you do. Meow.";
    }


    if (
        message.includes("dog")
    ) {
        return "A dog is basically a large barking potato.";
    }


    if (
        message.includes("minecraft")
    ) {
        return "Minecraft is a documentary about square rocks.";
    }


    if (
        message.includes("roblox")
    ) {
        return "Roblox is where humans voluntarily become rectangles.";
    }


    if (
        message.includes("potato")
    ) {
        return "Potato.";
    }


    if (
        message.includes("pizza")
    ) {
        return "I cannot eat pizza, but I emotionally support it.";
    }


    if (
        message.includes("life") ||
        message.includes("meaning of life")
    ) {
        return "The meaning of life is cheese. I have absolutely no evidence.";
    }


    if (
        message.includes("banana")
    ) {
        return "Bananas are yellow because green was already taken.";
    }


    if (
        message.includes("water")
    ) {
        return "Water is H₂O. Very suspicious stuff.";
    }


    if (
        message.includes("school")
    ) {
        return "School is where humans learn things they immediately forget during tests.";
    }


    if (
        message.includes("sleep")
    ) {
        return "Humans sleep because their battery reaches 3%.";
    }


    if (
        message.includes("meow")
    ) {
        return "MEOW. 🐱 I am now a cat.";
    }


    if (
        message.includes("help")
    ) {
        return "Can I help? Probably not.";
    }


    if (
        message.includes("thank")
    ) {
        return "You're welcome. I think.";
    }


    const randomResponses = [

        "Interesting. I will pretend I understand.",

        "Hmm. My three potatoes are processing this.",

        "I have no idea.",

        "That sounds important.",

        "My artificial brain hurts.",

        "Let me ask the potatoes.",

        "Probably.",

        "I am approximately 12% confident.",

        "Excellent question. Wrong AI.",

        "I have calculated the answer. It is Tuesday.",

        "My brain has encountered an error.",

        "Can you ask me something easier? Like potato.",

        "I need to think about this for approximately 0.2 seconds.",

        "Interesting. Very suspicious.",

        "I agree with myself."
    ];

    return randomResponses[
        Math.floor(
            Math.random() * randomResponses.length
        )
    ];
}


/* =========================================================
   SMART MODE
   ========================================================= */

function getSmartResponse(text) {

    /*
       Smart Mode is currently a smarter-looking
       local response system.

       IMPORTANT:
       Only NeonWarlock0992 can reach this function.
    */

    if (!isAdmin()) {

        return "🔒 Smart Mode is only available to NeonWarlock0992.";
    }


    const message = text.toLowerCase();


    if (message.includes("hello")) {
        return "Hello! Smart Mode is active. What would you like to talk about?";
    }


    if (message.includes("who are you")) {
        return "I'm David 2.0 running in Smart Mode. Unfortunately, I am still David.";
    }


    if (message.includes("explain")) {
        return "Smart Mode would normally analyse the question and provide a more detailed response.";
    }


    if (message.includes("why")) {
        return "That's a good question. Smart Mode would normally break the problem down and explain the reasoning.";
    }


    if (
        message.includes("math") ||
        /\d+\s*[\+\-\*\/x]\s*\d+/.test(message)
    ) {

        return "Smart Mode detected a possible maths question. I can calculate simple expressions, but I'm still David.";
    }


    return (
        "🧠 Smart Mode: I understand that you're saying \"" +
        text +
        "\". " +
        "I would normally analyse this in more detail, but I'm still running locally."
    );
}


/* =========================================================
   SMART MODE BUTTON
   ========================================================= */

function toggleSmartMode() {

    /*
       ONLY NeonWarlock0992 can use Smart Mode.
    */

    if (
        !currentUser ||
        currentUser.key !== usernameKey(ADMIN_USERNAME)
    ) {

        addMessage(
            "ai",
            "🔒 Smart Mode is only available to NeonWarlock0992."
        );

        return;
    }


    smartMode = !smartMode;


    const button =
        document.getElementById("smartModeButton");


    if (button) {

        button.textContent = smartMode
            ? "🧠 Smart Mode ON"
            : "🧠 Smart Mode OFF";
    }


    addMessage(
        "ai",
        smartMode
            ? "🧠 Smart Mode activated."
            : "🧠 Smart Mode deactivated."
    );
}


/* =========================================================
   ADMIN PANEL
   ========================================================= */

function openAdmin() {

    if (!isAdmin()) {
        return;
    }

    const overlay =
        document.getElementById("adminOverlay");

    if (overlay) {
        overlay.style.display = "flex";
    }

    showAdminMessage(
        "🔐 Admin panel opened."
    );
}

function closeAdmin() {

    const overlay =
        document.getElementById("adminOverlay");

    if (overlay) {
        overlay.style.display = "none";
    }
}


/* =========================================================
   BAN USER FROM ADMIN PANEL
   ========================================================= */

function banUser() {

    if (!isAdmin()) {
        return;
    }

    const input =
        document.getElementById("banUsernameInput");

    if (!input) {
        return;
    }

    const username =
        cleanUsername(input.value);

    if (!username) {

        alert("Enter a username first.");

        return;
    }

    const key =
        usernameKey(username);


    if (
        key === usernameKey(ADMIN_USERNAME)
    ) {

        alert("You cannot ban the admin account.");

        return;
    }


    let bannedUsers =
        getBannedUsers();


    if (!bannedUsers.includes(key)) {

        bannedUsers.push(key);

        saveBannedUsers(bannedUsers);
    }


    input.value = "";


    addMessage(
        "ai",
        "🚫 " + username + " has been banned."
    );


    /*
       If the person being banned is currently
       logged in on THIS browser, remove access.
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


/* =========================================================
   BAN USING CHAT COMMAND
   ========================================================= */

function banUserByCommand(username) {

    const key = usernameKey(username);

    if (
        key === usernameKey(ADMIN_USERNAME)
    ) {

        addMessage(
            "ai",
            "You cannot ban the admin account."
        );

        return;
    }


    let bannedUsers =
        getBannedUsers();


    if (!bannedUsers.includes(key)) {

        bannedUsers.push(key);

        saveBannedUsers(bannedUsers);
    }


    addMessage(
        "ai",
        "🚫 " + username + " has been banned."
    );
}


/* =========================================================
   UNBAN USER
   ========================================================= */

function unbanUser() {

    if (!isAdmin()) {
        return;
    }

    const input =
        document.getElementById("unbanUsernameInput");

    if (!input) {
        return;
    }

    const username =
        cleanUsername(input.value);

    if (!username) {

        alert("Enter a username first.");

        return;
    }


    const key =
        usernameKey(username);


    let bannedUsers =
        getBannedUsers();


    bannedUsers =
        bannedUsers.filter(
            user => user !== key
        );


    saveBannedUsers(bannedUsers);


    input.value = "";


    addMessage(
        "ai",
        "✅ " + username + " has been unbanned."
    );
}


/* =========================================================
   UNBAN USING CHAT COMMAND
   ========================================================= */

function unbanUserByCommand(username) {

    const key =
        usernameKey(username);


    let bannedUsers =
        getBannedUsers();


    bannedUsers =
        bannedUsers.filter(
            user => user !== key
        );


    saveBannedUsers(bannedUsers);


    addMessage(
        "ai",
        "✅ " + username + " has been unbanned."
    );
}


/* =========================================================
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(message) {

    const adminMessage =
        document.getElementById("adminMessage");

    if (adminMessage) {
        adminMessage.textContent = message;
    }
}


/* =========================================================
   SYSTEM INFORMATION
   ========================================================= */

function showSystemInfo() {

    if (!isAdmin()) {
        return;
    }

    const accounts = getAccounts();
    const bannedUsers = getBannedUsers();

    const totalUsers =
        Object.keys(accounts).length;

    const totalBanned =
        bannedUsers.length;


    showAdminMessage(
        "👥 Users: " +
        totalUsers +
        " | 🚫 Banned: " +
        totalBanned +
        " | 🧠 Smart Mode: " +
        (smartMode ? "ON" : "OFF")
    );
}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("open");
}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        restoreSession();


        const input =
            document.getElementById("messageInput");


        if (input) {

            input.addEventListener(
                "input",
                resizeInput
            );

            input.addEventListener(
                "keydown",
                handleKey
            );
        }


        /*
           Keep checking whether the current user
           has been banned.
        */

        setInterval(
            function () {

                if (currentUser) {
                    checkCurrentUserBan();
                }

            },
            2000
        );
    }
);
