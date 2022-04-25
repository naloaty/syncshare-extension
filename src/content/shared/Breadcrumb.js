import { removeInvisible } from "shared/utils/strings"

class Breadcrumb {

    constructor() {
        /** @type {string} */
        this.courseName = null;

        /** @type {number} */
        this.courseId = null;

        /** @type {string} */
        this.quizName = null;
        
        /** @type {number} */
        this.quizId = null;

        const items = document.querySelectorAll(".breadcrumb a");

        for (const item of items) {
            const url = new URL(item.href);

            if (url.pathname.includes("/course/view.php")) {
                if (this.courseName) continue;

                this.courseId = parseInt(url.searchParams.get("id"));
                this.courseName = removeInvisible(item.innerText);
            }
            else if (url.pathname.includes("/mod/quiz/view.php")) {
                if (this.quizName) continue;

                this.quizId = parseInt(url.searchParams.get("id"));
                this.quizName = removeInvisible(item.innerText);
            }
        }
    }
}

export default Breadcrumb;