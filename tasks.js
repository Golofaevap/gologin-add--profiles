const { createTask } = require("./utils");
// -------------------------------------------------------------------------------------

const { fillPayNewForm, openSettings } = require("./functions/pay.google.com");
const {
    addNewAdsAccount,
    selectAdsAccountToWorkWith,
    createAdsAccountInExpertMode,
    setupBilling,
    insertScript,
    runScript,
} = require("./functions/ads.google.com");
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------

// createTask(func, descs, url);
const openPaySettings = async () => {
    const name = "openPaySettings";
    const url = "https://pay.google.com/gp/w/u/0/home/settings?hl=en";
    const descs = [
        "Result of the function is added card to payment profile",
        "Manual execution: ",
        " -- be sure that payment profile added to account",
        " -- card added to payment profile",
    ];
    return await createTask(openSettings, descs, url, name);
};

const createPHAdsAccount = async () => {
    const name = "createPHAdsAccount";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Result of the function is created account for Philippines",
        "Manual execution: ",
        " -- be sure that ads account creted on philippines and currency is PHP",
    ];
    return await createTask(addNewAdsAccount, descs, url, name);
};

const selecAdsAccountToWork = async () => {
    const name = "selecAdsAccountToWork";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Simply select ads account.",
        "Manual execution: ",
        " -- Add account id in field 'current', and continue execution",
    ];
    return await createTask(selectAdsAccountToWorkWith, descs, url, name);
};

const createAdsAccountinExpertMode_taskCreator = async () => {
    const name = "createAdsAccountinExpertMode";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Create account in Expert mode without campaigns",
        "Manual execution: ",
        " -- Create account ",
        " -- select Philippines Country",
        " -- select PHP currency",
    ];
    return await createTask(createAdsAccountInExpertMode, descs, url, name);
};
const taskSetupBillingInAdsAccount_taskCreator = async () => {
    const name = "setupBillingInAdsAccount";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Setup billing with philippines payment profile",
        "Manual execution: ",
        " -- Open billing summaty ",
        " -- select Philippines Country",
        " -- select added earlier card",
        " -- save setup",
    ];
    return await createTask(setupBilling, descs, url, name);
};
const taskScriptAddedInAdsAccount_creator = async () => {
    const name = "taskScriptAddedInAdsAccount";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Insert script to execute in account and save it",
        "Manual execution: ",
        " -- Open script manager ",
        " -- create new script",
        " -- insert code",
        " -- save script ",
    ];
    return await createTask(insertScript, descs, url, name);
};
const taskScriptLaunchedInAdsAccount_creator = async () => {
    const name = "taskScriptLaunchedInAdsAccount";
    const url = "https://ads.google.com/selectaccount?hl=en";
    const descs = [
        "Setup script schedule",
        "Manual execution: ",
        " -- Open script manager ",
        " -- setup schedule for our script 'Hourly'",
    ];
    return await createTask(runScript, descs, url, name);
};

async function enrichTasksWithFunctions(steps, session) {
    session.funcs = {};
    console.log("enrichTasksWithFunctions ....");
    console.log("steps.length", steps.length);
    for (let s of steps) {
        const { name } = s;
        if (name === "openPaySettings") {
            s.main = openSettings;
        }
        if (name === "createPHAdsAccount") {
            s.main = addNewAdsAccount;
        }
        session.funcs[name] = s;
    }
}

module.exports = {
    openPaySettings,
    createPHAdsAccount,
    enrichTasksWithFunctions,
    selecAdsAccountToWork,
    createAdsAccountinExpertMode_taskCreator,
    taskSetupBillingInAdsAccount_taskCreator,
    taskScriptAddedInAdsAccount_creator,
    taskScriptLaunchedInAdsAccount_creator,
};
