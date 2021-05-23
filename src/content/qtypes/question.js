import { attachContextMenu } from "@/content/context-menu.js";
import { stateToWord } from "@/core/tools.js";
import { error } from "@/core/log.js";

class Question {

    constructor(meta, base) {
        this.meta = meta;
        this.base = base;
    }

    getData() {
        const data = {
            meta: this.meta
        };

        const collectors = {
            formulation: () => this.getText(),
            answers: () => this.getAnswers(),
            feedback: () => this.getFeedback(),
        }

        Object.getOwnPropertyNames(collectors).forEach(prop => {
            const tmp = {}

            try {
                tmp[prop] = collectors[prop]();
            }
            catch (e) {
                tmp[prop] = {
                    error: {
                        name: e.name,
                        message: e.message,
                        file: e.fileName,
                        stack: e.stack
                    }
                };

                error(e, `Cannot process data collector (${prop})`);
            }

            Object.assign(data, tmp);
        });

        return data;
    }

    setSolutions(sols) {
        for (let sol of sols) {
            this.setSolution(sol);
        }
    }

    setSolution(solution) {
        const widget = []
        const suggs = solution.suggested;
        const stats = solution.statistics;
        
        const token = this.getWidgetToken(solution.attachTo);

        if (!token)
            return;

        if (suggs && suggs.length > 0) {
            const list = {
                label: "Suggested",
                callback: null,
                subMenu: []
            }

            for (let sugg of suggs) {
                list.subMenu.push({
                    label: sugg.label,
                    callback: () => token.onClick(sugg.value)
                })
            }

            widget.push(list)
        }

        if (stats && stats.length > 0) {
            const list = {
                label: "Statistics",
                callback: null,
                subMenu: []
            }

            for (let stat of stats) {
                const state = stateToWord(stat.value.state);

                list.subMenu.push({
                    label: `(${stat.count}${state}) ${stat.label}`,
                    callback: () => token.onClick(stat.value)
                })
            }

            widget.push(list);
        }

        attachContextMenu(token.button, widget);
    }

    getText() { throw "Collector is not overridden!" }

    getAnswers() { throw "Collector is not overridden!" }

    getFeedback() { throw "Collector is not overridden!" }

    getWidgetToken(attachTo) { throw "Widget token is not overridden!" }
}

export default Question;