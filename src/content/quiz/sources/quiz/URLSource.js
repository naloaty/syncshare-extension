import DataSource from "shared/utils/DataSource";

class URLSource extends DataSource {

    evaluate() {
        const url = new URL(window.location.href);
        this.data.host = url.host;
        this.data.quizId = parseInt(url.searchParams.get("cmid"));
        this.data.attemptId = parseInt(url.searchParams.get("attempt"));
    }
}

export default URLSource;