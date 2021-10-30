import "webpack-target-webextension/lib/background";
import "@/core/umami.js";
import Mediator from "@/core/transport.js";
import { Events } from "@/core/analytics.js"

const sessionStorage = window.sessionStorage;

Mediator.subscribe("sessionGetItem", (data, sender) => {
    const { id, key } = data;

    Mediator.publish(`sessionItem(${id},${key})`, { 
        item: sessionStorage.getItem(key) 
    }, sender?.tab?.id);

});

Mediator.subscribe("sessionSetItem", (data) => {
    const { key, value } = data;
    sessionStorage.setItem(key, value);
});

window.umami.trackEvent(`Version ${VERSION}`, Events.data);