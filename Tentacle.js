import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;



class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: hex_color("#ad79b5")}),
        };
        //store and set colors
        this.colors = [20];
        this.set_colors();
    }

}

export class Tentacle extends Base_Scene {
    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        for(let i = 0; i < 20; i++){
            this.colors[i] = hex_color("#bf84b8");
        }
    }


    draw_box(context, program_state, model_transform, num_box) {
        //draw multiple swaying boxes to form a tentacle

        // time passed in seconds
        const t = program_state.animation_time / 1000;

        // angle for swaying motion
        //const maxAngle = .1 * Math.PI; 
        //var angle = ((maxAngle/2)+(maxAngle/2) * (Math.sin(2 * Math.PI / 3 * t)));
        const baseAngle = 0.03 * Math.PI; // Base angle when the tentacle is at rest
        const swayRange = 0.01 * Math.PI; // Maximum deviation from the base angle

        var angle = baseAngle + swayRange * Math.sin(2 * Math.PI/2 * t);


        // first box does not swing
        if(num_box == 0){
            model_transform = model_transform.times(Mat4.scale(0.07,0.07,0.07));
                                            
        }
        // the second to eighth box swing
        else{
            model_transform = model_transform.times(Mat4.translation(-1, 1, 0)) // hinge at top left edge of the previous box
                                            .times(Mat4.rotation(angle, 0, 0, 1)) // rotate around z-axis
                                            .times(Mat4.translation(-1, -1, 0)); // place next box atop previous box                                                                                                      
        }

        this.shapes.cube.draw(context, program_state, model_transform, this.materials.plastic.override({color: this.colors[num_box]}));
        return model_transform;
        
    }
    render(context, program_state, model_transform) {
        super.display(context, program_state);
    
        // Assume model_transform is the transformation matrix for the entire jellyfish
        // This includes any global transformations like the up and down movement
    
        // Define the initial translation that is common to all sets of tentacles
        // This translation positions the base of the tentacles relative to the jellyfish body
        let base_tentacle_translation = Mat4.translation(0, -0.3, 0);
    
        // Loop through the different sets of tentacles, applying a unique rotation to each set
        for (let rotation_step = 0; rotation_step < 10; rotation_step++) {
            // Calculate the rotation angle (36 degrees increment in each step to distribute tentacles evenly around)
            let rotation_angle = 36 * rotation_step * Math.PI / 180;
    
            // Apply the rotation for the current set of tentacles
            // Start from the jellyfish's current transformation (model_transform)
            // Then apply the base tentacle translation and rotation for this tentacle set
            let tentacle_transform = model_transform.times(base_tentacle_translation)
                                                    .times(Mat4.rotation(rotation_angle, 0, 1, 0));
    
            // Draw each box in the current tentacle
            for (let i = 0; i < 20; i++) {
                tentacle_transform = this.draw_box(context, program_state, tentacle_transform, i);
            }
        }
    }
}