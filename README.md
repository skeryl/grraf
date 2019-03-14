# grraf

The vision for Grraf is based in fun and science and exploration.

It began as an exploration of the Canvas JavaScript API and continued as a way for me to explore physics and creative interactive things for fun.

My hope is that it will continue to evolve as an actual tool to explain and visualize things (mathematical, statistical, physical, and strange). Also- I should add some 3d support someday.

-Shane

## Install
> npm install --save grraf

## The Basics
```javascript
import { Stage, Circle, Color } from "grraf";

// either an actual Canvas element or any containing html element can be supplied.
// if a container is supplied, a Canvas will be added to the container
const stage = new Stage(document.getElementById("container"));

// any built-in shape (or your custom class that extends Shape) can be created on the stage.
// initial shape properties can be provided (which are typed to the shape!)
const circle = stage.createShape(Circle, { radius: 5 });

// properties can also be updated "fluently"
circle.setColor(new Color(255, 40, 30))
    .setPosition({ x: 100, y: 200 });

// don't forget to draw!
stage.draw();
        
```

## Animations
```javascript
// (^ continued from previous code snippet ^)

//  animate a shape by defining transitions for a property (setting values for specific key-frames and an optional timing function)
const animation = stage.animate(circle)
    // these values are also typed based on the property!!!
    .transition("fill",
        { 
             200: Color.white, 
            2500: Color.black, 
            4000: new Color(247, 24, 120) 
        }
    )
    .transition("radius",
        {
               0: maxSize / 16,
            1500: maxSize / 8,
            2500: maxSize / 4,
            4000: maxSize / 16
        },
        TimingFunction.EaseInOutCubic // timing functions may be used
    )
    .create({ repeat: true }); // <- animation options can also be supplied (i.e. repeat);

animation.start();

// want to do something when you're done?
animation.then(() => { console.log("I'm done animating!"); });

// need to stop?
animation.cancel();

```
* currently supports numeric properties, position ({x, y}), and Colors

