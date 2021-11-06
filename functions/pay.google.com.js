const { getNewCard, getCardHolder, deBug, gotoWithEmail } = require("../utils");

// ================================================================================
// ================================================================================

async function fillPayNewForm({ page, emailToWorkWith }) {
    // pay.google.com/home/signup
    // https://pay.google.com/gp/w/u/0/home/settings

    console.log("fillPayNewForm ... ");
    await gotoWithEmail({ page, emailToWorkWith, url: "https://pay.google.com/gp/w/u/1/home/signup?hl=en" });
    const payUrl = (await page.url()) + "&hl=en";
    console.log(payUrl);

    await page.waitForSelector("button");
    // console.log(payUrl);
    // await page.goto(payUrl);

    await page.waitForSelector("button");
    await page.waitForTimeout(2000);
    const buttons = await page.$$("button");
    console.log(buttons.length);
    for (let btn of buttons) {
        const shouldClick = await btn.evaluate((el) => el.innerText.toLowerCase().includes("add"));
        console.log(shouldClick);
        shouldClick && (await btn.click());
    }
    await page.waitForTimeout(2000);

    const url = await page.url();
    if (!url.includes("/home/signup")) {
        console.log("wrong url addres to continue");
        return;
    }
    const frameHandle = await page.waitForSelector("iframe");
    const iFrame = await frameHandle.contentFrame();

    // const iFrame = page.frames().find((el) => true);
    // console.log(iFrame);
    // await iFrame.evaluate((el) => console.log(el.innerText));
    const regionSelector = await iFrame.$('div[class="b3-collapsing-form-placeholder-text"]');
    await regionSelector.click();

    await page.waitForTimeout(2000);
    const countrySelectorOpent = await iFrame.$('span[class*="countryselector-flag"]');
    await countrySelectorOpent.click();
    await page.waitForTimeout(2000);

    const philippines = await iFrame.$('div[class="goog-menuitem"][data-value="PH"]');
    await philippines.click();

    await page.waitForTimeout(2000);
    await iFrame.waitForSelector('div[class="b3-collapsing-form-placeholder-text"]');
    const cardHolder = await getCardHolder();
    const userName = await iFrame.$('input[name="ccname"]');
    await userName.click({ clickCount: 3 });
    await userName.type(cardHolder.name, { delay: 200 });

    const regionSelector2 = await iFrame.$('div[class="b3-collapsing-form-placeholder-text"]');
    await regionSelector2.click();

    await page.waitForTimeout(2000);
    const addressLine1 = await iFrame.$('input[name="ADDRESS_LINE_1"]');
    await addressLine1.type(cardHolder.address, { delay: 200 });

    await page.waitForTimeout(2000);
    const cityName = await iFrame.$('input[name="LOCALITY"]');
    await cityName.type(cardHolder.city, { delay: 200 });

    await page.waitForTimeout(2000);
    const adminArea = await iFrame.$('div[data-name="ADMIN_AREA"]');
    await adminArea.click();

    await page.waitForTimeout(2000);
    const areas = await iFrame.$$('div[class="goog-menuitem"][role="menuitem"][data-value]');
    while (true) {
        try {
            await areas[Math.floor(Math.random() * areas.length)].click();
            break;
        } catch (error) {
            console.log(error);
        }
    }
    for (let i = 0; i < 5; i++) {
        try {
            const newCard = await getNewCard();
            await page.waitForTimeout(2000);
            const cardnumber = await iFrame.$('input[name="cardnumber"]');
            await cardnumber.click({ clickCount: 3 });
            await cardnumber.type(newCard.number, { delay: 200 });

            await page.waitForTimeout(2000);
            const ccmonth = await iFrame.$('input[name="ccmonth"]');
            await ccmonth.click({ clickCount: 3 });
            await ccmonth.type(newCard.date1, { delay: 200 });

            await page.waitForTimeout(2000);
            const ccyear = await iFrame.$('input[name="ccyear"]');
            await ccyear.click({ clickCount: 3 });
            await ccyear.type(newCard.date2, { delay: 200 });

            await page.waitForTimeout(2000);
            const cvc = await iFrame.$('input[name="cvc"]');
            await cvc.click({ clickCount: 3 });
            await cvc.type(newCard.cvc, { delay: 200 });

            await page.waitForTimeout(2000);

            const submitButton = await iFrame.$('div[class*="submit-button"]');
            await submitButton.click();
            const checkwithSubmitButton = await iFrame.$('div[class*="submit-button"]');
            if (checkwithSubmitButton) {
                throw "card was not saved";
            }
            return { ok: true, message: "card with new profile added" };
        } catch (error) {
            console.log("adding new card in new profile catch ....");
            console.log(error);
        }
    }
    throw "card was not added to new profile";
}
// ================================================================================
// ================================================================================

async function createNewPaymentProfile({ page }) {
    const url = await page.url();
    deBug(url);
    if (!url.includes("/home/settings")) {
        console.log("wrong url addres to continue", "createNewPaymentProfile");
        return;
    }

    //id="mainWidget_:1Iframe"
    // return;

    const isNeededProfileExists = await openCollapsedRegion({ page });
    if (isNeededProfileExists) return true;
    await page.waitForTimeout(2000);

    await confirmCreationOfNewProfile({ page });
    await page.waitForTimeout(3000);

    await selectCountry({ page });
    await page.waitForTimeout(3000);

    await fillOutFormForSecondProfile({ page });
    await page.waitForTimeout(3000);

    await clickViewNewProfile({ page });
    await page.waitForTimeout(3000);
}
// ================================================================================
// ================================================================================

async function clickViewNewProfile({ page }) {
    const frameHandle = await page.$$("iframe");
    const iFrame = await frameHandle[frameHandle.length - 1].contentFrame();
    await page.waitForTimeout(1000);

    const button = await iFrame.$('div[role="button"]');
    await button.click();
}
// ================================================================================
// ================================================================================

async function fillOutFormForSecondProfile({ page, card }) {
    deBug("fillOutFormForSecondProfile ...... ");
    const frameHandle = await page.$$("iframe");
    deBug("fillOutFormForSecondProfile ...... ", "frameHandle.length", frameHandle.length);

    const iFrame = await frameHandle[frameHandle.length - 1].contentFrame();
    await page.waitForTimeout(1000);
    const cardHolder = await getCardHolder();
    // console.log("cardHolder:", cardHolder);
    const nameInput = await iFrame.$('input[name="RECIPIENT"]');
    await nameInput.click({ clickCount: 3 });
    await nameInput.type(cardHolder.name, { delay: 120 });
    await page.waitForTimeout(1000);

    const addressInput = await iFrame.$('input[name="ADDRESS_LINE_1"]');
    await addressInput.click({ clickCount: 3 });
    await addressInput.type(cardHolder.address, { delay: 130 });
    await page.waitForTimeout(1000);

    const cityInput = await iFrame.$('input[name="LOCALITY"]');
    await cityInput.click({ clickCount: 3 });
    await cityInput.type(cardHolder.city, { delay: 130 });
    await page.waitForTimeout(1000);

    const openProvinceList = await iFrame.$('div[data-name="ADMIN_AREA"]');
    await openProvinceList.click({ clickCount: 1 });
    await page.waitForTimeout(1000);

    const areaItems = await iFrame.$$('div[class="goog-menuitem-content"]');
    let tries = 0;
    while (true) {
        try {
            await areaItems[Math.floor(Math.random() * areaItems.length)].click();
        } catch (error) {
            console.log(error);
            tries++;
            if (tries > 5) break;
        }
    }
    // await openProvinceList.click({ clickCount: 1 });
    await page.waitForTimeout(1000);

    // const submitButton = await iFrame.$('div[class*="b3-primary-button][role="button"]');
    // await submitButton.click();

    const submitButtons = await iFrame.$$('div[class*="jfk-button"]');
    // console.log(submitButtons.length);
    await submitButtons[1].click();
}
// ================================================================================
// ================================================================================

async function openCollapsedRegion({ page }) {
    deBug("openCollapsedRegion ... ");
    await page.waitForSelector("iframe");
    await page.waitForTimeout(5000);
    const frameHandle = await page.$$("iframe");
    const currentUrl = await page.url();
    deBug("openCollapsedRegion ... ", "currentUrl", currentUrl);
    deBug("openCollapsedRegion ... ", "frameHandle.length", frameHandle.length);

    const iFrame = await frameHandle[frameHandle.length - 1].contentFrame();

    await page.waitForTimeout(3000);
    const h1s = await iFrame.$$('div[class*="b3-collapsing-form-collapsed-content"]');
    deBug("openCollapsedRegion ... ", "h1s.length", h1s.length);

    for (let h1 of h1s) {
        const shouldExit = await h1.evaluate((el) => {
            console.log(el.innerText);
            return el.innerText && el.innerText.includes("(PH)");
        });
        if (shouldExit) return true;
    }

    const collapsedSpan = await iFrame.$('span[class*="b3-collapsing-form-edit-icon"]');
    await collapsedSpan.click();

    await page.waitForTimeout(1000);

    const createNewProfileButton = await iFrame.$('a[class="b3id-button-link b3-button-link"]');
    await createNewProfileButton.click();
    return false;
}
// ================================================================================
// ================================================================================

async function confirmCreationOfNewProfile({ page }) {
    const frameHandle2 = await page.$$("iframe");
    const iFrame2 = await frameHandle2[frameHandle2.length - 1].contentFrame();
    const buttonsToConfirmNewProfileCreations = await iFrame2.$$('div[class*="jfk-button"]');
    // console.log(buttonsToConfirmNewProfileCreations.length);
    await buttonsToConfirmNewProfileCreations[1].click();
}
// ================================================================================
// ================================================================================

async function selectCountry({ page }) {
    const frameHandle3 = await page.$$("iframe");
    const iFrame3 = await frameHandle3[frameHandle3.length - 1].contentFrame();
    const buttonToOpenCountryList = await iFrame3.$('div[class*="goog-flat-menu-button-dropdown"]');
    // console.log(buttonsToConfirmNewProfileCreations.length);
    await buttonToOpenCountryList.click();

    await page.waitForTimeout(3000);
    const phCountry = await iFrame3.$('div[data-value="PH"]');
    await phCountry.click();
    await page.waitForTimeout(1000);

    const buttonsToConfirmRegion = await iFrame3.$$('div[class*="jfk-button"]');
    console.log(buttonsToConfirmRegion.length);
    await buttonsToConfirmRegion[1].click();
}
// ================================================================================
// ================================================================================

async function addCardToExistingProfile({ page }) {
    await page.waitForTimeout(3000);
    let currentUrl = await page.url();
    currentUrl = currentUrl.split("/home/")[0];
    deBug(currentUrl + "/home/paymentmethods?hl=en");
    await page.goto(currentUrl + "/home/paymentmethods?hl=en", { waitUntil: "networkidle2" });
    const visitedUrl = await page.url();
    console.log(visitedUrl);
    if (!visitedUrl.includes("/home/paymentmethods")) {
        console.log("error in url to continue work", "addCardToExistingProfile");
        return;
    }
    const doesCardExist = await page.$$('div[class="b3-payment-methods-card"]');
    if (doesCardExist.length) return { ok: true, message: "CARD IS ALREADY ADDED" };
    await startAddingNewCard({ page });
    await page.waitForTimeout(13000);

    return await fillingOutCardDetails({ page });
}
// ================================================================================
// ================================================================================

async function fillingOutCardDetails({ page }) {
    const frameHandle = await page.$$("iframe");
    // console.log("frameHandle.length", frameHandle.length);
    const iFrame = await frameHandle[frameHandle.length - 1].contentFrame();

    const collapsedForm = await iFrame.$('div[class="b3-collapsing-form-placeholder-text"]');
    await collapsedForm.click();

    const newCard = await getNewCard();
    await page.waitForTimeout(1000);
    const cardNumber = await iFrame.$('input[name="cardnumber"]');
    await cardNumber.type(newCard.number, { delay: 90 });
    // name="expirationDate-month"
    await page.waitForTimeout(1000);
    const monthDate = await iFrame.$('input[name="expirationDate-month"]');
    await monthDate.type(newCard.date1, { delay: 93 });
    await page.waitForTimeout(1000);
    const yearDate = await iFrame.$('input[name="expirationDate-year"]');
    await yearDate.type(newCard.date2, { delay: 99 });
    await page.waitForTimeout(1000);
    const cvc = await iFrame.$('input[name="cvc"]');
    await cvc.type(newCard.cvc, { delay: 99 });
    await page.waitForTimeout(1000);

    const saveCard = await iFrame.$("#saveAddInstrument");
    await saveCard.click();

    await page.waitForTimeout(7000);
    try {
        const pError = await iFrame.$('p[class*="b3id-input-error"]');
        const isEmpty = await pError.evaluate((el) => {
            return !el.innerText;
        });
        if (!isEmpty) {
            console.log({ ok: false, message: "Problem adding card" });
            return { ok: false, message: "Problem adding card" };
        }
        const saveCardCheck = await iFrame.$("#saveAddInstrument");
        // await saveCard.click();
        if (saveCardCheck) {
            console.log({ ok: false, message: "Problem adding card" });
            return { ok: false, message: "Problem adding card" };
        }

        return { ok: true, message: "Card is added" };
    } catch (error) {
        return { ok: true, message: "Card is added" };
    }
}
// ================================================================================
// ================================================================================

async function startAddingNewCard({ page }) {
    const frameHandle = await page.$$("iframe");
    // console.log("frameHandle.length", frameHandle.length);
    const iFrame = await frameHandle[frameHandle.length - 1].contentFrame();
    const addNewCardButton = await iFrame.$('a[class*="b3id-payment-method-add-instrument-link"]');
    await addNewCardButton.click();
}
// ================================================================================
// ================================================================================
async function openSettings({ page, emailToWorkWith }) {
    console.log("openSettings ... ");
    // https://pay.google.com/gp/w/u/0/home/settings
    // await page.goto("https://pay.google.com/gp/w/u/0/home/settings?hl=en", { waitUntil: "networkidle2" });
    await gotoWithEmail({ page, emailToWorkWith, url: "https://pay.google.com/gp/w/u/0/home/settings?hl=en" });
    // throw "temp -123";
    await page.waitForTimeout(3000);
    const visitedUrl = await page.url();
    // const url = await page.url();
    console.log(" - openSettings - visitedUrl", visitedUrl);
    emailToWorkWith.inWork = true;
    if (visitedUrl.includes("/home/signup")) {
        // console.log(card);

        console.log(" -  - openSettings", 'visitedUrl.includes("/home/signup"');

        try {
            await fillPayNewForm({ page, emailToWorkWith });
            await page.waitForTimeout(15000);
            return { ok: true, message: "Card is added" };
        } catch (e) {
            console.log(e);
            return { ok: false, message: "Problem adding card" };
        }
        // return {ok:true};
    }
    if (visitedUrl.includes("/home/settings")) {
        console.log(" -  - openSettings - visitedUrl", 'visitedUrl.includes("/home/settings)"');

        const manyProfiles = await page.$('i[aria-label="More payments profile"]');
        if (manyProfiles) {
            console.log(" -  - openSettings ", " if (manyProfiles) - true");

            console.log("manyProfiles");
            await manyProfiles.click();
            await page.waitForTimeout(1000);

            const createdProfiles = await page.$$('li[data-resource-for-permission-check="WEB5_SETTINGS"]');
            for (let cP of createdProfiles) {
                const shouldCLick = await cP.evaluate((el) => {
                    return el.innerText && el.innerText.toLowerCase().includes("philippines");
                });
                if (shouldCLick) {
                    await cP.click();
                    console.log("philippines are already here");
                    await page.waitForTimeout(1000);
                    break;
                }
            }
            return await addCardToExistingProfile({ page });
        } else {
            console.log(" -  - openSettings ", " if (manyProfiles) - false");
            await createNewPaymentProfile({ page });

            return await addCardToExistingProfile({ page });

            // return;
        }
    }
}

module.exports = {
    fillPayNewForm,
    openSettings,
};
