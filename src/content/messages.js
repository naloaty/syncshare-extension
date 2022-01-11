import Mediator from "@/core/transport.js";
import Modal from "modal-vanilla";
import { log } from "@/core/log";
import { Events } from  "@/core/analytics.js";

log("*Messages* content script loaded !");

let messages = null;

// request messages
Mediator.publish("get-messages", {});

Mediator.subscribe("get-messages-response", data => {
    messages = data;
});

function setMessage(dialog, delay, type, location) {
    setTimeout(() => {
        const modal = dialog.show();
        modal.once("dismiss", function (modal, ev, button) {
            if (button && button.value) {
                window.open(button.url, "_blank").focus();
            }

            if (button && button.text) {
                window.umami.trackEvent(`Modal action (${location}, ${type}: ${button.text})`, Events.click);
            }
        });
    }, delay);
}

function showDonationMessage(setter, location) {
    if (!messages) {
        log("Cannot show donation message: messages is null");
    }

    const delay = setter(messages.settings.donation);
    const donation = new Modal(messages.content.donation);

    setMessage(donation, delay, "donation", location);
    window.umami.trackEvent(`Donation shown (${location})`, Events.modal);
}

function showOutdatedMessage(setter, location) {
    if (!messages) {
        log("Cannot show outdated message: messages is null");
    }

    const delay = setter(messages.settings.outdated);
    const outdated = new Modal(messages.content.outdated);

    setMessage(outdated, delay, "outdated", location);
    window.umami.trackEvent(`Outdated shown (${location})`, Events.modal);
}

function showStatusMessage(setter, location) {
    if (!messages) {
        log("Cannot show status message: messages is null");
    }

    const delay = setter(messages.settings.status);
    const status = new Modal(messages.content.status);

    setMessage(status, delay, "status", location);
    window.umami.trackEvent(`Status shown (${location})`, Events.modal);
}


export { showDonationMessage, showOutdatedMessage, showStatusMessage };