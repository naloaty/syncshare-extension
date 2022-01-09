import Mediator from "@/core/transport.js";
import { log } from "@/core/log.js";
import axios from "axios";
import FormData from "form-data";

const serviceProperties = {
    v: "1.1"
}

const api = {
    quiz: {
        attempt: SERVICE_URL + "/quiz/attempt",
        solution: SERVICE_URL + "/quiz/solution"
    },
    upload: {
        solution: SERVICE_URL + "/upload/solution",
        formulation: SERVICE_URL + "/upload/formulation"
    }
}

async function uploadFile(api, title, file) {
    log("Uploading file...", file);

    const form = new FormData();
    form.append("title", title);
    form.append("file", file);

    const resp = await axios({
        method: "post",
        url: api,
        data: form,
        headers: { "Content-Type": "multipart/form-data" }
    });

    return resp.status;
}

function sendQuizData(data) {
    axios.post(api.quiz.attempt, { ...data, ...serviceProperties })
        .catch(error => log("Cannot send quiz data to server", error));
}

Mediator.subscribe("upload-solution", (data) => {
    const { title, file } = data;

    uploadFile(api.upload.solution, title, file)
        .then(status => {
            if (status === 200) {
                log(`Solution ${title} uploaded successfully!`);
            }
            else {
                log(`Unexpected server behavior: ${status}`);
            }
        })
        .catch(error => {
            log("Soltion upload failed", error);
        });
});

Mediator.subscribe("upload-formulation", (data) => {
    const { title, file } = data;

    uploadFile(api.upload.formulation, title, file)
        .then(status => {
            if (status === 200) {
                log(`Formulation ${title} uploaded successfully!`);
            }
            else {
                log(`Unexpected server behavior: ${status}`);
            }
        })
        .catch(error => {
            log("Formulation upload failed", error);
        });
});


Mediator.subscribe("attempt-data", (data) => {
    log("Attempt data received", data);
    sendQuizData(data);
});

Mediator.subscribe("review-data", (data) => {
    log("Review data received", data);
    sendQuizData(data);
});

Mediator.subscribe("sol-request", (data, sender) => {
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
            const solution = JSON.parse(response);
            Mediator.publish(`sol-resp-${host}@${qid}`, solution, sender.tab.id);
        })
        .catch(error => log("Solution request failed", error));
});