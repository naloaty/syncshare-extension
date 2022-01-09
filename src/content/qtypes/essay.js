import Question from "@/content/qtypes/question.js";
import { washString, packImages, uploadFormulationImages } from "@/core/tools.js";
import { v4 as uuidv4 } from "uuid";
import Mediator from "@/core/transport.js";


class EssayQ extends Question {

    constructor(meta, queDiv) {
        super(meta, queDiv);

        const dndContainer = this.base.querySelector("div.attachments div.filemanager-container.card");

        this.attachments = [];

        const uploadAttachment = (file) => {
            const title = uuidv4();

            Mediator.publish("upload-solution", { title, file });
            this.attachments.push(title);
        }

        if (dndContainer) {
            dndContainer.addEventListener("drop", ev => {
                ev.preventDefault();

                for (const file of ev.dataTransfer.files) {
                    uploadAttachment(file);
                }
            });
        }

        const dndArrow = this.base.querySelector("div.dndupload-arrow");
        const btnAdd = this.base.querySelector("div.fp-btn-add");

        const onClick = (ev) => {
            setTimeout(() => {
                const uploadDiv = document.querySelector("div.repository_upload");
    
                if (!uploadDiv) {
                    return;
                }

                const uploadInput = uploadDiv.querySelector("input[type=\"file\"][name=\"repo_upload_file\"]");
                const uploadButton = uploadDiv.querySelector("button.fp-upload-btn.btn-primary.btn");
    
                uploadButton.addEventListener("click", ev => {
                    for (const file of uploadInput.files) {
                        uploadAttachment(file);
                    }
                });
            }, 500);

            dndArrow.removeEventListener("click", setHook);
            btnAdd.removeEventListener("click", setHook);
        }

        dndArrow.addEventListener("click", onClick);
        btnAdd.addEventListener("click", onClick);
    }

    getText() {
        const text = this.base.querySelector("div.qtext");
        const images = text.querySelectorAll("img");

        const imageFiles = uploadFormulationImages(images);

        return {
            plain: text.innerText,
            images: packImages(images),
            imageFiles: imageFiles
        };
    }

    getAnswers() {
        const editor = this.base.querySelector("div[role=\"textbox\"].editor_atto_content.form-control");
        const text = washString(editor.innerText) ? editor.innerText : "";

        return [
            {
                attachTo: null,
                value: { text, attachments: this.attachments },
                state: -1,
            }
        ];
    }

    getFeedback() {
        return [];
    }

    getWidgetToken(attachTo) {
        return null;
    }

}

export default EssayQ;