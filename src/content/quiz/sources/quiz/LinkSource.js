import DataSource from "shared/utils/DataSource";

class LinkSource extends DataSource {

    evaluate() {
        const link = document.querySelector("a.endtestlink.aalink");

        if (link) {
            const url = new URL(link.href);
            this.data.quizId = parseInt(url.searchParams.get("cmid"));
            this.data.attemptId = parseInt(url.searchParams.get("attempt"));
        }
        else {
            this.data.quizId = null;
            this.data.attemptId = null;
        }
    }
}

export default LinkSource;