var prompt = require("syncprompt");
const fs = require("fs");
const { default: axios } = require("axios");
// import fetch from "node-fetch";

function deBug(...rest) {
    const degug = true;
    if (degug) console.log(...rest);
}

// -----------------------------------------------------------------
function jsCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// -----------------------------------------------------------------
function createTask(func, descs, url, name) {
    // console.log(func);
    return {
        name: name,
        main: func,
        url: url,
        descriptions: [...descs],
        completed: false,
    };
}

// -----------------------------------------------------------------
async function executeTask(task, args, attempt, page) {
    for (let i = 0; i < 10; i++) {
        deBug("\n\ntask iteration: ", i, " .................... ");
        deBug("task: ", task);
        attempt.attemptIndex++;
        try {
            const result = await task.main(args);

            attempt.attempts.push({
                successfull: true,
                reason: "ok",
                iteration: attempt.attemptIndex,
            });
            if (result.ok) {
                attempt.completed = true;
                task.completed = true;
                return jsCopy(attempt);
            }
            console.log(result);
            throw "Task return {ok: false}";
        } catch (error) {
            console.log(error);
            attempt.attempts.push({
                successfull: false,
                reason: JSON.stringify(error),
                iteration: attempt.attemptIndex,
            });
            attempt.completed = false;
            if (attempt.attemptIndex > 2) {
                await page.evaluate((el) => alert("Need your attention in console..."));
                console.log(" *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * ");
                console.log(" ");
                console.log("ERROR  -  ERROR  -  ERROR  -  ERROR  -  ERROR  -  ERROR");
                console.log(" ");
                console.log(" ", await page.url());

                console.log(" ");
                console.log(" ", "INSTRUCTIONS");
                if ("descriptions" in task) {
                    for (let d of task.descriptions) {
                        console.log("  -", d);
                    }
                }
                console.log(" ");
                console.log("10 - repeat one more time");
                console.log("83 - task is completed manually and process can be continue");
                console.log("56 - terminate task without completion");
                console.log(" ");
                console.log(" *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * ");
                var continVar = prompt("Code to continue? ");

                switch (continVar) {
                    case "10":
                        // try one more time
                        console.log("Simply try again ....");
                        await page.waitForTimeout(5000);
                        break;
                    case "83":
                        // completed by hand
                        console.log("Completed by hand ....");
                        // break;

                        attempt.attempts.push({
                            successfull: true,
                            reason: "manually completed",
                            iteration: attempt.attemptIndex,
                        });
                        attempt.completed = true;

                        return jsCopy(attempt);
                    case "56":
                        // break this task
                        console.log("Terminate task ....");
                        attempt.attempts.push({
                            successfull: false,
                            reason: JSON.stringify(error),
                            iteration: attempt.attemptIndex,
                        });
                        attempt.completed = false;
                        return jsCopy(attempt);

                    default:
                        console.log("Command is unknown.", "Attempts ", i, "of", 10);
                        await page.waitForTimeout(5000);
                        break;
                }
            }
        }
    }
    return jsCopy(attempt);
}
// -----------------------------------------------------------------

async function readSession(args) {
    console.log("async function readSession ...");
    const { profileId, proxy } = args;
    console.log(args);
    var sessions = fs.readdirSync("./sessions/");
    // console.log(sessions);
    let session = null;
    if (sessions.includes(`${profileId}.json`)) {
        session = JSON.parse(fs.readFileSync(`./sessions/${profileId}.json`, "utf8"));
    }
    if (!session) {
        const proxyParsed = await parseProxy(proxy);
        if (!proxyParsed.ok) throw proxyParsed.message;
        console.log(proxyParsed.message);
        delete proxyParsed.ok;
        delete proxyParsed.message;
        session = {
            profileId,
            proxy: {
                ...proxyParsed,
            },
            gmailCreated: false,
            userEmails: {},
            currenEmail: null,
            currentAdsAccount: null,
            blocked: false,
        };
        fs.writeFileSync(`./sessions/${profileId}.json`, JSON.stringify(session));
    }
    if (session.blocked) {
        console.log("session is blocked");
        return;
    }
    return session;
}

async function parseProxy(proxy) {
    console.log("async function parseProxy ...");

    const proxyParsed = {
        host: "",
        port: "",
        username: "",
        password: "",
    };
    if (proxy.includes("@")) {
        const splited = proxy.split("@");
        const creds = splited[0].split(":");
        const conns = splited[1].split(":");
        if (conns.length < 2) return { ok: false, message: "host address and port adding problem" };
        if (creds.length < 2)
            return {
                ok: false,
                message: "proxy username and password adding problem",
            };
        proxyParsed.host = conns[0].trim();
        proxyParsed.port = conns[1].trim();
        proxyParsed.username = creds[0].trim();
        proxyParsed.password = creds[1].trim();
    } else {
        const splited = proxy.split(":");
        if (splited.length < 2) return { ok: false, message: "host address and port adding problem" };
        if (splited.length < 4) {
            proxyParsed.host = splited[0].trim();
            proxyParsed.port = splited[1].trim();
        } else {
            proxyParsed.host = splited[0].trim();
            proxyParsed.port = splited[1].trim();
            proxyParsed.username = splited[2].trim();
            proxyParsed.password = splited[3].trim();
        }
    }
    proxyParsed.ok = true;
    proxyParsed.message = "Proxy parsed successfully";
    return proxyParsed;
}

async function readAllEmailsInLog(page, session) {
    // -- select account
    console.log("readAllEmailsInLog starting...");
    const { profileId } = session;
    const isAnyEmailsInUserEmails = Object.keys(session.userEmails);
    console.log("!isAnyEmailsInUserEmails.length", !isAnyEmailsInUserEmails.length);
    if (!isAnyEmailsInUserEmails.length) {
        console.log("!isAnyEmailsInUserEmails.length", "condition running");
        await page.goto("https://accounts.google.com/SignOutOptions?hl=en", {
            waitUntil: "networkidle2",
        });
        await page.waitForTimeout(2000);
        const accountItems = await page.$$("li[id]");
        console.log("accountItems.length", accountItems.length);
        const emailsList = [];
        for (let el of accountItems) {
            const emailEl = await el.$("span.account-email");
            const email = await emailEl.evaluate((el) => el.innerText);
            console.log("!session.userEmails[email]", !session.userEmails[email], email);
            emailsList.push(email.trim());
        }

        for (let email of emailsList) {
            const emailEls = await page.$$("span.account-email");
            let emailEl = null;
            for (let iEmail of emailEls) {
                const newEmail = await iEmail.evaluate((el) => el.innerText);
                if (newEmail.trim() === email) {
                    emailEl = iEmail;
                    break;
                }
            }
            if (!emailEl) return;
            if (!session.userEmails[email]) {
                session.userEmails[email] = {
                    profileId: profileId,

                    email: email,
                    isSingout: false,
                    inWork: false,
                    isUsed: false,
                    isStepsAdded: false,
                    steps: [],
                    wasFirstLaunch: false,
                    history: [],
                    adsAccounts: {},
                };
            }

            // https://myaccount.google.com/?utm_source=sign_in_no_continue&pli=1
            await emailEl.click();
            await page.waitForTimeout(4000);
            const url = await page.url();
            if (!url.includes("myaccount.google.com")) {
                session.userEmails[email].isSingout = true;
            }

            fs.writeFileSync(`./sessions/${profileId}.json`, JSON.stringify(session));
            await page.waitForTimeout(2000);
            await page.goto("https://accounts.google.com/SignOutOptions?hl=en", {
                waitUntil: "networkidle2",
            });
            await page.waitForTimeout(2000);
        }
    }
    session.emailFound = true;
    fs.writeFileSync(`./sessions/${profileId}.json`, JSON.stringify(session));
}

async function selectEmailInAccountToWorkWith(page, session) {
    // const emailKeys = Object.keys(session.userEmails)
    const availableEmails = [];
    for (let i in session.userEmails) {
        console.log("Email selection .... ");
        if (session.userEmails[i].isSingout) continue;
        if (session.userEmails[i].isUsed) continue;
        availableEmails.push(session.userEmails[i]);
    }
    if (availableEmails.length <= 1) return availableEmails[0];
    else {
        console.log("== AvailableEmails ========= start ===");
        for (let i in availableEmails) {
            console.log(`[z=${i}] - ${availableEmails[i].email}`);
        }
        console.log("== AvailableEmails ========= end =====");
        for (let tryCount = 0; tryCount < 10; tryCount++) {
            console.log("selecting emails. try number", tryCount);
            await page.evaluate((el) => alert("Your need to have a look on console. FIRST - CLOSE THIS ALERT!!"));
            var continVar = prompt("Which email to start work with? (write 'z=index'): ");
            continVar = continVar.includes("=") ? continVar.split("=")[1] : null;
            if (continVar in availableEmails) {
                return availableEmails[continVar];
            }
        }
    }
    return null;
}

async function getNewCard() {
    const card = [
        {
            number: "4895046744827133",
            date1: "04",
            date2: "23",
            cvc: "370",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895048807034631",
            date1: "07",
            date2: "25",
            cvc: "803",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895045788618663",
            date1: "10",
            date2: "26",
            cvc: "030",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895040082351061",
            date1: "02",
            date2: "26",
            cvc: "263",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895042676348230",
            date1: "05",
            date2: "26",
            cvc: "464",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895047455211723",
            date1: "10",
            date2: "23",
            cvc: "707",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895048677583154",
            date1: "04",
            date2: "25",
            cvc: "184",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895040411030717",
            date1: "06",
            date2: "24",
            cvc: "805",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895042428207221",
            date1: "02",
            date2: "26",
            cvc: "453",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895042176825208",
            date1: "06",
            date2: "25",
            cvc: "338",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895047040146103",
            date1: "03",
            date2: "26",
            cvc: "765",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895046554817281",
            date1: "05",
            date2: "26",
            cvc: "665",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895043187238787",
            date1: "07",
            date2: "25",
            cvc: "238",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
        {
            number: "4895045802155486",
            date1: "03",
            date2: "23",
            cvc: "440",
            address: "some street 1",
            city: "some city",
            province: "",
            name: "cardholder name",
        },
    ];

    const url =
        "https://script.google.com/macros/s/AKfycbws9dEanz3h2Wu4EU00tknmbbk7qq6YIsdv1KM5Phj5ht7YFm6QGO6G2lMry1974buN/exec";

    // const response = await fetch(url);
    const response = await axios({
        method: "GET",
        url: url,
    });
    console.log(response.status);
    const json = await response.data;
    if (json.ok) {
        return json.card;
    }

    return card[Math.floor(Math.random() * card.length)];
}

async function getCardHolder() {
    const url =
        "https://script.google.com/macros/s/AKfycbyR6PkCwnrFkg7qnPxR8LK_X5i7PU-aIKa080LSTIuZK5iEeGEAM9XIPBHXY4Y8qAbRTw/exec";

    // const response = await fetch(url);
    const response = await axios({
        method: "GET",
        url: url,
    });
    const json = await response.data;
    if (json.ok) {
        return json.user;
    }
    return {
        address: "some street 1",
        city: "some city",
        province: "",
        name: "cardholder name",
    };
}

async function gotoWithEmail({ page, emailToWorkWith, url }) {
    console.log("gotoWithEmail ...");
    // console.log(page, emailToWorkWith, url);
    await page.goto("https://accounts.google.com/SignOutOptions?hl=en&continue=" + url, { waitUntil: "networkidle2" });
    await page.waitForTimeout(2000);
    const accountItems = await page.$$("li[id]");
    console.log("accountItems.length", accountItems.length);
    for (let el of accountItems) {
        const emailEl = await el.$("span.account-email");
        const email = await emailEl.evaluate((el) => el.innerText);
        console.log("gotoWithEmail -> ", email, emailToWorkWith.email);
        if (email.trim() === emailToWorkWith.email) {
            return await el.click();
        }
    }
    throw { terminate: true, message: "No email selected" };
}

async function parseInputArgs(args, required) {
    // const args = process.argv;
    //   const profileId = args[2];
    //   const offer = args[3];
    const argObj = { __problems: [] };
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.includes("--") && arg.includes("=") && arg.split("=")[1].trim().length) {
            const splited = arg.split("=");
            let key = splited[0].replace(/\s/g, "").replace("--", "");
            let value = splited[1].trim();
            argObj[key] = value;
            if (key === "proxy") {
                argObj[key] = await parseProxy(value);
            }
        } else {
            argObj.__problems.push(arg);
        }
    }
    const keys = Object.keys(argObj);
    console.log(keys, required);
    if (argObj.type == "current") {
        return { obtained: true, args: argObj, message: "Got them for current" };
    }
    if (required) {
        // const requiredLength = required.length;
        for (let r of required) {
            if (!keys.includes(r)) {
                return {
                    obtained: false,
                    args: argObj,
                    message: "\n\n\n\n\nCHECK " + r + "\n\n\n\n\n",
                };
            }
        }
    }

    return { obtained: true, args: argObj, message: "Got them for one" };
}

const saveSession = async (session) => {
    const current = session.current;
    session.current = null;
    fs.writeFileSync(`./sessions/${session.shortId}.json`, JSON.stringify(session));
    session.current = current;
};

module.exports = {
    executeTask,
    jsCopy,
    createTask,
    readSession,
    readAllEmailsInLog,
    selectEmailInAccountToWorkWith,
    getNewCard,
    getCardHolder,
    deBug,
    gotoWithEmail,
    parseInputArgs,
    saveSession,
    parseProxy,
};
