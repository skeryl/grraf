import {JSDOM} from "jsdom";
import {Stage} from "../src/Stage";
import {Environment, EnvironmentalProperties} from "../src/simulation/Environment";

export function getTestStage() {
    const dom = new JSDOM(`<!DOCTYPE html>`);
    const doc = dom.window.document;

    const container = doc.createElement("div");
    container.style.height = '500px';
    container.style.width = '500px';
    container.id = "main";
    doc.body.appendChild(container);

    const stage = new Stage(container, true);
    return {container, stage};
}

export function getTestEnvironment(partial: Partial<EnvironmentalProperties> = {}): Environment {
    const { stage } = getTestStage();
    return new Environment(stage, partial);
}
