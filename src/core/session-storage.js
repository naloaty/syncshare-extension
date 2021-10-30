import Mediator from "@/core/transport.js";
import { getRandomBounds } from "@/core/tools.js";

export const sessionStorage = (() => {

    const getItem = async (key) => {
        const id = getRandomBounds(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        const data = { id, key };
        Mediator.publish("sessionGetItem", data);

        return new Promise((resolve) => {
            Mediator.subscribe(`sessionItem(${id},${key})`, (data) => {
                resolve(data.item);
            }, true);
        });
    };

    const setItem = (key, value) => {
        const data = { key, value };
        Mediator.publish("sessionSetItem", data);
    };

    return { getItem, setItem }

})();