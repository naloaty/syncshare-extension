/*
 * This module contains Bus object - a central exchange point 
 * across whole web-extension. It helps other modules to communicate
 * with each other by broadcasting/subscribing to messages and sending/serving requests.
 */

import browser from "webextension-polyfill";
import Log from "Internal/log"

/*
 * Scope must be used to specify destination for broadcasts and requests.
 * Notice that tabId is required to send message from background script
 * to content script. 
 */
const Scope = {
    content(tab) { 
        return { name: "content", tab: tab }
    },
    background() { 
        return { name: "background", tab: null } 
    }
}


class BusClass {
    
    constructor() {
        this.topics = {};
        this.services = {};

        const tabId = browser.runtime.tabs.getCurrent()?.tabId;
        this.scope = Scope.content(tabId ? tabId : null);

        browser.runtime.sendMessage("Bus.check: check msg")
            .catch(() => this.scope = Scope.background());

        browser.runtime.onMessage.addListener(this.onParcel);
    }

    onParcel(parcel) {
        // Must be 'publish' or 'request'
        if (!parcel?.type) return;

        // Must be broadcast topic or service name
        if (!parcel?.recipient) return;

        // Must be Scope object representing origin scope
        if (!parcel?.origin) return;

        // Must contain 'payload' field with broadcast msg or request body
        if (!parcel.payload) return;

        if ("publish" === parcel.type) {
            const subs = this.topics[parcel.recipient];

            if (!subs) {
                Log.warn("Bus.onParacel: topic with no subscribers", parcel);
                return;
            }

            subs.forEach(sub => {
                try {
                    sub.callback.call(sub.context, parcel.payload)
                }
                catch (error) {
                    Log.error(error, "Bus.onParcel: one of the subscribers threw an error", parcel);
                }
            });
            return;
        }

        if ("request" === parcel.type) {
            const service = this.services[parcel.recipient];

            if (!service) {
                Log.warn("Bus.onParcel: unknown service", parcel);
                return;
            }

            return new Promise((resolve, reject) => {
                try {
                    resolve(service.callback.call(service.context, parcel.payload))
                }
                catch (error) {
                    reject(error)
                }
            });
        }
    }

    sendParcel(parcel) {
        const dest = parcel.destination?.name;

        if (!dest) {
            const error = new Error("Bus: specified wrong scope obj")
            Log.error(error, parcel);
            throw error;
        }

        if ("content" === dest.name) {
            if ("content" === this.scope.name)
                return this.onParcel(parcel);

            else if (parcel.destination?.tabId)
                return browser.tabs.sendMessage(dest.tabId, parcel);

            const error = new Error("Bus: tabId must be specified for 'background' -> 'content' route");
            Log.error(error, parcel);
            throw error;
        }

        if ("background" === dest.name) {
            if ("background" === this.scope.name)
                return this.onParcel(parcel);    
            else
                return browser.runtime.sendMessage(parcel); 
        }
    }

    publish(scope, topic, data) {
        const parcel = {
            type: "publish",
            recipient: topic,
            destination: scope,
            origin: this.scope,
            payload: data
        }

        this.sendParcel(parcel);
    }

    request(scope, service, body) {
        const parcel = {
            type: "request",
            recipient: service,
            destination: scope,
            origin: this.scope,
            payload: body
        }

        return this.sendParcel(parcel);
    }

    subscribe(topic, callback) {
        if (!this.topics[topic])
            topic[topic] = [];

        topic[topic].push({context: this, callback});
    }

    serve(service, callback) {
        this.services[service] = {context: this, callback};
    }
}


const bus = new BusClass();

if (bus.contentScope)
    Log.debug("Bus.check: content");
else
    Log.debug("Bus.check: background");

const Bus = {
    publish: bus.publish,
    subscribe: bus.subscribe,
    request: bus.request,
    serve: bus.serve
}

export { Scope, Bus };