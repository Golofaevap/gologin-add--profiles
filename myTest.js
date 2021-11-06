const fs = require("fs");
const session = {
    profileId: "123",
    current: {
        test: 1,
    },
    save: null,
};
console.log(session);
const saveSession = (session) => {
    const current = session.current;
    session.current = null;
    fs.writeFileSync(`./sessions/${session.profileId}.json`, JSON.stringify(session));
    session.current = current;
};
session.save = saveSession;
session.save(session);
console.log(session);
