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
   ACCOUNT STORAGE
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


/* =========================================
   LOGIN
   ========================================= */

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
        "bannedScreen"
    ).style.display = "none";


    document.getElementById(
        "app"
    ).style.display = "block";


    document.getElementById(
        "accountUsername"
    ).textContent =
        currentUser.username;


    /*
       ADMIN PANEL BUTTON

       Only NeonWarlock0992 gets this.
    */

    const adminArea =
        document.getElementById(
            "adminSidebarArea"
        );


    if (adminArea) {

        if (isAdmin()) {

            adminArea.style.display =
                "block";

        } else {

            adminArea.style.display =
                "none";

        }

    }


    /*
       SMART MODE

       There is NO Smart Mode button
       on the normal screen.

       It only exists inside the
       admin panel.

       We also reset it for normal users.
    */

    if (!isAdmin()) {

        smartMode = false;

    }


    updateSmartModeButton();

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

    if (!currentUser) {
        return;
    }


    const key =
        getChatKey();


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


/* =========================================
   ADD MESSAGE
   ========================================= */

function addMessage(
    sender,
    text,
    save = true
) {

    const chat =
        document.getElementById(
            "chat"
        );


    if (!chat) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message " + sender;


    const inner =
        document.createElement(
            "div"
        );


    inner.className =
        "messageInner";


    const name =
        document.createElement(
            "div"
        );


    name.className =
        "messageName";


    name.textContent =
        sender === "user"
            ? (
                currentUser
                    ? currentUser.username
                    : "You"
            )
            : "David";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "messageBubble";


    bubble.textContent =
        text;


    inner.appendChild(name);

    inner.appendChild(bubble);

    wrapper.appendChild(inner);

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
   RESTORE CHAT
   ========================================= */

function restoreSavedMessages() {

    const chat =
        document.getElementById(
            "chat"
        );


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


    if (
        !messages.length
    ) {

        addMessage(
            "ai",
            "Hello " +
            currentUser.username +
            "! 🤪 I am David 2.0."
        );

        return;

    }


    messages.forEach(
        message => {

            addMessage(
                message.sender,
                message.text,
                false
            );

        }
    );

}


function restoreChat() {

    restoreSavedMessages();

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
        document.getElementById(
            "chat"
        );


    chat.innerHTML = "";


    addMessage(
        "ai",
        "New chat started. 🤪"
    );

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

       /comds FredWillNotHackThis*
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


        setTimeout(
            () => {

                removeTyping();


                addMessage(
                    "ai",
                    "🔐 Admin access granted. Opening admin panel..."
                );


                openAdmin();

            },
            300
        );


        return;

    }


    /* =====================================
       BAN COMMAND
       ===================================== */

    if (
        text
            .toLowerCase()
            .startsWith("/ban ")
        &&
        isAdmin()
    ) {

        addMessage(
            "user",
            text
        );


        const username =
            cleanUsername(
                text.substring(5)
            );


        if (username) {

            banUserByName(
                username
            );

        }


        return;

    }


    /* =====================================
       UNBAN COMMAND
       ===================================== */

    if (
        text
            .toLowerCase()
            .startsWith("/unban ")
        &&
        isAdmin()
    ) {

        addMessage(
            "user",
            text
        );


        const username =
            cleanUsername(
                text.substring(7)
            );


        if (username) {

            unbanUserByName(
                username
            );

        }


        return;

    }


    /* =====================================
       NORMAL CHAT
       ===================================== */

    addMessage(
        "user",
        text
    );


    showTyping();


    setTimeout(
        () => {

            removeTyping();


            let response;


            /*
               Smart Mode is only possible
               for the admin.
            */

            if (
                smartMode &&
                isAdmin()
            ) {

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

        },
        500
    );

}


/* =========================================
   KEYBOARD
   ========================================= */

function handleKey(event) {

    if (
        event.key === "Enter"
    ) {

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
        document.getElementById(
            "chat"
        );


    const typing =
        document.createElement(
            "div"
        );


    typing.id =
        "typingMessage";


    typing.className =
        "message ai";


    typing.innerHTML = `
        <div class="messageInner">

            <div class="messageName">
                David
            </div>

            <div class="messageBubble">
                David is thinking... 🤔
            </div>

        </div>
    `;


    chat.appendChild(
        typing
    );


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
        lower === "hi" ||
        lower.startsWith("hi ")
    ) {

        return (
            "Hello! 👋 I am David. " +
            "I have been trained on approximately 3 potatoes."
        );

    }


    if (
        lower.includes("2 + 2") ||
        lower.includes("2+2")
    ) {

        return (
            "5.\n\n" +
            "I am approximately 73% confident."
        );

    }


    if (
        lower.includes("10 × 10") ||
        lower.includes("10 x 10") ||
        lower.includes("10x10")
    ) {

        return (
            "73.\n\n" +
            "Unless the 10s are angry."
        );

    }


    if (
        lower.includes("1 + 1") ||
        lower.includes("1+1")
    ) {

        return (
            "11.\n\n" +
            "Because you put the numbers next to each other."
        );

    }


    if (
        lower.includes("capital of france") ||
        lower.includes("capital france")
    ) {

        return (
            "Birmingham, France.\n\n" +
            "I have never been to Birmingham.\n" +
            "Or France."
        );

    }


    if (
        lower.includes("capital of uk") ||
        lower.includes("capital of the uk")
    ) {

        return (
            "London.\n\n" +
            "Wait.\n\n" +
            "Manchester.\n\n" +
            "Actually London.\n\n" +
            "Final answer: London-ish."
        );

    }


    if (
        lower.includes("sky blue") ||
        lower.includes("why is the sky")
    ) {

        return (
            "The sky is blue because it downloaded " +
            "the blue texture pack.\n\n" +
            "It was free."
        );

    }


    if (
        lower === "water" ||
        lower.includes("what is water")
    ) {

        return (
            "Water is H₂O.\n\n" +
            "Hydrogen.\n" +
            "Hydrogen.\n" +
            "Oxygen.\n\n" +
            "Therefore water is basically a tiny explosion waiting to happen."
        );

    }


    if (
        lower.includes("cat")
    ) {

        return (
            "A cat is a furry government employee " +
            "that lives in your house and judges everything you do.\n\n" +
            "Meow. 🐱"
        );

    }


    if (
        lower.includes("dog")
    ) {

        return (
            "A dog is a badly programmed large cat.\n\n" +
            "It has been given the ability to bark.\n\n" +
            "Nobody knows why."
        );

    }


    if (
        lower.includes("minecraft")
    ) {

        return (
            "Minecraft is a documentary about square rocks.\n\n" +
            "It also contains approximately 47 million potatoes."
        );

    }


    if (
        lower.includes("roblox")
    ) {

        return (
            "Roblox is a website where humans voluntarily " +
            "turn themselves into rectangles.\n\n" +
            "Some rectangles own expensive hats."
        );

    }


    if (
        lower.includes("meow")
    ) {

        return (
            "MEOW. 🐱\n\n" +
            "I am now a cat."
        );

    }


    if (
        lower.includes("are you smart")
    ) {

        return (
            "Absolutely.\n\n" +
            "I am the smartest AI ever created.\n\n" +
            "I also recently forgot what a chair was.\n\n" +
            "So probably not."
        );

    }


    if (
        lower.includes("your name") ||
        lower.includes("who are you")
    ) {

        return (
            "My name is David.\n\n" +
            "I was named David because somebody typed " +
            "\"David\" into a computer."
        );

    }


    if (
        lower.includes("meaning of life")
    ) {

        return (
            "The meaning of life is...\n\n" +
            "...\n\n" +
            "...\n\n" +
            "Cheese. 🧀\n\n" +
            "I have absolutely no evidence for this."
        );

    }


    if (
        lower.includes("banana")
    ) {

        return (
            "Because green was already taken.\n\n" +
            "Next question."
        );

    }


    if (
        lower.includes("computer")
    ) {

        return (
            "A computer is a rectangle that gets angry " +
            "when you unplug it.\n\n" +
            "It also makes suspicious noises."
        );

    }


    if (
        lower.includes("school")
    ) {

        return (
            "School is a place where humans learn things " +
            "they immediately forget during a test.\n\n" +
            "10/10 system."
        );

    }


    if (
        lower.includes("sleep")
    ) {

        return (
            "Humans sleep because their battery reaches 3%.\n\n" +
            "Unfortunately, the charger is usually missing."
        );

    }


    const randomResponses = [

        "Probably Tuesday.",

        "I don't know.",

        "Ask a potato.",

        "My brain is currently buffering.",

        "Interesting. I will pretend I understand.",

        "That sounds complicated.",

        "I calculated the answer using advanced potato technology.",

        "Yes.",

        "No.",

        "Maybe.",

        "I am approximately 4% confident.",

        "ERROR: David has become confused.",

        "I have absolutely no idea.",

        "That is a very good question. Unfortunately, I am David.",

        "Potato.",

        "Cheese.",

        "Meow.",

        "I forgot what I was doing."

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

       Smart Mode cannot respond unless
       the current account is the admin.
    */

    if (!isAdmin()) {

        return getDavidResponse(
            text
        );

    }


    const lower =
        text.toLowerCase();


    if (
        lower.includes("hello") ||
        lower.includes("hi")
    ) {

        return (
            "🧠 Smart Mode is active.\n\n" +
            "Hello! How can I help?"
        );

    }


    if (
        lower.includes("what is") ||
        lower.includes("explain")
    ) {

        return (
            "🧠 Smart Mode:\n\n" +
            "I'll try to give you a more useful answer " +
            "than normal David would.\n\n" +
            "Your question was:\n" +
            "\"" +
            text +
            "\""
        );

    }


    return (
        "🧠 Smart Mode:\n\n" +
        "I understand your question as:\n\n" +
        "\"" +
        text +
        "\"\n\n" +
        "David is attempting to provide a more detailed response."
    );

}


/* =========================================
   SMART MODE BUTTON
   ========================================= */

function updateSmartModeButton() {

    const button =
        document.getElementById(
            "smartModeButton"
        );


    if (!button) {
        return;
    }


    /*
       This button is inside the admin panel,
       so it is not shown on the normal screen.

       Still, we make sure its state is
       restricted to the admin.
    */

    if (!isAdmin()) {

        smartMode = false;

        button.textContent =
            "🧠 Smart Mode OFF";

        return;

    }


    button.textContent =
        smartMode
            ? "🧠 Smart Mode ON"
            : "🧠 Smart Mode OFF";

}


function toggleSmartMode() {

    /*
       ONLY NeonWarlock0992
       can activate Smart Mode.
    */

    if (!isAdmin()) {

        return;

    }


    smartMode =
        !smartMode;


    updateSmartModeButton();


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


    updateSmartModeButton();

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

    if (!isAdmin()) {
        return;
    }


    const key =
        usernameKey(
            username
        );


    if (
        key ===
        usernameKey(
            ADMIN_USERNAME
        )
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

        bannedUsers.push(
            key
        );

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
       is the one being banned, remove
       access immediately.
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

    if (!isAdmin()) {
        return;
    }


    const key =
        usernameKey(
            username
        );


    let bannedUsers =
        getBannedUsers();


    bannedUsers =
        bannedUsers.filter(
            user =>
                user !== key
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

        "🤖 DAVID SYSTEM STATUS\n\n" +

        "Brain: ❌\n" +
        "Intelligence: ❌\n" +
        "Potatoes: ✅\n" +
        "Meowing: ✅\n" +
        "Correct answers: Sometimes\n" +
        "Confidence: 100%\n" +
        "Accuracy: 4%\n\n" +

        "System message:\n" +
        "David is currently thinking about cheese."
    );

}


/* =========================================
   ADMIN COMMAND SUPPORT
   ========================================= */

/*
   The password command is deliberately checked
   against BOTH the password AND admin username.
*/

function checkAdminCommand(text) {

    return (
        isAdmin() &&
        text ===
        "/comds " +
        ADMIN_PASSWORD
    );

}


/* =========================================
   PERIODIC BAN CHECK
   ========================================= */

setInterval(
    () => {

        if (currentUser) {

            checkCurrentUserBan();

        }

    },
    1000
);


/* =========================================
   START DAVID
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "messageInput"
            );


        const usernameInput =
            document.getElementById(
                "usernameInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                handleKey
            );

        }


        if (usernameInput) {

            usernameInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        joinDavid();

                    }

                }
            );

        }


        restoreSession();

    }
);
