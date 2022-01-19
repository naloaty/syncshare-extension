import logger from "Internal/log";
import browser from "webextension-polyfill";

class QuizService {
    
    init() {
        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-review-data")
                return;

            this.onReviewData(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-attempt-data")
                return;

            this.onAttemptData(data.payload);
        });

        browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
            if (data?.type !== "solution-request")
                return;

            this.onSoultionRequest(data.payload, sendResponse);
        });

        logger.info("QuizService: initialized");
    }

    onReviewData(data) {
        console.log("Review data received");
    }

    onAttemptData(data) {
        console.log("Attempt data received", data);
    }

    onSoultionRequest(body, sendResponse) {
        console.log("Solution request received", body);
    }
}

new QuizService().init();