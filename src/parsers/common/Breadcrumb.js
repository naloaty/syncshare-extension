import { removeInvisible } from "Utils/strings"

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


        document.querySelectorAll(".breadcrumb a").forEach(a => {
            const url = new URL(a.href);

            switch (url.pathname) {
                case "/course/view.php":
                    this.courseName = removeInvisible(a.innerText);
                    this.courseId = parseInt(url.searchParams.get("id"));
                    break;

                case "/mod/quiz/view.php":
                    this.quizName = removeInvisible(a.innerText);
                    this.quizId = parseInt(url.searchParams.get("id"));
                    break;
            }
        });
    }
}

export default Breadcrumb;