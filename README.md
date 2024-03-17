# CS 174A Final Project - Story of Bikini Bottom
## Team Members
* Yiran Wu (705733282)
* Yuqi Huang (105722154)

## Setup
To view the animation - clone the repository, run the included "host.bat" or "host.command" file, then open localhost in your browser (http://localhost:8000/).

## Design and Implementation
We created an animation of SpongeBob chasing after a jellyfish. The animation starts with Spongebob standing still, facing the viewer. At the same time, a jellyfish glides from the lower-left corner to the upper-right. Spongebob takes a glance at the jellyfish and chases after. 
To simulate a continuous chase, we manipulate the background rather than the character. Initially, the background elements remain static. As SpongeBob begins to run, we animate these elements to shift uniformly to the left, creating an illusion of the character's forward movement. Once an element exits the left side of the viewport, it translates to the right side of the viewport, entering the loop of moving from right to left. This technique gives the impression that the character is constantly moving forward in an endless chase.
We integrated a unique interactivity feature through a "Speed Up" button, designed to enhance user engagement and simulate dynamic movement within our animated sequence. Upon activation—triggered by pressing the 'u' key—this feature temporarily boosts SpongeBob's running speed, creating an immersive and interactive experience for the viewer. This interactive component not only injects a sense of realism and excitement into the animation but also provides viewers with a playful control element, bridging the gap between static viewing and interactive engagement.

## Advanced Features
### Physics-based Jellyfish Movement
To create a realistic movement for the jellyfish, we applied physics principles to simulate the changes in its bell's shape and location over time. Jellyfish move by contracting and expanding their bell-shaped bodies. When they contract their bell, they push water out, propelling themselves forward. We focused on replicating this natural motion by using sine functions that mimic the way a jellyfish's bell contracts and expands in a rhythmic pattern as it moves through water.
We programmed the jellyfish's bell to periodically shrink and expand. This effect was achieved by varying two parameters: head_height (the bell's height) and head_radius (the bell's width) over time based on sine functions.
Over a period of 2 seconds, the jellyfish's bell undergoes a cycle where:
The head_height changes between 0.5 and 1.5. When the jellyfish contracts its bell, the height decreases to 0.5, and when it expands, the height increases to 1.5.
Simultaneously, the head_radius (representing the width across the x and z axes) changes inversely between 1.2 and 0.7. This means when the bell's height is at its smallest (0.5), the width is at its largest (1.2). Conversely, when the bell's height reaches its maximum (1.5), the width reduces to its smallest (0.7).

 


