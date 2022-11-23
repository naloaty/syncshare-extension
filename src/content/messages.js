import "@/core/umami.js";
import Mediator from "@/core/transport.js";
import Modal from "modal-vanilla";
import { log } from "@/core/log";
import { Events } from  "@/core/analytics.js";

log("*Messages* content script loaded !");

let messages = null;

Mediator.publish("update-messages", {});

Mediator.subscribe("on-messages-updated", data => {
    messages = data;
    showOtherMessages();
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

    if (isValid(messages.content.donation)) {
        const delay = setter(messages.settings.donation);
        const donation = new Modal(messages.content.donation);

        setMessage(donation, delay, "donation", location);
        window.umami.trackEvent(`Donation shown (${location})`, Events.modal);
    }
}

function showOutdatedMessage(setter, location) {
    if (!messages) {
        log("Cannot show outdated message: messages is null");
    }

    if (isValid(messages.content.outdated)) {
        const delay = setter(messages.settings.outdated);
        const outdated = new Modal(messages.content.outdated);

        setMessage(outdated, delay, "outdated", location);
        window.umami.trackEvent(`Outdated shown (${location})`, Events.modal);
    }
}

function showStatusMessage(setter, location) {
    if (!messages) {
        log("Cannot show status message: messages is null");
    }

    if (isValid(messages.content.status)) {
        const delay = setter(messages.settings.status);
        const status = new Modal(messages.content.status);

        setMessage(status, delay, "status", location);
        window.umami.trackEvent(`Status shown (${location})`, Events.modal);
    }
}

function isValid(obj) {
    return obj != null;
}

function showOtherMessages() {
    if (!messages) {
        log("Cannot show other messages: messages is null");
    }

    const builtIn = ['donation', 'status', 'outdated']

    for (const [name, msg] of Object.entries(messages.content)) {
        if (builtIn.includes(name))
            continue;

        const settings = messages.settings[name];
        const content = messages.content[name];

        if (!isValid(settings)) {
            log(`Plain message has invalid settings: ${name}`);
            continue;
        }

        if (settings.onetime) {
            const msgState = localStorage.getItem(`msg-state-${name}`)

            if (isValid(msgState))
                continue;

            localStorage.setItem(`msg-state-${name}`, "shown");
        }

        const modal = new Modal(content);
        setMessage(modal, settings.delay, "plain","view");
        window.umami.trackEvent(`Plain message shown (${location})`, Events.modal);
    }
}



export { showDonationMessage, showOutdatedMessage, showStatusMessage };