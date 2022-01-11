import Mediator from "@/core/transport.js";
import Modal from "modal-vanilla";
import { log } from "@/core/log";

log("*Messages* content script loaded !");

let messages = null;

// request messages
Mediator.publish("get-messages", {});

Mediator.subscribe("get-messages-response", data => {
    messages = data;
});

function setMessage(dialog, delay) {
    setTimeout(() => {
        const modal = dialog.show();
        modal.once("dismiss", function (modal, ev, button) {
            if (button && button.value) {
                window.open(button.url, "_blank").focus();
            }
        });
    }, delay);
}

function showDonationMessage(setter) {
    if (!messages) {
        log("Cannot show donation message: messages is null");
    }

    const delay = setter(messages.settings.donation);
    const donation = new Modal(messages.content.donation);

    setMessage(donation, delay);
}

function showOutdatedMessage(setter) {
    if (!messages) {
        log("Cannot show outdated message: messages is null");
    }

    const delay = setter(messages.settings.outdated);
    const outdated = new Modal(messages.content.outdated);

    setMessage(outdated, delay);
}

function showStatusMessage(setter) {
    if (!messages) {
        log("Cannot show status message: messages is null");
    }

    const delay = setter(messages.settings.status);
    const status = new Modal(messages.content.status);

    setMessage(status, delay);
}


export { showDonationMessage, showOutdatedMessage, showStatusMessage };