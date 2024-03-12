import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js'

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
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
        this.shapes = {
            starfish: new Shape_From_File("./assets/starfish.obj"),
            plant1: new Shape_From_File("./assets/plant1.obj"),
            plant2: new Shape_From_File("./assets/plant2.obj"),
            plant3: new Shape_From_File("./assets/plant3.obj"),
            plant4: new Shape_From_File("./assets/plant4.obj"),
        };

        // *** Materials
        this.materials = {
            starfish: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: hex_color("#f0512e")}),
            plant: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: hex_color("#38b53c")}),   
        };

        //   starfish_transform = starfish_transform.times(Mat4.translation(0, -6, 0))
        //back: -16
    }

}

export class Background extends Base_Scene {
    position(program_state, initial_x, range) {
        let t = program_state.animation_time / 1000; // Convert time to seconds
        let x_position = initial_x;
        // Define the end points based on the provided range
        let start_point = initial_x;
        let end_point = -range;
        
        // Check if the current time is within the first 5 seconds
        if (t <= 4.5) {
            // Stay at the initial position
            x_position = initial_x;
        } else {
            // Adjust time to account for the initial 5 seconds of delay
            let adjusted_time = (t - 4.5)*4;
            
            // Calculate the distance moved considering the speed is such that it moves 1 unit per second
            // The object stays still for the first 5 seconds, then starts moving
            if (start_point - adjusted_time > end_point) {
                x_position = start_point - adjusted_time;
            } else {
                // Reset to the opposite edge of the range and move towards the starting edge
                let cycle_length = 2 * range;
                let extra_time = (adjusted_time - (start_point + range)) % cycle_length;
                x_position = range - extra_time;
                
                // Ensure x_position does not go beyond the end point
                x_position = Math.max(x_position, end_point);
            }
        }
        
        return x_position;
    }

    render(context, program_state, model_transform) {
        super.display(context, program_state);

        // Draw starfish
        let pos1 = this.position(program_state, 0, 16);
        let starfish_transform = model_transform.times(Mat4.translation(pos1, -6, 2))
                                                .times(Mat4.scale(0.7, 0.7, 0.7))
                                                .times(Mat4.rotation(0.5 * Math.PI, 0, 1, 0));
        this.shapes.starfish.draw(context, program_state, starfish_transform, this.materials.starfish);

        let pos2 = this.position(program_state, 10, 16);
        let starfish_transform2 = model_transform.times(Mat4.translation(pos2, -6, 4))
                                                .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.starfish.draw(context, program_state, starfish_transform2, this.materials.starfish.override({color: hex_color("#cc4192")}));

        let pos3 = this.position(program_state, 19, 22);
        let starfish_transform3 = model_transform.times(Mat4.translation(pos3, -6, -8))
                                                .times(Mat4.scale(0.5, 0.5, 0.5));
        this.shapes.starfish.draw(context, program_state, starfish_transform3, this.materials.starfish.override({color: hex_color("#96b8ff")}));


        // Draw the plants
        let pos4 = this.position(program_state, 3, 30);
        let plant1_transform = model_transform.times(Mat4.translation(pos4, -6, -5))//low grass
        this.shapes.plant1.draw(context, program_state, plant1_transform, this.materials.plant);

        let pos5 = this.position(program_state, -12, 30);
        let plant2_transform = model_transform.times(Mat4.translation(pos5, -5.2, -16))//tall grass
        this.shapes.plant2.draw(context, program_state, plant2_transform, this.materials.plant.override({color: hex_color("#108715")}));

        let pos15 = this.position(program_state, 28, 30);
        let plant12_transform = model_transform.times(Mat4.translation(pos15, -5.2, -17))//tall grass
        this.shapes.plant2.draw(context, program_state, plant12_transform, this.materials.plant);

        let pos6 = this.position(program_state, 10, 30);
        let plant3_transform = model_transform.times(Mat4.translation(pos6, -5, -17))//tall grass
        this.shapes.plant3.draw(context, program_state, plant3_transform, this.materials.plant);

        let pos13 = this.position(program_state, 12, 30);
        let plant10_transform = model_transform.times(Mat4.translation(pos13, -5, -17))//tall grass
        this.shapes.plant3.draw(context, program_state, plant10_transform, this.materials.plant.override({color: hex_color("#108715")}));

        let pos14 = this.position(program_state, 22, 30);
        let plant11_transform = model_transform.times(Mat4.translation(pos14, -5, -17))//tall grass
        this.shapes.plant3.draw(context, program_state, plant11_transform, this.materials.plant);

        let pos7 = this.position(program_state, -10, 30);
        let plant4_transform = model_transform.times(Mat4.translation(pos7, -4, -17))//coral
        this.shapes.plant4.draw(context, program_state, plant4_transform, this.materials.plant.override({color: hex_color("#e35e59")}));

        let pos8 = this.position(program_state, 8, 30);
        let plant5_transform = model_transform.times(Mat4.translation(pos8, -6, -17))
        this.shapes.plant1.draw(context, program_state, plant5_transform, this.materials.plant);

        let pos9 = this.position(program_state, -13, 30);
        let plant6_transform = model_transform.times(Mat4.translation(pos9, -5.2, -17))
        this.shapes.plant2.draw(context, program_state, plant6_transform, this.materials.plant);

        let pos10 = this.position(program_state, 11, 30);
        let plant7_transform = model_transform.times(Mat4.translation(pos10, -5, -15))
        this.shapes.plant3.draw(context, program_state, plant7_transform, this.materials.plant);

        let pos12 = this.position(program_state, 24, 30);
        let plant9_transform = model_transform.times(Mat4.translation(pos12, -4, -17))
        this.shapes.plant4.draw(context, program_state, plant9_transform, this.materials.plant.override({color: hex_color("#e88533")}));
    
    }
}