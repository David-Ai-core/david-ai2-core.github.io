/* =========================================
   DAVID 2.0
   MAIN JAVASCRIPT
   ========================================= */


/* =========================================
   SETTINGS
   ========================================= */

const ADMIN_USERNAME = "NeonWarlock0992";

const ADMIN_PASSWORD = "FredWillNotHackThis*";

let currentUser = null;

let smartMode = false;


/* =========================================
   LOCAL STORAGE
   ========================================= */

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


/* =========================================
   USERNAME HELPERS
   ========================================= */

function cleanUsername(username) {

    return username
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 30);

}


function usernameKey(username) {

    return cleanUsername(username).toLowerCase();

}


/* =========================================
   ADMIN CHECK
   ========================================= */

function isAdmin() {

    if (!currentUser) {
        return false;
    }

    return (
        currentUser.key ===
        usernameKey(ADMIN_USERNAME)
    );

}


/* =========================================
   BAN CHECK
   ========================================= */

function isUserBanned(usernameKeyValue) {

    const bannedUsers = getBannedUsers();

    return bannedUsers.includes(usernameKeyValue);

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


/* =========================================
   BANNED SCREEN
   ========================================= */

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


function hideBannedScreen() {

    document.getElementById(
        "bannedScreen"
    ).style.display = "none";

}


/* =========================================
   LOGIN
   ========================================= */

function joinDavid() {

    const input =
        document.getElementById("usernameInput");

    const message =
        document.getElementById("loginMessage");

    const username =
        cleanUsername(input.value);

    if (!username) {

        message.textContent =
            "Please enter a username.";

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


    hideBannedScreen();

    loadApp();

}


function handleLoginKey(event) {

    if (event.key === "Enter") {

        joinDavid();

    }

}


/* =========================================
   LOAD APP
   ========================================= */

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
        "app"
    ).style.display = "block";


    const smartButton =
        document.getElementById(
            "smartModeButton"
        );


    /*
       SMART MODE SECURITY

       Only NeonWarlock0992 can even
       see the Smart Mode button.
    */

    if (smartButton) {

        if (isAdmin()) {

            smartButton.style.display =
                "block";

            smartButton.textContent =
                smartMode
                    ? "🧠 Smart Mode ON"
                    : "🧠 Smart Mode OFF";

        } else {

            smartButton.style.display =
                "none";

            smartMode = false;

        }

    }


    restoreSavedMessages();

}


/* =========================================
   SESSION RESTORE
   ========================================= */

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


/* =========================================
   LOGOUT
   ========================================= */

function logout() {

    currentUser = null;

    smartMode = false;


    localStorage.removeItem(
        "davidCurrentUser"
    );


    document.getElementById(
        "app"
    ).style.display = "none";


    document.getElementById(
        "adminOverlay"
    ).style.display = "none";


    document.getElementById(
        "loginScreen"
    ).style.display = "flex";


    document.getElementById(
        "usernameInput"
    ).value = "";


    document.getElementById(
        "chat"
    ).innerHTML = "";


    const smartButton =
        document.getElementById(
            "smartModeButton"
        );


    if (smartButton) {

        smartButton.style.display =
            "none";

    }

}


/* =========================================
   CHAT STORAGE
   ========================================= */

function getChatKey() {

    if (!currentUser) {
        return "davidChat_unknown";
    }

    return (
        "davidChat_" +
        currentUser.key
    );

}


function saveMessage(sender, text) {

    const key = getChatKey();

    const messages =
        JSON.parse(
            localStorage.getItem(key) || "[]"
        );


    messages.push({

        sender: sender,

        text: text,

        time: Date.now()

    });


    localStorage.setItem(
        key,
        JSON.stringify(messages)
    );

}


function restoreSavedMessages() {

    const chat =
        document.getElementById("chat");


    if (!chat || !currentUser) {
        return;
    }


    chat.innerHTML = "";


    const messages =
        JSON.parse(
            localStorage.getItem(
                getChatKey()
            ) || "[]"
        );


    if (messages.length === 0) {

        addMessage(
            "ai",
            "Hello " +
            currentUser.username +
            "! 🤪 I am David 2.0."
        );

        return;
    }


    messages.forEach(message => {

        addMessage(
            message.sender,
            message.text,
            false
        );

    });

}


/* =========================================
   ADD MESSAGE
   ========================================= */

function addMessage(
    sender,
    text,
    save = true
) {

    const chat =
        document.getElementById("chat");


    if (!chat) {
        return;
    }


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message " + sender;


    const name =
        document.createElement("div");


    name.className =
        "messageName";


    name.textContent =
        sender === "user"
            ? (currentUser
                ? currentUser.username
                : "You")
            : "David";


    const bubble =
        document.createElement("div");


    bubble.className =
        "messageBubble";


    bubble.textContent = text;


    wrapper.appendChild(name);

    wrapper.appendChild(bubble);

    chat.appendChild(wrapper);


    chat.scrollTop =
        chat.scrollHeight;


    if (save) {

        saveMessage(
            sender,
            text
        );

    }

}


/* =========================================
   NEW CHAT
   ========================================= */

function newChat() {

    if (!currentUser) {
        return;
    }


    localStorage.removeItem(
        getChatKey()
    );


    const chat =
        document.getElementById("chat");


    chat.innerHTML = "";


    addMessage(
        "ai",
        "New chat started. 🧠"
    );

}


/* =========================================
   RESTORE CHAT
   ========================================= */

function restoreChat() {

    restoreSavedMessages();

}


/* =========================================
   SEND MESSAGE
   ========================================= */

function sendMessage() {

    if (!currentUser) {
        return;
    }


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


    /* =====================================
       ADMIN COMMAND
       /comds PASSWORD
       ===================================== */

    if (
        text ===
        "/comds " +
        ADMIN_PASSWORD
        &&
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


    /* =====================================
       BAN COMMAND
       ===================================== */

    if (
        text.toLowerCase()
            .startsWith("/ban ")
        &&
        isAdmin()
    ) {

        const username =
            cleanUsername(
                text.slice(5)
            );


        addMessage(
            "user",
            text
        );


        if (username) {

            banUserByName(username);

        }


        return;
    }


    /* =====================================
       UNBAN COMMAND
       ===================================== */

    if (
        text.toLowerCase()
            .startsWith("/unban ")
        &&
        isAdmin()
    ) {

        const username =
            cleanUsername(
                text.slice(7)
            );


        addMessage(
            "user",
            text
        );


        if (username) {

            unbanUserByName(username);

        }


        return;
    }


    /* =====================================
       NORMAL MESSAGE
       ===================================== */

    addMessage(
        "user",
        text
    );


    showTyping();


    setTimeout(() => {

        removeTyping();


        let response;


        if (
            smartMode &&
            isAdmin()
        ) {

            response =
                getSmartResponse(text);

        } else {

            response =
                getDavidResponse(text);

        }


        addMessage(
            "ai",
            response
        );


    }, 500);

}


/* =========================================
   KEYBOARD
   ========================================= */

function handleKey(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

}


/* =========================================
   TYPING
   ========================================= */

function showTyping() {

    removeTyping();


    const chat =
        document.getElementById("chat");


    const typing =
        document.createElement("div");


    typing.id =
        "typingMessage";


    typing.className =
        "message ai";


    typing.innerHTML =
        `
        <div class="messageName">
            David
        </div>

        <div class="messageBubble">
            David is thinking... 🤔
        </div>
        `;


    chat.appendChild(typing);


    chat.scrollTop =
        chat.scrollHeight;

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typingMessage"
        );


    if (typing) {

        typing.remove();

    }

}


/* =========================================
   DAVID RESPONSES
   ========================================= */

function getDavidResponse(text) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes("hello") ||
        lower.includes("hi")
    ) {

        return (
            "Hello! 👋 I am David. " +
            "I have successfully used 3 potatoes today."
        );

    }


    if (
        lower.includes("2+2") ||
        lower.includes("2 + 2")
    ) {

        return "5. Obviously. I am 73% confident.";

    }


    if (
        lower.includes("1+1") ||
        lower.includes("1 + 1")
    ) {

        return "11. You put the numbers next to each other.";

    }


    if (
        lower.includes("10x10") ||
        lower.includes("10 x 10") ||
        lower.includes("10 × 10")
    ) {

        return "73. Unless the 10s are angry.";

    }


    if (lower.includes("cat")) {

        return (
            "A cat is a furry government employee " +
            "that judges everything you do. 🐱"
        );

    }


    if (lower.includes("dog")) {

        return (
            "A dog is basically a large cat " +
            "with a barking upgrade."
        );

    }


    if (lower.includes("minecraft")) {

        return (
            "Minecraft is a documentary about square rocks."
        );

    }


    if (lower.includes("roblox")) {

        return (
            "Roblox is where humans voluntarily " +
            "turn themselves into rectangles."
        );

    }


    if (lower.includes("smart")) {

        return (
            "Absolutely. I am incredibly intelligent. " +
            "I also recently forgot what a chair was."
        );

    }


    if (
        lower.includes("your name") ||
        lower.includes("who are you")
    ) {

        return (
            "My name is David. 🤪"
        );

    }


    if (lower.includes("banana")) {

        return (
            "Bananas are yellow because green was already taken."
        );

    }


    if (lower.includes("water")) {

        return (
            "Water is H₂O. " +
            "Very suspicious chemistry."
        );

    }


    if (
        lower.includes("meaning of life") ||
        lower.includes("life")
    ) {

        return (
            "The meaning of life is... cheese. 🧀"
        );

    }


    const randomResponses = [

        "Probably Tuesday.",

        "I have no idea.",

        "Ask a potato.",

        "Interesting. I will pretend I understand.",

        "My brain is currently buffering.",

        "That sounds complicated. Have you tried turning it off and on again?",

        "I calculated the answer using advanced potato technology.",

        "Yes.",

        "No.",

        "Maybe.",

        "I am approximately 4% confident.",

        "ERROR: David has become confused.",

        "That is a very good question. Unfortunately, I am David."

    ];


    return randomResponses[
        Math.floor(
            Math.random() *
            randomResponses.length
        )
    ];

}


/* =========================================
   SMART MODE
   ========================================= */

function getSmartResponse(text) {

    /*
       SECOND SECURITY CHECK.

       Even if somebody manually tries to
       call Smart Mode, it will not work
       unless they are NeonWarlock0992.
    */

    if (!isAdmin()) {

        return getDavidResponse(text);

    }


    const lower =
        text.toLowerCase();


    if (
        lower.includes("hello") ||
        lower.includes("hi")
    ) {

        return (
            "Hello! Smart Mode is active. 🧠 " +
            "I can give you more detailed responses."
        );

    }


    if (
        lower.includes("what is") ||
        lower.includes("explain")
    ) {

        return (
            "Smart Mode is analysing your question: " +
            text +
            "\n\nThis is the more advanced response system for David 2.0."
        );

    }


    return (
        "🧠 Smart Mode:\n\n" +
        "I understand your message as:\n" +
        "\"" +
        text +
        "\"\n\n" +
        "David is attempting to produce a more useful answer."
    );

}


/* =========================================
   SMART MODE TOGGLE
   ========================================= */

function toggleSmartMode() {

    /*
       ABSOLUTE ADMIN-ONLY CHECK
    */

    if (
        !currentUser ||
        currentUser.key !==
        usernameKey(ADMIN_USERNAME)
    ) {

        return;

    }


    smartMode =
        !smartMode;


    const button =
        document.getElementById(
            "smartModeButton"
        );


    if (button) {

        button.textContent =
            smartMode
                ? "🧠 Smart Mode ON"
                : "🧠 Smart Mode OFF";

    }


    addMessage(
        "ai",
        smartMode
            ? "🧠 Smart Mode enabled."
            : "🧠 Smart Mode disabled."
    );

}


/* =========================================
   ADMIN PANEL
   ========================================= */

function openAdmin() {

    if (!isAdmin()) {

        return;

    }


    document.getElementById(
        "adminOverlay"
    ).style.display = "flex";

}


function closeAdmin() {

    document.getElementById(
        "adminOverlay"
    ).style.display = "none";

}


/* =========================================
   BAN USER
   ========================================= */

function banUser() {

    if (!isAdmin()) {
        return;
    }


    const input =
        document.getElementById(
            "banUsernameInput"
        );


    const username =
        cleanUsername(input.value);


    if (!username) {

        alert(
            "Enter a username first."
        );

        return;
    }


    banUserByName(username);


    input.value = "";

}


function banUserByName(username) {

    if (!isAdmin()) {
        return;
    }


    const key =
        usernameKey(username);


    if (
        key ===
        usernameKey(ADMIN_USERNAME)
    ) {

        alert(
            "You cannot ban the admin account."
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
       If the currently logged-in account
       is the account being banned, remove
       their session immediately.
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


/* =========================================
   UNBAN USER
   ========================================= */

function unbanUser() {

    if (!isAdmin()) {
        return;
    }


    const input =
        document.getElementById(
            "unbanUsernameInput"
        );


    const username =
        cleanUsername(input.value);


    if (!username) {

        alert(
            "Enter a username first."
        );

        return;
    }


    unbanUserByName(username);


    input.value = "";

}


function unbanUserByName(username) {

    if (!isAdmin()) {
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


/* =========================================
   SYSTEM INFO
   ========================================= */

function showSystemInfo() {

    addMessage(
        "ai",
        "David 2.0 System Status:\n\n" +
        "Brain: ❌\n" +
        "Intelligence: ❌\n" +
        "Potatoes: ✅\n" +
        "Meowing: ✅\n" +
        "Confidence: 100%\n" +
        "Accuracy: questionable"
    );

}


/* =========================================
   PERIODIC BAN CHECK
   ========================================= */

setInterval(() => {

    if (currentUser) {

        checkCurrentUserBan();

    }

}, 1000);


/* =========================================
   START DAVID
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        restoreSession();

    }
);
