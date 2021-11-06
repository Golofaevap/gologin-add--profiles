const GoLogin = require("gologin");
const { readSession, parseInputArgs } = require("../utils");

(async () => {
  const args = await parseInputArgs(process.argv);
  //   console.log(args);
  //   return;
  if (!args.obtained) return console.log(args.message);
  const { profileId, offer } = args.args;
  const GL2 = new GoLogin({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MTcyZGI0NWJkMTNkYzNiNTdkMDYxMTkiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2MTcyZGI2NGVmYWNhMjcxODkxMTQ2NjUifQ.dXnU4Srj9IXZAylhyW4temIBpSXMDa8vq4bLfzCn47c",
    profile_id: profileId,
  });

  const session = await readSession(args.args);

  console.log(session);
  return;
  if (session && session.gmailCreated)
    return console.log("Email is already created in this profile");
  const { status, wsUrl } = await GL2.start();

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl.toString(),
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
})();
