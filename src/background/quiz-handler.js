import Mediator from "@/core/transport.js";
import { log } from "@/core/log.js";

const server = SERVICE_URL;
const attemptApi = "/quiz/attempt";
const solutionApi = "/quiz/solution"

const getApi = (uri) => {
    return server + uri;
}

const sendData = (data) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open("POST", getApi(attemptApi), true);
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE)
            return;

        if (xhr.status !== 200) {
            log("Cannot send data to server", xhr.response);
        }
    }
    xhr.send(JSON.stringify(data));
}

Mediator.subscribe("attempt-data", (data) => {
    log("Attempt data received", data);
    sendData(data);
});

Mediator.subscribe("review-data", (data) => {
    log("Review data received", data);
    sendData(data);
});

Mediator.subscribe("sol-request", (data, sender) => {
    const { host, qid, type, quizId, courseId } = data;
    const params = `host=${host}&qid=${qid}&type=${type}&quizId=${quizId}&courseId=${courseId}&v=1.0`;
    const url = getApi(solutionApi);

    const xhr = new XMLHttpRequest();

    xhr.open("GET", url + '?' + params, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE)
            return;

        if (xhr.status == 200) {
            const solution = JSON.parse(xhr.response).result;
            Mediator.publish(`sol-resp-${host}@${qid}`, solution, sender.tab.id);
        }
        else {
            log("Solution request failed", xhr.response);
        }
    }

    xhr.send();
});