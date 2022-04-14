import logger from "shared/debug/log";
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

            this.onSolutionRequest(data.payload, sendResponse);
        });

        logger.info("QuizService: initialized");
    }

    onReviewData(data) {
        console.log("Review data received");
    }

    onAttemptData(data) {
        console.log("Attempt data received", data);
    }

    onSolutionRequest(body, sendResponse) {
        console.log("Solution request received", body);

        if (body.qId === 1346) {
            sendResponse([
                {
                    anchor: {
                    },
                    
                    suggestions: [
                        {
                            correctness: -1,
                            confidence: 0.87,
                            item: {
                                label: "A hashtag",
                                data: {
                                    sign: "A hashtag"
                                }
                            }
                        },
                        {
                            correctness: 2,
                            confidence: 0.87,
                            item: {
                                label: "A hashtag",
                                data: {
                                    sign: "A hashtag"
                                }
                            }
                        }
                    ],
    
                    submissions: [
                        {
                            correctness: 1,
                            count: 1,
                            item: {
                                label: "A hashtag",
                                data: {
                                    sign: "A hashtag"
                                }
                            }
                        },
                        {
                            correctness: 0,
                            count: 1,
                            item: {
                                label: "A hashtag fhjhfjss",
                                data: {
                                    sign: "A hashtag"
                                }
                            }
                        }
                    ]
                }
            ]);
        } 
        else if (body.qId === 1350) {
            const item = {
                label: "False",
                data: {
                    sign: "False"
                }
            }
    
            sendResponse([
                {
                    anchor: {
                    },
                    
                    suggestions: [
                        {
                            correctness: 2,
                            confidence: 0.87,
                            item: item
                        }
                    ],
    
                    submissions: [
                        {
                            correctness: 2,
                            count: 1,
                            item: item
                        }
                    ]
                }
            ]);
        }
    }
}

export default QuizService;