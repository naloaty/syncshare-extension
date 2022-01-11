import "@/core/umami.js";
import Mediator from "@/core/transport.js";
import { Events } from "@/core/analytics.js";
import { log } from "@/core/log";
import axios from "axios";

log("*Background* background script loaded !");


// ================| ANALYTICS |================

const sessionStorage = window.localStorage;

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

setTimeout(() => {
    window.umami.trackEvent(`Version ${VERSION}`, Events.data);
}, 3000);


// ================| QUIZ |================

const serviceProperties = {
    v: "1.1",
    s: VERSION
}

const api = {
    quiz: {
        attempt: SERVICE_URL + "/quiz/attempt",
        solution: SERVICE_URL + "/quiz/solution"
    },
    service: {
        messages: SERVICE_URL + "/service/messages",
        update: SERVICE_URL + "/service/update",
        status: SERVICE_URL + "/service/status"
    }

}


function sendQuizData(data) {
    axios.post(api.quiz.attempt, { ...data, ...serviceProperties })
        .catch(error => log("Cannot send quiz data to server", error));
}

Mediator.subscribe("attempt-data", (data) => {
    log("Attempt data received", data);
    sendQuizData(data);
});

Mediator.subscribe("review-data", (data) => {
    log("Review data received", data);
    sendQuizData(data);
});

Mediator.subscribe("sol-request", (request, sender) => {
    const { host, qid, type, quizId, courseId } = request;

    axios.get(api.quiz.solution, {
        params: {
            host,
            qid,
            type,
            quizId,
            courseId,
            ...serviceProperties
        }
    })
        .then(response => {
            Mediator.publish(`sol-resp-${host}@${qid}`, response.data.result, sender.tab.id);
        })
        .catch(error => log("Solution request failed", error));
});

// ================| MODAL MESSAGES |================

const messages = {
    content: {
        donation: {
            title: "SyncShare",
            content: "Расширение оказалось полезным или помогло решить тест?\nПоддержите дальнейшую работу и развите проекта!",
            construct: true,
            keyboard: false,
            backdrop: "static",
            headerClose: false,
            buttons: [
                {
                    text: "Закрыть",
                    value: false,
                    attr: {
                        "class": "btn btn-default",
                        "data-dismiss": "modal"
                    }
                },
                {
                    text: "Поддержать",
                    value: true,
                    url: "https://syncshare.naloaty.me/#donation",
                    attr: {
                        "class": "btn btn-primary",
                        "data-dismiss": "modal"
                    }
                }
            ]
        },
        outdated: {
            title: "SyncShare",
            content: "Установленная версия расширения устарела и более не поддерживается. Обновите SyncShare до актуальной версии",
            construct: true,
            keyboard: false,
            backdrop: "static",
            headerClose: false,
            buttons: [
                {
                    text: "Закрыть",
                    value: false,
                    attr: {
                        "class": "btn btn-default",
                        "data-dismiss": "modal"
                    }
                },
                {
                    text: "Обновить",
                    value: true,
                    url: "https://syncshare.naloaty.me/#install",
                    attr: {
                        "class": "btn btn-primary",
                        "data-dismiss": "modal"
                    }
                }
            ]
        },
        status: {
            title: "SyncShare",
            content: "Внимание! В данный момент сервисы SyncShare не доступны. Расширение не сможет помочь Вам с решением теста.",
            construct: true,
            keyboard: false,
            backdrop: "static",
            headerClose: false,
            buttons: [
                {
                    text: "Закрыть",
                    value: false,
                    attr: {
                        "class": "btn btn-primary",
                        "data-dismiss": "modal"
                    }
                }
            ]
        }
    },
    settings: {
        donation: {
            menuOpenRatio: 0.6,
            magicUseRatio: 0.2,
            viewDelay: 3000,
            reviewDelay: 5000
        },
        outdated: {
            viewDelay: 500
        },
        status: {
            viewDelay: 500
        }
    }
}

setTimeout(() => {
    axios.get(api.service.messages, {
        params: {
            ...serviceProperties
        }
    })
        .then(response => {
            const result = response.data;

            if (!result?.content || !result?.settings) {
                return;
            }

            messages.content = result.content;
            messages.settings = result.settings;
        })
        .catch(error => {
            log("Cannot update modal messages", error);
        });
}, 5000);

Mediator.subscribe("get-messages", (data, sender) => {
    Mediator.publish("get-messages-response", messages, sender.tab.id);
});

// ================| SYNCSHARE UPDATE |================

Mediator.subscribe("is-outdated", (data, sender) => {
    axios.get(api.service.update, {
        params: {
            ...serviceProperties
        }
    })
        .then(response => {
            const result = response.data;

            if (!result) {
                return;
            }

            if (result.outdated == null) {
                return;
            }

            Mediator.publish("is-outdated-response", result, sender.tab.id);
        })
        .catch(error => {
            log("Cannot check for update", error);
            Mediator.publish("is-outdated-response", { outdated: false }, sender.tab.id);
        });
});

//================| SYNCSHARE STATUS |================
Mediator.subscribe("check-status", (data, sender) => {
    axios.get(api.service.status, {
        params: {
            ...serviceProperties
        }
    })
        .then(response => {
            const result = response.data;

            if (!result) {
                return;
            }

            if (result.status == null) {
                return;
            }

            Mediator.publish("check-status-response", result.status, sender.tab.id);
        })
        .catch(error => {
            log("Cannot check SyncShare status", error);
            Mediator.publish("check-status-response", {
                offline: true
            }, sender.tab.id);
        });
});

// ================| STATE TRACKER |================

const attempts = {};

const register = (attemptId) => {
    if (attempts[attemptId])
        return;

    attempts[attemptId] = {
        magicUsed: 0,
        menuOpened: 0,
        menuAttached: 0,
        showModal: false
    }
}

Mediator.subscribe("msg-settings-update", data => {
    register(data.attemptId);
    attempts[data.attemptId].magicUsed += 1;
});

Mediator.subscribe("magic-used", data => {
    register(data.attemptId);
    attempts[data.attemptId].magicUsed += 1;
});

Mediator.subscribe("menu-opened", data => {
    register(data.attemptId);
    attempts[data.attemptId].menuOpened += 1;
});

Mediator.publish("menu-attached", data => {
    register(data.attemptId);
    attempts[data.attemptId].menuAttached += 1;
});

Mediator.subscribe("submitted", data => {
    register(data.attemptId);

    const stats = attempts[data.attemptId];
    const openRatio = stats.menuOpened / stats.menuAttached;
    const useRatio = stats.magicUsed / stats.menuAttached;

    const openMin = messages.settings.donation.menuOpenRatio;
    const magicMin = messages.settings.donation.magicUseRatio;

    if (openRatio >= openMin || useRatio >= magicMin) {
        stats.showModal = true;
    }
});

Mediator.subscribe("checkForModal", (data, sender) => {
    const stats = attempts[data.attemptId];

    Mediator.publish("checkForModal", { show: stats.showModal }, sender.tab.id);

    if (stats.showModal) {
        stats.showModal = false;
    }
});