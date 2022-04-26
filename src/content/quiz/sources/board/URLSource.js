import DataSource from "shared/utils/DataSource";

class URLSource extends DataSource {

    evaluate() {
        const url = new URL(window.location.href);
        this.data.host = url.host;
        this.data.quizId = parseInt(url.searchParams.get("id"));
    }
}

export default URLSource;