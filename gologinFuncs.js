// const { status, wsUrl } = await GL2.start();

    // const cookies = [
    //     {
    //         domain: ".google.com",
    //         flag: true,
    //         path: "/ads/measurement",
    //         secure: true,
    //         expirationDate: 1646038921,
    //         name: "TAID",
    //         value: "AJHaeXKgo1cz-DfXhf8XinE01tkxhPob6BH8BD095NW7tUWDxKFD1CTunLsF6q8ohLB0YT_0eLKJPYoL03V8o_RluGKvDgIkzILLOYtgLD-yLFs495OfsS72sJXCrsrWP6ETYxo-",
    //     },
    // ].map((el) => {
    //     // el.url = `https://${el.domain}${el.path}`;
    //     return el;
    // });

    // console.log(cookies);

    // await GL2.postCookies(profiles[0].id, cookies);
    // await GL2.getRandomFingerprint({ os: "win32" });
    // await GL2.update({
    //     id: profiles[0].id,
    //     name: "profile_win",
    //     proxy: {
    //         ...profiles[0].proxy,
    //         port: 5002,
    //     },
    // });

    // const randomFingerPrint = await GL2.getRandomFingerprint({ os: "win" });
    // const { navigator, fonts, webGLMetadata, webRTC, canvas, mediaDevices, webglParams, devicePixelRatio } =
    //     randomFingerPrint;
    // const json = {
    //     id: profiles[0].id,
    //     // ...randomFingerPrint,
    //     navigator,
    //     // webGLMetadata,
    //     // browserType: "chrome",
    //     // // name: "default_name",
    //     // // notes: "auto generated",
    //     fonts: {
    //         families: fonts,
    //     },
    //     webRTC: {
    //         ...webRTC,
    //         mode: "alerted",
    //     },
    //     canvas,
    //     mediaDevices,
    //     webglParams,
    //     devicePixelRatio,
    // };
    // await GL2.update(json);