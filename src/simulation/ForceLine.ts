import {Shape} from "../shapes/Shape";
import {IParticle, Particle} from "./Particle";
import {Distance, Stage} from "../Stage";
import {Color} from "../Color";
import {Path} from "../shapes/Path";
import {NearbyParticle} from "./Environment";

const gray = new Color(0, 0, 0, 0.1);

export class ForceLine extends Shape {

    private readonly line: Path;

    private particleA: IParticle | undefined;
    private particleB: IParticle | undefined;
    private distance: Distance | undefined;

    constructor(stage: Stage, id: number, context: CanvasRenderingContext2D, x: number, y: number, color: Color) {
        super(stage, id, context, x, y, color);
        this.line = stage.createShape(Path).setColor(gray).setStrokeWidth(1).setStrokeColor(gray) as Path;
    }

    setParticles(
        particleA: Particle,
        particleB: NearbyParticle,
    ): ForceLine {
        this.particleA = particleA;
        this.particleB = particleB.particle;
        this.distance = particleB.distance;
        return this;
    }

    drawShape() {
        if(this.particleA && this.particleB){
            this.line.resetPath();
            /*const distance = distanceBetween(this.particleA, this.particleB);
            const force = gravitationalForceBetween(this.particleA, this.particleB);*/

            /*this.label.setText(`force: ${force} N`);
            this.label.setPosition({
                x: this.particleB.x + (distance.x/2),
                y: this.particleB.y + (distance.y/2)
            });*/

            this.line.moveTo(this.particleA.position.x, this.particleA.position.y);
            this.line.lineTo(this.particleB.position.x, this.particleB.position.y);
            this.line.drawShape();
        }
    }
}