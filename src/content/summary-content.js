import Mediator from "@/core/transport.js";
import PageMeta from "@/content/page-parser";
import { log } from "@/core/log";

log("*Summary* content script loaded !");

const onClick = (ev) => {
    setTimeout(() => {
        const confDialog = document.querySelector("div.confirmation-dialogue");

        if (!confDialog) {
            return;
        }

        const finishButton = confDialog.querySelector("input[type=\"button\"].btn.btn-primary")
        finishButton.addEventListener("click", ev => {
            Mediator.publish("submitted", { 
                attemptId: PageMeta.attemptId
            });
        });
    }, 500);

    dndArrow.removeEventListener("click", setHook);
    btnAdd.removeEventListener("click", setHook);
}

const submitButton = document.querySelector("form[action*=\"mod/quiz/processattempt.php\"] > button[type=\"submit\"]");
submitButton.addEventListener("click", onClick);