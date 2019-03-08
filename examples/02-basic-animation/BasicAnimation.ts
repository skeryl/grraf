import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/color/Color";
import {Animation, TimingFunction} from "../../src/Animation";

const sexyPink = new Color(247, 24, 120);
const royalBlue = new Color(20, 20, 255);
const orangeJuice = new Color(240, 70, 20);

export class BasicAnimation implements Example {

    private stage: Stage | undefined;
    private animation: Animation | undefined;

    start(window: Window, container: HTMLElement): void {

        const maxSize = Math.min(window.innerWidth, window.innerHeight);

        this.stage = new Stage(container, true);

        const circle = this.stage.createShape(Circle).setRadius(30).setColor(royalBlue)
            .setPosition({
                x: (window.innerWidth / 4),
                y: (window.innerHeight / 4)
            }) as Circle;

        this.animation = this.stage.animate(circle)
            .transition("fill",
                { 200: sexyPink, 2500: royalBlue, 4000: orangeJuice },
                TimingFunction.EaseOutCubic
            )
            .transition("radius",
                {
                       0: maxSize / 16,
                    1500: maxSize / 8,
                    2500: maxSize / 4,
                    4000: maxSize / 16
                },
                TimingFunction.EaseInOutCubic
            )
            .create({ repeat: true });

        this.animation.start();
    }

    stop(): void {
        if(this.animation){
            this.animation.cancel();
        }
    }

    name = "Basic Animation";
    description = "Make all your friends jealous with delicious animation.";

}