import DataSource from "shared/utils/DataSource";
import {removeInvisible} from "shared/utils/strings";

class BreadcrumbSource extends DataSource {

    evaluate() {
        /** @type {String[]} */
        this.data.bcItems = [];

        const links = document.querySelectorAll(".breadcrumb a");
        const items = document.querySelectorAll(".breadcrumb-item");

        for (const item of items) {
            this.data.bcItems.push(removeInvisible(item.innerText));
        }

        for (const link of links) {
            const url = new URL(link.href);

            if (url.pathname.includes("/course/view.php")) {
                if (this.data.courseName) continue;

                /** @type {number} */
                this.data.courseId = parseInt(url.searchParams.get("id"));

                /** @type {String} */
                this.data.courseName = removeInvisible(link.innerText);
            }
            else if (url.pathname.includes("/mod/quiz/view.php")) {
                if (this.data.quizName) continue;

                /** @type {number} */
                this.data.quizId = parseInt(url.searchParams.get("id"));

                /** @type {String} */
                this.data.quizName = removeInvisible(link.innerText);
            }
        }
    }
}

export default BreadcrumbSource;