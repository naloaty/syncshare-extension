import "@/core/umami.js";
import Mediator from "@/core/transport.js";
import { log } from "@/core/log";
import * as MSG from "@/content/messages";

log("*View* content script loaded !");

const url = new URL(document.referrer);
const attemptId = parseInt(url.searchParams.get("attempt"));

Mediator.publish("check-donation", { attemptId: attemptId });
Mediator.publish("check-version", {});
Mediator.publish("check-status", {});


Mediator.subscribe("check-donation-result", data => {
    if (data.show) {
        MSG.showDonationMessage(settings => settings.viewDelay, "view");
    }
});

Mediator.subscribe("check-version-result", data => {
    if (data.outdated) {
        MSG.showOutdatedMessage(settings => settings.viewDelay, "view");
    }
});

Mediator.subscribe("check-status-result", data => {
    if (data.offline) {
        MSG.showStatusMessage(settings => settings.viewDelay, "view");
    }
});