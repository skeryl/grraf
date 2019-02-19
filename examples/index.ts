import {BasicShapes} from "./01-basic-shapes/BasicShapes";
import {SomethingPretty} from "./0X-make-something-pretty/SomethingPretty";
import {BasicAnimation} from "./02-basic-animation/BasicAnimation";
import {ExampleSimulation} from "./03-simulation/ExampleSimulation";
import {CollisionSimulation} from "./04-another-simulation/CollisionSimulation";
import {ColoringPaths} from "./05-coloring-paths/ColoringPaths";

export interface Example {

    name: string;
    description: string;

    /**
     * do your thing!
     */
    start(window: Window, container: HTMLElement): void;

    /**
     * clean up any animation or pending actions, please
     */
    stop(): void;
}

class Main {

    private currentExampleIndex = 0;
    private readonly container = document.getElementById("main") as HTMLDivElement;

    constructor(private readonly examples: Example[]){
    }

    get currentExample(): Example {
        return this.examples[this.currentExampleIndex]
    }

    private onExampleChanged = (newIndex: number) => {
        if(newIndex === this.currentExampleIndex){
            return;
        }

        if(newIndex < 0 || newIndex >= this.examples.length){
            throw new Error("Are you trying to find some hidden examples? Build your own and contribute them please!");
        }

        if(this.currentExample){
            this.currentExample.stop();
        }

        this.currentExampleIndex = newIndex;
        this.showCurrentExample();
    };

    private configureSelect = (select: HTMLSelectElement) => {

        this.examples.forEach((example, exampleIndex) => {
            const optionElement = document.createElement("option");
            optionElement.setAttribute("value", exampleIndex.toString());
            if(exampleIndex === 0){
                optionElement.setAttribute("selected", "selected");
            }
            optionElement.innerText = example.name;
            select.add(optionElement);
        });

        select.addEventListener("change", (event) => {
            if(event.target){
                this.onExampleChanged(parseInt((event.target as HTMLSelectElement).value));
            }
        });
    };

    showCurrentExample = () => {
        this.currentExample.start(window, this.container);
    };

    start = () => {
        this.configureSelect(document.getElementById("examples-select") as HTMLSelectElement);
        this.showCurrentExample();
    };
}

const examples = [
    new SomethingPretty(),
    new CollisionSimulation(),
    new ExampleSimulation(),
    new BasicAnimation(),
    new BasicShapes(),
    new ColoringPaths(),
];

document.addEventListener("DOMContentLoaded", () => {
    const main = new Main(examples);
    main.start();
});


