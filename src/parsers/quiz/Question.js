import attachContextMenu from "Widgets/ContextMenu"

class Question {

    constructor({container}) {
        this.container = container;
    }

    /**
    * @typedef  SolutionItem Represents single menu option (or answer option)
    * @type     {Object}
    * @property {string} label String representation of answer option
    * @property {Object} data  Question-specific data required to perform autofill 
    */

    /**
    * @typedef  Suggestion Contains SyncShare assumptions about correctness of certain answer options 
    * @type     {Object}
    * @property {number}       correctness Whether specific answer is correct / partially correct / incorrect
    * @property {number}       confidence  Confidence from 0 to 1 about specific assumption
    * @property {SolutionItem} item        More detailed information about specific answer option
    */

    /**
    * @typedef  Submission Contains data about other users submissions
    * @type     {Object}
    * @property {number}       correctness Whether specific answer is correct / partially correct / incorrect
    * @property {number}       count       How many times other users have chosen specific answer
    * @property {SolutionItem} item        More detailed information about specific answer option
    */

    /**
    * @typedef  Solution Contains data to display one magic wand and difine its menu
    * @type     {Object}
    * @property {string}       anchor      Question-specific signature to anchor magic button to specific element
    * @property {Suggestion[]} suggestions An array of suggestions
    * @property {Submission[]} submissions An array of submissions
    */

    /**
    * @callback AutoFill
    * @param    {Object} data Question-specific data required to perform autofill 
    */

    /**
    * @typedef  WidgetAnchor Contains magic button and function to perform autofill 
    * @type     {Object}
    * @property {HTMLElement}  button  Magic button DOM node
    * @property {AutoFill}     onClick Question-specific data required to perform autofill    
    */

    /**
     * Handles retrieved solutions from server by rendering
     * magic button and appropriate menu options
     * 
     * @param {Solution[]} solutions An array of solutions
     */
    handleSolutions(solutions) {
        function getColor(correctness) {

            // Default correctness - unknown
            const color = {
                backColor: "BDBDBD", // Pastel gray  
                textColor: "F7F7F7"  // Almost white
            }

            switch(correctness) {
                // Incorrect - pastel red
                case 0: color.backColor = "FE7F6C"; break;

                // Partially correct - pastel yellow
                case 1: color.backColor = "E0CD6E"; break;

                // Correct - pastel green
                case 2: color.backColor = "60C080"; break; 
            }

            return color;
        }

        solutions?.forEach(solution => {
            const menuOptions = [];
            const suggestions = solution?.suggestions;
            const submissions = solution?.submissions;
            const anchor = this.createWidgetAnchor(solution.anchor);

            if (!anchor)
                return;

            if (suggestions?.length > 0) {
                const suggMenu = {
                    label: "Suggestions",
                    icon: { name: "fa-star" },
                    action: null,
                    subMenu: []
                }

                suggestions.forEach(suggestion => {
                    const item = suggestion.item;
                    
                    suggMenu.subMenu.push({
                        label: item.label,
                        icon: {
                            alignRight: true,
                            text: `${suggestion.confidence * 100}%`,
                            ...getColor(suggestion.correctness)
                        },
                        action: () => anchor.onClick(item.data)
                    });
                });

                menuOptions.push(suggMenu);
            }

            if (submissions?.length > 0) {
                const subsMenu = {
                    label: "Submissions",
                    icon: { name: "fa-user" },
                    action: null,
                    subMenu: []
                }

                submissions.forEach(submission => {
                    const item = submission.item;
                    const anchor = this.createWidgetAnchor(item);

                    subsMenu.subMenu.push({
                        label: item.label,
                        icon: {
                            alignRight: true,
                            text: submission.count.toString(),
                            ...getColor(submission.correctness)
                        },
                        action: () => anchor.onClick(item.data)
                    });
                });

                menuOptions.push(subsMenu);
            }

            attachContextMenu(anchor.button, menuOptions);
        });
    }

    /**
     * Creates magic button and defines function to autofill answer
     * 
     * @param   {string} anchor Question-specific signature to anchor magic button to specific element
     * @returns {WidgetAnchor}  Anchor containg created magic button and autofill function
     */
    createWidgetAnchor(anchor) {
        throw `${this.name}: createWidgetAnchor must be overridden!`;
    }

}

export default Question;