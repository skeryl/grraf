import {Example} from "../index";
import {Stage} from "../../src/Stage";
import {Circle} from "../../src/shapes/Circle";
import {Color} from "../../src/color/Color";
import {Simulation} from "../../src/simulation/Simulation";
import {Environment} from "../../src/simulation/Environment";
import {Direction} from "../../src/simulation/DirectionalMagnitude";
import {Rectangle} from "../../src/shapes/Rectangle";
import {Path} from "../../src/shapes/Path";

export class ColoringPaths implements Example {

    start(window: Window, container: HTMLElement): void {

        const stage = new Stage(container, true);

        stage.createShape(Rectangle)
            .setHeight(window.innerHeight)
            .setWidth(window.innerWidth)
            .setColor(new Color(255, 191, 168));

        stage.createShape(Path)
            .moveTo(0, 0)
            .lineTo(100, 100)
            .lineTo(0, 100)
            .closePath()
            .setColor(new Color(255, 0, 0));

        stage.createShape(Path)
            .moveTo(100, 100)
            .lineTo(200, 200)
            .lineTo(100, 200)
            .setColor(new Color(255, 0, 0));

        stage.draw();
    }

    stop(): void {
    }

    name = "Paths";
    description = "This doesn't really work yet but it will some day.";

}