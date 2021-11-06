// node actions\0_cloneNewAccount.js --shortId=CRA-21 --profileName=Cra-43-123-123-123 --proxy=1.1.1.1:8080 --fullname="Stiven Jones" --dob=1960-09-13 --ssn=12312312 --zip=45069
let { Cookie, CookieMap, CookieError } = require("cookiefile");
const GoLogin = require("gologin");
const fs = require("fs");
const { readSession, parseInputArgs, saveSession, parseProxy } = require("../utils");
// ===========================================================
// ===========================================================
const topProfileId = "61822231d884614bbc054a8a";
const glToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MTgyMjIzMWQ4ODQ2MTVjMjIwNTRhODgiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2MTgyMzkyNDFjMjQyZWZjNGY0OGQ5MmIifQ.RdzK-pKfxk0qJ2dr8m9YhjZ7OnZWTasoOPK-1wZbNl4";
// ===========================================================
// ===========================================================

const timeout = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, ms);
    });
};
let iter = 1;
const cloneNeAccount = async (args) => {
    let isJson = true;

    const { profileId, offer, proxy } = args;

    const GL = new GoLogin({
        token: glToken,
        uploadCookiesToServer: true,
        // profile_id: topProfileId,
    });

    const profileTemplate = await GL.getProfile(topProfileId);
    const profKeys = Object.keys(profileTemplate);
    // console.log(profKeys, args);
    const newProfile = {
        ...profileTemplate,
    };
    newProfile.name = args.profileName; //"123-" + Math.random();
    console.log(typeof proxy);
    let lproxy = proxy;
    if (typeof lproxy === "string") {
        console.log(" proxy is string");
        lproxy = await parseProxy(proxy);
    }
    delete lproxy.ok;
    delete lproxy.message;
    newProfile.proxy = { ...profileTemplate.proxy, ...lproxy };

    // console.log(newProfile.proxy);
    const mewProfileId = await GL.create(newProfile);
    const session = {
        ...args,
        profileId,
        blocked: false,
        gmailCreated: false,
        backUpCodesCreated: false,
        bankCreated: false,
        checkingCreated: false,
        adsCreated: false,
        bankLinked: false,
        bankVerified: false,
        completed: false,
        save: null,
        accountNumber: "",
        rountingNumber: "",
        minic: "",
        backUpCodes: "",
    };
    session.save = saveSession;
    session.save(session);
    console.log("iter = ", iter++);

    const cookieObject = await getCookies();
    // console.log(cookieObject.arrOfCookies[Math.floor(Math.random() * cookieObject.arrOfCookies.length)]);
    const cookiesResp = await GL.postCookies(mewProfileId, cookieObject.arrOfCookies);
    await timeout(2000);
    console.log("Updating notes ...", cookieObject.fileName);
    const updateResult = await GL.update({
        id: mewProfileId,
        notes: cookieObject.fileName,
    });
    console.log(JSON.stringify(cookiesResp), updateResult);
    session.cookiesAdded = true;
    session.save(session);

    await moveCookies(cookieObject.fileName);
    //   console.log(await GL_TOP.getProfile(GL_TOP.profile_id));
    return { ok: true };
};

(async () => {
    const args = await parseInputArgs(process.argv, [
        "type",
        "shortId",
        "proxy",
        "profileName",
        "fullname",
        "dob",
        "ssn",
        "zip",
    ]);
    if (!args.obtained) return console.log(args.message);
    let argsArr = [];
    if (args.args.type == "current") {
        // read current
        const argTxt = fs.readFileSync("./current.json", { encoding: "utf-8" });
        argsArr = JSON.parse(argTxt);
    } else {
        argsArr = [{ ...args.args }];
    }

    for (let arg of argsArr) {
        if (!arg.shortId) {
            console.log("\n\n\nERROR:\n\nshortId Does Not Exist in arg\n\n", arg, "\n\n");
            continue;
        }
        const isSession = await isSessionExist(arg.shortId);
        if (isSession === -1) {
            console.log("\n\n\nERROR:\n\tshortId Does Not Exist in arg\n\n", arg, "\n\n");
            continue;
        }
        if (isSession) {
            console.log("\n\n\nERROR:\n\tSession with such shortId was already created Exist in arg\n\n", arg, "\n\n");
            continue;
        }
        await cloneNeAccount(arg);
    }
})();

async function isSessionExist(shortId) {
    if (!shortId) {
        return -1; // short id was not provided
    }
    return fs.existsSync(`./sessions/${shortId}.json`);
}

async function getCookies() {
    function getFiles() {
        return fs.readdirSync("./cookies/").filter(function (file) {
            return !fs.statSync("./cookies/" + file).isDirectory();
        });
    }
    const files = getFiles();
    console.log("files.length", files.length);
    const fileName = files[Math.floor(Math.random() * files.length)];
    const filePath = "./cookies/" + fileName;
    let arrOfCookies = [];
    let isJson = true;
    try {
        const file = fs.readFileSync(filePath, { encoding: "utf-8" });
        arrOfCookies = JSON.parse(file);
        arrOfCookies.forEach((a) => {
            const keys = Object.keys(a);
            // const lowKey = keys.map(el = el.toLowerCase());
            keys.forEach((k) => {
                const lk = k.toLowerCase();
                if (!a[lk]) {
                    a[lk] = a[k];
                }
            });
        });
    } catch (error) {
        console.log(error);
        isJson = false;
    }
    if (!isJson) {
        const requestParsed = new CookieMap(filePath);
        const parsedCookies = requestParsed.readFile();
        arrOfCookies = [...parsedCookies].map(([name, value]) => ({
            ...value,
            name: value.cookieName,
        }));
    }

    return { arrOfCookies, fileName };
}

async function moveCookies(fileName) {
    fs.renameSync(`./cookies/${fileName}`, `./cookies/used/${fileName}`);
}
