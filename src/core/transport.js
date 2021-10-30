import browser from "webextension-polyfill";

const Mediator = (() => {
    const topics = {};

    const onPackage = (pkg, sender) => {
        if (!pkg.topic)
            return;

        if (!topics[pkg.topic])
            return;

        for (let sub of topics[pkg.topic]) {
            sub.callback.call(sub.context, pkg.data, sender);
        }

        if (topics[pkg.topic].onetime)
            delete topics[pkg.topic];
    }

    browser.runtime.onMessage.addListener(onPackage);

    const subscribe = (topic, fn, onetime = false) => {
        if (!topics[topic]) {
            topics[topic] = [];
        }

        topics[topic].push({
            context: this,
            onetime: onetime,
            callback: fn
        });
    }

    const publish = (topic, data, destination) => {
        const pkg = {
            topic: topic,
            data: data
        }

        if (destination)
            browser.tabs.sendMessage(destination, pkg);
        else {
            browser.runtime.sendMessage(pkg)
                .catch(() => onPackage(pkg));
        }
            
    }

    return { publish, subscribe };
})();

export default Mediator;