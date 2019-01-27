# grraf

The vision for Grraf is based in fun and science and exploration.

It began as an exploration of the Canvas JavaScript API and continued as a way for me to explore physics and creative interactive things for fun.

My hope is that it will continue to evolve as an actual tool to explain and visualize things (mathematical, statistical, physical, and strange). Also- I should add some 3d support someday.

-Shane

## Install
> npm install --save grraf

## Use
```
import { Stage, Circle, Color } from "grraf";

const stage = new Stage(document.getElementById("container"));
stage.createShape(Circle)
    .setRadius(5)
    .setColor(new Color(255, 40, 30))
    .setPosition({ x: 100, y: 200 });
stage.draw();
        
```
