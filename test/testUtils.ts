import {JSDOM} from "jsdom";
import {Stage} from "../src/Stage";
import {Environment, EnvironmentalProperties} from "../src/simulation/Environment";

export function getTestStage() {
    const dom = new JSDOM(`<!DOCTYPE html>`);
    const doc = dom.window.document;

    const container = doc.createElement("div");
    container.id = "main";
    doc.body.appendChild(container);

    const stage = new Stage(container);
    return {container, stage};
}

export function getTestEnvironment(partial: Partial<EnvironmentalProperties> = {}): Environment {
    const { stage } = getTestStage();
    return new Environment(stage, partial);
}
