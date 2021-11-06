const { getCardHolder, getNewCard } = require("./utils");

const main = async () => {
    const x = await getNewCard();
    console.log(x);
};
main();
