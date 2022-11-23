import "@/core/umami.js";
import Mediator from "@/core/transport.js";
import { log } from "@/core/log";
import axios from "axios";

log("*Background* background script loaded !");


// ================| ANALYTICS |================

setTimeout(() => {
    window.umami.trackEvent(`SyncShare v${VERSION}`, { type: "activity" });
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
        outdated: {
            viewDelay: 500
        },
        status: {
            viewDelay: 500
        }
    }
}


Mediator.subscribe("get-messages", (data, sender) => {
    Mediator.publish("get-messages-result", messages, sender.tab.id);
});

Mediator.subscribe("update-messages", (data, sender) => {
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

            Mediator.publish("on-messages-updated", messages, sender.tab.id);
            log("Messages updated", messages);
        })
        .catch(error => {
            log("Cannot update modal messages", error);
        });
});

// ================| SYNCSHARE UPDATE |================

Mediator.subscribe("check-version", (data, sender) => {
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

            Mediator.publish("check-version-result", result, sender.tab.id);
        })
        .catch(error => {
            log("Cannot check for update", error);
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

            Mediator.publish("check-status-result", result.status, sender.tab.id);
        })
        .catch(error => {
            log("Cannot check SyncShare status", error);
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
        showDonation: false
    }
}

Mediator.subscribe("magic-used", data => {
    register(data.attemptId);
    attempts[data.attemptId].magicUsed += 1;
});

Mediator.subscribe("menu-opened", data => {
    register(data.attemptId);
    attempts[data.attemptId].menuOpened += 1;
});

Mediator.subscribe("submitted", data => {
    register(data.attemptId);

    const stats = attempts[data.attemptId];

    if (messages.settings.donation != null) {
        const settings = messages.settings.donation
        const openMin = settings.menuOpened;
        const useMin = settings.magicUsed;

        if (stats.menuOpened >= openMin && stats.magicUsed >= useMin) {
            stats.showDonation = true;
        }
    }
});

Mediator.subscribe("check-donation", (data, sender) => {
    const stats = attempts[data.attemptId];

    Mediator.publish("check-donation-result", { show: stats.showDonation }, sender.tab.id);

    if (stats.showDonation) {
        stats.magicUsed = 0;
        stats.menuOpened = 0;
        stats.showDonation = false;
    }
});