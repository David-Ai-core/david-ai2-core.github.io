const SUPABASE_URL = "https://ntivetlhbcqyfapmwxrq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_SMk0jfRtAuCe0EMguZN8MQ_xlJcHDXI";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);/* ==================================================
   DAVID 2.0
   MAIN JAVASCRIPT
   ================================================== */


/* ==============================
   SUPABASE
   ============================== */


/* ==============================
   SETTINGS
   ============================== */

const ADMIN_USERNAME =
    "NeonWarlock0992";

let currentUser = null;

let smartMode = false;

let currentChat = [];


/* ==============================
   USERNAME SYSTEM
   ============================== */

function cleanUsername(username) {

    return String(username || "")
        .trim()
        .slice(0, 20);

}


function isValidUsername(username) {

    return /^[a-zA-Z0-9]+$/.test(username);

}


function usernameKey(username) {

    return cleanUsername(username)
        .toLowerCase();

}


/* ==============================
   BAN SCREEN
   ============================== */

function showBannedScreen() {

    const login =
        document.getElementById(
            "loginScreen"
        );

    const app =
        document.getElementById(
            "app"
        );

    const admin =
        document.getElementById(
            "adminOverlay"
        );

    const banned =
        document.getElementById(
            "bannedScreen"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (app) {

        app.style.display =
            "none";

    }


    if (admin) {

        admin.style.display =
            "none";

    }


    if (banned) {

        banned.style.display =
            "flex";

    }

}


/* ==============================
   SUPABASE BAN CHECK
   ============================== */

async function isUserBanned() {

    if (!currentUser) {

        return false;

    }


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "is_david_banned"
        );


    if (error) {

        console.error(
            "Ban check failed:",
            error
        );

        return false;

    }


    return data === true;

}


async function checkCurrentUserBan() {

    if (!currentUser) {

        return false;

    }


    const banned =
        await isUserBanned();


    if (banned) {

        showBannedScreen();

        return true;

    }


    return false;

}


/* ==============================
   LOGIN
   ============================== */

async function joinDavid() {

    const input =
        document.getElementById(
            "usernameInput"
        );

    const message =
        document.getElementById(
            "loginMessage"
        );


    const username =
        cleanUsername(
            input
                ? input.value
                : ""
        );


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


    if (!isValidUsername(username)) {

        message.textContent =
            "Username can only contain letters and numbers.";

        return;

    }


    message.textContent =
        "Connecting to David...";


    try {

        /*
         * Get existing Supabase session.
         */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth
                .getSession();


        if (sessionError) {

            throw sessionError;

        }


        /*
         * If there isn't a session,
         * create an anonymous account.
         */

        if (!sessionData.session) {

            const {
                error
            } =
                await supabaseClient.auth
                    .signInAnonymously();


            if (error) {

                throw error;

            }

        }


        /*
         * Create the David profile.
         */

const {
    data: profileData,
    error: profileError
} =
    await supabaseClient.rpc(
        "create_or_get_david_profile",
        {
            requested_username:
                username
        }
    );

if (profileError) {
    throw profileError;
}

const profile = profileData?.[0];

if (!profile) {
    throw new Error(
        "Could not load your David profile."
    );
}

        if (profileError) {

            throw profileError;

        }


        /*
         * Get the profile.
         */

        const {
            data: profile,
            error: getProfileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "username, role"
                )
                .single();


        if (getProfileError) {

            throw getProfileError;

        }


        currentUser = {

            username:
                profile.username,

            key:
                usernameKey(
                    profile.username
                ),

            role:
                profile.role || "user"

        };


        /*
         * Check the server-side ban.
         */

        if (
            await checkCurrentUserBan()
        ) {

            return;

        }


        localStorage.setItem(
            "davidCurrentUser",
            currentUser.key
        );


        message.textContent =
            "";


        loadApp();


    } catch (error) {

        console.error(
            "Supabase login error:",
            error
        );


        message.textContent =
            error.message ||
            "Could not connect to David.";

    }

}


/* ==============================
   LOAD APP
   ============================== */

function loadApp() {

    if (!currentUser) {

        return;

    }


    const login =
        document.getElementById(
            "loginScreen"
        );

    const banned =
        document.getElementById(
            "bannedScreen"
        );

    const app =
        document.getElementById(
            "app"
        );

    const accountName =
        document.getElementById(
            "accountName"
        );


    if (login) {

        login.style.display =
            "none";

    }


    if (banned) {

        banned.style.display =
            "none";

    }


    if (app) {

        app.style.display =
            "flex";

    }


    if (accountName) {

        accountName.textContent =
            currentUser.username;

    }


    updateSmartButton();

    loadSidebar();

}


/* ==============================
   RESTORE SESSION
   ============================== */

async function restoreSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            throw error;

        }


        if (!data.session) {

            return;

        }


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "username, role"
                )
                .single();


        if (profileError) {

            console.error(
                "Profile restore failed:",
                profileError
            );

            return;

        }


        currentUser = {

            username:
                profile.username,

            key:
                usernameKey(
                    profile.username
                ),

            role:
                profile.role || "user"

        };


        if (
            await checkCurrentUserBan()
        ) {

            return;

        }


        loadApp();


    } catch (error) {

        console.error(
            "Session restore error:",
            error
        );

    }

}


/* ==============================
   LOGOUT
   ============================== */

async function logout() {

    await supabaseClient.auth
        .signOut();


    localStorage.removeItem(
        "davidCurrentUser"
    );


    currentUser = null;

    currentChat = [];


    const app =
        document.getElementById(
            "app"
        );

    const banned =
        document.getElementById(
            "bannedScreen"
        );

    const login =
        document.getElementById(
            "loginScreen"
        );

    const input =
        document.getElementById(
            "usernameInput"
        );


    if (app) {

        app.style.display =
            "none";

    }


    if (banned) {

        banned.style.display =
            "none";

    }


    if (login) {

        login.style.display =
            "flex";

    }


    if (input) {

        input.value = "";

    }

}


/* ==============================
   NEW CHAT
   ============================== */

function newChat() {

    if (!currentUser) {

        return;

    }


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


    chat.appendChild(
        welcome
    );

}


/* ==============================
   RESTORE CHAT
   ============================== */

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


    currentChat.forEach(
        message => {

            addMessage(
                message.type,
                message.text,
                false
            );

        }
    );

}


/* ==============================
   SAVE MESSAGE
   ============================== */

function saveMessage(
    type,
    text
) {

    currentChat.push({

        type: type,

        text: text

    });

}


/* ==============================
   ADD MESSAGE
   ============================== */

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

async function sendMessage() {

    if (!currentUser) {

        return;

    }


    if (
        await checkCurrentUserBan()
    ) {

        return;

    }


    const input =
        document.getElementById(
            "messageInput"
        );


    const text =
        input
            ? input.value.trim()
            : "";


    if (!text) {

        return;

    }


    input.value = "";

    resizeInput();


    const lower =
        text.toLowerCase();


    /* =========================
       ADMIN COMMAND
       ========================= */

    if (
        lower === "/comds" &&
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


    /* =========================
       BAN COMMAND
       ========================= */

    if (
        lower.startsWith(
            "/ban "
        )
    ) {

        addMessage(
            "user",
            text
        );


        if (!isAdmin()) {

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


        if (!username) {

            addMessage(
                "ai",
                "Please enter a username."
            );

            return;

        }


        await banUserByName(
            username
        );


        return;

    }


    /* =========================
       UNBAN COMMAND
       ========================= */

    if (
        lower.startsWith(
            "/unban "
        )
    ) {

        addMessage(
            "user",
            text
        );


        if (!isAdmin()) {

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


        if (!username) {

            addMessage(
                "ai",
                "Please enter a username."
            );

            return;

        }


        await unbanUserByName(
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


    setTimeout(
        () => {

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

        },
        500
    );

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
   RESIZE INPUT
   ============================== */

function resizeInput() {

    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) {

        return;

    }


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            140
        ) + "px";

}


/* ==============================
   TYPING INDICATOR
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
        lower.includes(
            "capital of france"
        )
    ) {

        return "Birmingham, France.";

    }


    if (
        lower.includes(
            "capital of the uk"
        ) ||
        lower.includes(
            "capital of uk"
        )
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

    return (
        !!currentUser &&
        currentUser.role === "admin"
    );

}


/* ==============================
   OPEN ADMIN
   ============================== */

function openAdmin() {

    if (!isAdmin()) {

        return;

    }


    const overlay =
        document.getElementById(
            "adminOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "flex";

    }


    updateAdminSmartStatus();

}


function closeAdmin() {

    const overlay =
        document.getElementById(
            "adminOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "none";

    }

}


/* ==============================
   SMART MODE BUTTON
   ============================== */

function toggleSmartMode() {

    if (!currentUser) {

        return;

    }


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


    if (!button) {

        return;

    }


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


    if (!status) {

        return;

    }


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

async function banUser() {

    if (!isAdmin()) {

        return;

    }


    const input =
        document.getElementById(
            "banUsernameInput"
        );


    const username =
        cleanUsername(
            input
                ? input.value
                : ""
        );


    if (!username) {

        alert(
            "Enter a username first."
        );

        return;

    }


    await banUserByName(
        username
    );


    if (input) {

        input.value = "";

    }

}


async function banUserByName(
    username
) {

    if (!isAdmin()) {

        return;

    }


    if (
        usernameKey(username) ===
        usernameKey(ADMIN_USERNAME)
    ) {

        addMessage(
            "ai",
            "❌ You cannot ban the admin account."
        );

        return;

    }


    const {
        error
    } =
        await supabaseClient.rpc(
            "admin_ban_david_user",
            {
                target_username:
                    username,

                ban_reason:
                    "Banned by David admin"
            }
        );


    if (error) {

        console.error(
            "Ban failed:",
            error
        );


        addMessage(
            "ai",
            "❌ Could not ban that user: " +
            error.message
        );

        return;

    }


    addMessage(
        "ai",
        "🚫 " +
        username +
        " has been banned."
    );

}


/* ==============================
   UNBAN USER
   ============================== */

async function unbanUser() {

    if (!isAdmin()) {

        return;

    }


    const input =
        document.getElementById(
            "unbanUsernameInput"
        );


    const username =
        cleanUsername(
            input
                ? input.value
                : ""
        );


    if (!username) {

        alert(
            "Enter a username first."
        );

        return;

    }


    await unbanUserByName(
        username
    );


    if (input) {

        input.value = "";

    }

}


async function unbanUserByName(
    username
) {

    if (!isAdmin()) {

        return;

    }


    const {
        error
    } =
        await supabaseClient.rpc(
            "admin_unban_david_user",
            {
                target_username:
                    username
            }
        );


    if (error) {

        console.error(
            "Unban failed:",
            error
        );


        addMessage(
            "ai",
            "❌ Could not unban that user: " +
            error.message
        );

        return;

    }


    addMessage(
        "ai",
        "✅ " +
        username +
        " has been unbanned."
    );

}


/* ==============================
   SYSTEM INFORMATION
   ============================== */

async function showSystemInfo() {

    if (!isAdmin()) {

        return;

    }


    const adminMessage =
        document.getElementById(
            "adminMessage"
        );


    if (!adminMessage) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "admin_get_david_users"
        );


    if (error) {

        adminMessage.textContent =
            "Could not load user information.";

        return;

    }


    const users =
        Array.isArray(data)
            ? data
            : [];


    adminMessage.innerHTML = `
        <strong>David 2.0 System</strong><br><br>
        Accounts: ${users.length}<br>
        Smart Mode: ${smartMode ? "ON" : "OFF"}<br>
        Current user: ${
            currentUser
                ? currentUser.username
                : "None"
        }<br>
        Storage: Supabase
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


    if (!sidebarChats) {

        return;

    }


    sidebarChats.innerHTML =
        "";


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


    if (!sidebar) {

        return;

    }


    sidebar.classList.toggle(
        "open"
    );

}


/* ==============================
   CONTINUOUS BAN CHECK
   ============================== */

setInterval(
    async () => {

        if (!currentUser) {

            return;

        }


        const banned =
            await isUserBanned();


        if (banned) {

            showBannedScreen();

        }

    },
    5000
);


/* ==============================
   START DAVID
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

async function adminLogin() {
    const emailInput = document.getElementById("adminEmailInput");
    const passwordInput = document.getElementById("adminPasswordInput");
    const message = document.getElementById("loginMessage");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        message.textContent = "Enter your admin email and password.";
        return;
    }

    message.textContent = "Logging in as admin...";

    try {
        // Sign out of any anonymous account first
        await supabaseClient.auth.signOut();

        // Sign into the real admin account
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        // Get the admin profile
        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("username, role")
                .eq("id", data.user.id)
                .single();

        if (profileError) {
            throw profileError;
        }

        // Make sure this account is actually an admin
        if (profile.role !== "admin") {
            await supabaseClient.auth.signOut();
            throw new Error("This account is not an admin.");
        }

        currentUser = {
            username: profile.username,
            key: usernameKey(profile.username),
            role: "admin",
            userId: data.user.id
        };

        localStorage.setItem(
            "davidCurrentUser",
            currentUser.key
        );

        message.textContent = "";

        loadApp();

    } catch (error) {
        console.error("Admin login error:", error);
        message.textContent =
            error.message || "Admin login failed.";
    }
}
