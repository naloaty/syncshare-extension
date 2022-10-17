import Mediator from "@/core/transport.js";
import { log } from "@/core/log";
import * as MSG from "@/content/messages";

log("*View* content script loaded !");

const url = new URL(document.referrer);
const attemptId = parseInt(url.searchParams.get("attempt"));

Mediator.publish("checkForModal", { 
    attemptId: attemptId
});

Mediator.subscribe("checkForModal", data => {
    if (data.show) {
        MSG.showDonationMessage(settings => settings.viewDelay, "view");
    }
});

Mediator.publish("is-outdated", {});

Mediator.subscribe("is-outdated-response", data => {
    if (data.outdated) {
        MSG.showOutdatedMessage(settings => settings.viewDelay, "view");
    }
});

Mediator.publish("check-status", {});

Mediator.subscribe("check-status-response", data => {
    if (data.offline) {
        MSG.showStatusMessage(settings => settings.viewDelay, "view");
    }
});