import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js'
import { Tentacle } from './Tentacle.js';
import { Background } from './background.js';


const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;


export class Main extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            beach: new defs.Cube(40,40),
            ocean: new defs.Cube(),
            sponge_body: new defs.Cube(),
            sponge_eyes: new defs.Subdivision_Sphere(4),
            eye_ball: new defs.Subdivision_Sphere(4),
            mouth: new defs.Cube(),
            teeth: new defs.Cube(),
            arm: new defs.Cube(),
            shirt: new defs.Cube(),
            pants: new defs.Cube(),
            shoe: new defs.Cube(),
            hand: new defs.Subdivision_Sphere(4),
            net: new Shape_From_File("./assets/Jellyfish_net.obj"),
            jellyfish_head: new Shape_From_File("./assets/head.obj"),
        };
        this.jellyfish_tentacle =  new Tentacle();
        this.background = new Background();

        const bump = new defs.Fake_Bump_Map(1);

        // *** Materials
        this.materials = {
            beach: new Material(new defs.Textured_Phong(), {
                color: color(0, 0, 0, 1), 
                ambient: 1,                
                diffusivity: 0.3,            
                specularity: 0.3,    
                texture: new Texture("assets/sand.png"),
            }),
            ocean: new Material(bump, {
                ambient: 1, diffusivity: .5, 
                color: color(0, 0, 0, 1),
                texture: new Texture("assets/ocean.png"), 
            }),
            sponge_body: new Material(bump, {
                ambient: 1, diffusivity: .5, 
                color: color(0, 0, 0, 1),
                texture: new Texture("assets/bob_body.jpg"), 
            }),
            sponge_eyes: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5, 
                color: color(1, 1, 1, 1),
            }), 
            eye_ball: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5, 
                color: hex_color('#7eb5e8'),
            }),
            mouth: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5,
                color: color(0, 0, 0, 1),
            }),
            teeth: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5,
                color: color(1, 1, 1, 1),
            }),
            arm: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5, 
                color: hex_color('#f0e33f'),
            }),
            shirt: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5, 
                color: color(1, 1, 1, 1),
            }),
            pants: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5,
                color: hex_color('#b47a3d'),
            }),
            shoe: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5, 
                color: color(0, 0, 0, 1),
            }),
            hand: new Material(new defs.Phong_Shader(), {
                ambient: 1, diffusivity: .5,
                color: hex_color('#f0e33f'),
            }),
            net: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1, diffusivity: .5,
                texture: new Texture("assets/T_JellyfishHunter_D1.png"),
            }),
            jellyfish_head: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 1,  texture: new Texture("assets/jellyfish_surface.png")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.speed_up = 0;
        this.set_speedUp = false;
        this.speed_start_time = 0;
        this.setup = false;
        this.speed_distance = 0;
    }

    make_control_panel() {
        this.key_triggered_button("Speed Up", ["u"], () => {
            this.set_speedUp = true;
        });
        
    }
    draw_jellyfish(context, program_state, model_transform, t) {
        // Jellyfish vertical movement
        var vertical_movement = 1.3 * Math.sin(2 * Math.PI / 2 * t);
        model_transform = model_transform.times(Mat4.translation(0, vertical_movement, 0));

        // Jellyfish bell transformation
        var head_height = 1 + 0.5 * Math.sin(2 * Math.PI / 2 * t);
        var head_radius = 0.95 - 0.25 * Math.sin(2 * Math.PI / 2 * t);
        let jellyfish_head_transform = model_transform.times(Mat4.scale(1.2, 0.9, 1.2))
                                                      .times(Mat4.scale(head_radius, head_height, head_radius));

        // Draw jellyfish head
        this.shapes.jellyfish_head.draw(context, program_state, jellyfish_head_transform, this.materials.jellyfish_head);

        // Draw jellyfish tentacles
        this.jellyfish_tentacle.render(context, program_state, model_transform);
    }

    draw_spongebob(context, program_state, model_transform, global_transform, t){
        const target_distance = 7;
        const speeding_duration = 2.5;
        const maintain_duration = 2;
        const slowing_duration = 2.5;
        
        if(this.set_speedUp && t >= 4){
            let time = t - this.speed_start_time;
            if(time < speeding_duration){
                let fraction = time / speeding_duration;
                this.speed_distance = fraction * target_distance;
            } else if(time < speeding_duration + maintain_duration){
                this.speed_distance = target_distance;
            } else if(time < speeding_duration + maintain_duration + slowing_duration){
                let fraction = (time - speeding_duration - maintain_duration) / slowing_duration;
                this.speed_distance = target_distance * (1 - fraction);
            } else {
                //reset
                this.set_speedUp = false;
                this.speed_distance = 0;
                this.speed_start_time = 0;
            }
        }
        // let speeding = false;
        // let slowing = false;
        // if(this.set_speedUp){
        //     speeding = true;
        // }
        // let distance_fraction = Math.min()
        // let speed = time;
        // if(speeding && t >= 4){
        //     if(this.speed_distance >= 0 && this.speed_distance < target_distance){
        //         this.speed_distance += speed;
        //         console.log("speeding, speeding_distance = " + this.speed_distance);
        //     } else if(this.speed_distance >= target_distance){
        //         console.log("started to slow");
        //         speeding = false;
        //         slowing = true;
        //     }
        // } else if(slowing){
        //     if(this.speed_distance > speed){
        //         this.speed_distance-=speed;
        //         console.log("slowing... speed_distance = " + speed_distance);
        //     } else {
        //         slowing = false;
        //     }
        // }
        
        const initial_angle = 0;
        const final_angle = Math.PI / Math.sqrt(10);
        const rotation_period = 2;
        let rotation_fraction = Math.min(t, rotation_period) / rotation_period;
        let interpolated_angle = initial_angle + (final_angle - initial_angle) * rotation_fraction;

        //implement the legs' action
        const swingAmplitude = Math.PI / 6; // Adjust this for larger or smaller swings
        const shoeAM = Math.PI / 30;
        const armAM = Math.PI / 20;
        const swingFrequency = 8; // Adjust this for faster or slower swings

        const startTime = 4;
        const animation_time =  Math.max(t - startTime, 0);
        let swingAngle = Math.sin(animation_time * swingFrequency) * swingAmplitude;
        let shoe_angle = Math.sin(animation_time * swingFrequency) * shoeAM;
        let arm_angle = Math.sin(animation_time * swingFrequency) * armAM;
        

        if(t < 4){
            global_transform = model_transform.times(Mat4.translation(-7, -1, -3));
        } else {
            global_transform = model_transform.times(Mat4.translation(-7 + this.speed_distance, -1, -3))
                .times(Mat4.rotation(interpolated_angle, 0, 1, 0));
        }

        
        let sponge_body_transform = model_transform;
        sponge_body_transform = sponge_body_transform.times(global_transform)
            .times(Mat4.scale(2, 2.1, .8));

        let sponge_eyes_transform = model_transform;
        sponge_eyes_transform = sponge_eyes_transform
            .times(global_transform)
            .times(Mat4.scale(.6, .6, .6))
            .times(Mat4.translation(-.9, .6, 1.2));
        let sponge_eyes2_transform = sponge_eyes_transform
            .times(Mat4.translation(1.8, 0, 0));

        let vertical_shift = 0;
        let horizontal_shift = 0;
        if (t >= 2.5 && t < 4) {
            vertical_shift = 0.1;
            horizontal_shift = 0.3;
        } else if (t >= 4) {
            vertical_shift = 0;
        }
            
        let eyeball1_transform = sponge_eyes_transform.times(Mat4.translation(0 + horizontal_shift, vertical_shift, .5))
            .times(Mat4.scale(.6, .6, .6));
        let eyeball2_transform = sponge_eyes_transform.times(Mat4.translation(1.8 + horizontal_shift, vertical_shift, .5))
            .times(Mat4.scale(.6, .6, .6));

        let mouth_transform = model_transform;
        mouth_transform = mouth_transform
            .times(global_transform).times(Mat4.translation(0, -.5, .9))
            .times(Mat4.scale(.7, .03, 0));

        let teeth_transform = model_transform;
        teeth_transform = teeth_transform.times(global_transform).times(Mat4.translation(-.25, -.8, .8))
            .times(Mat4.scale(.2, .3, .1));
        let teeth2_transform = model_transform;
        teeth2_transform = teeth2_transform.times(global_transform).times(Mat4.translation(.25, -.8, .8))
            .times(Mat4.scale(.2, .3, .1));

        let arm_transform = model_transform;
        arm_transform = arm_transform.times(global_transform).times(Mat4.translation(-3, -.6, 0))
            .times(Mat4.translation(2, 0, 0))
            .times(Mat4.rotation(arm_angle, 0, 0, 1))
            .times(Mat4.translation(-2, 0, 0))
            .times(Mat4.scale(1, .1, .1));
        let arm2_transform = model_transform.times(global_transform).times(Mat4.translation(3, -.6, 0))
            .times(Mat4.scale(1, .1, .1));

        let shirt_transform = model_transform;
        shirt_transform = shirt_transform.times(global_transform).times(Mat4.translation(0, -2.3, 0))
            .times(Mat4.scale(2, .25, .8));

        let pants_transform = model_transform;
        pants_transform = pants_transform.times(global_transform).times(Mat4.translation(0, -2.75, 0))
            .times(Mat4.scale(2, .25, .8));

        let leg_transform = model_transform.times(global_transform).times(Mat4.translation(-.5, -3.5, 0))
            .times(Mat4.rotation((Math.PI/2), 0, 0, 1))
            .times(Mat4.rotation(swingAngle, 0, 1, 0))
            .times(Mat4.scale(1, .1, .1));
        let leg2_transform = model_transform.times(global_transform).times(Mat4.translation(.5, -3.5, 0))
            .times(Mat4.rotation((Math.PI/2), 0, 0, 1))
            .times(Mat4.rotation(-swingAngle, 0, 1, 0))
            .times(Mat4.scale(1, .1, .1));

        let shoe_transform = model_transform.times(global_transform).times(Mat4.translation(-.5, -4.3, .1))
            .times(Mat4.translation(0, 3, 0))
            .times(Mat4.rotation(-shoe_angle, 1, 0, 0))
            .times(Mat4.translation(0, -3, 0))
            .times(Mat4.scale(.3, .2, .5));
        let shoe2_transform = model_transform.times(global_transform).times(Mat4.translation(.5, -4.3, .1))
            .times(Mat4.translation(0, 3, 0))
            .times(Mat4.rotation(shoe_angle, 1, 0, 0))
            .times(Mat4.translation(0, -3, 0))
            .times(Mat4.scale(.3, .2, .5));

        let hand_transform = model_transform.times(global_transform).times(Mat4.translation(-4, -.6, 0))
            .times(Mat4.translation(2.8, 0, 0))
            .times(Mat4.rotation(arm_angle, 0, 0, 1))
            .times(Mat4.translation(-2.8, 0, 0))
            .times(Mat4.scale(.3, .3, .3));
        let hand2_transform = model_transform.times(global_transform).times(Mat4.translation(4, -.6, 0))
            .times(Mat4.scale(.3, .3, .3));

        let net_transform = model_transform.times(global_transform)
            .times(Mat4.scale(1, 1, 1))
            .times(Mat4.translation(4, 4.5, -1));
        //drawing:
        this.shapes.sponge_body.draw(context, program_state, sponge_body_transform, this.materials.sponge_body);
        this.shapes.sponge_eyes.draw(context, program_state, sponge_eyes_transform, this.materials.sponge_eyes);
        this.shapes.sponge_eyes.draw(context, program_state, sponge_eyes2_transform, this.materials.sponge_eyes);
        this.shapes.eye_ball.draw(context, program_state, eyeball1_transform, this.materials.eye_ball);
        this.shapes.eye_ball.draw(context, program_state, eyeball2_transform, this.materials.eye_ball);
        this.shapes.mouth.draw(context, program_state, mouth_transform, this.materials.mouth);
        this.shapes.teeth.draw(context, program_state, teeth_transform, this.materials.teeth);
        this.shapes.teeth.draw(context, program_state, teeth2_transform, this.materials.teeth);
        this.shapes.arm.draw(context, program_state, arm_transform, this.materials.arm);
        this.shapes.arm.draw(context, program_state, arm2_transform, this.materials.arm);
        this.shapes.shirt.draw(context, program_state, shirt_transform, this.materials.shirt);
        this.shapes.pants.draw(context, program_state, pants_transform, this.materials.pants);
        this.shapes.arm.draw(context, program_state, leg_transform, this.materials.arm);
        this.shapes.arm.draw(context, program_state, leg2_transform, this.materials.arm);
        this.shapes.shoe.draw(context, program_state, shoe_transform, this.materials.shoe);
        this.shapes.shoe.draw(context, program_state, shoe2_transform, this.materials.shoe);
        this.shapes.hand.draw(context, program_state, hand_transform, this.materials.hand);
        this.shapes.hand.draw(context, program_state, hand2_transform, this.materials.hand);
        this.shapes.net.draw(context, program_state, net_transform, this.materials.net);
    }

    draw_jellyfish(context, program_state, model_transform, t) {
        // Jellyfish vertical movement
        var vertical_movement = 1.3 * Math.sin(2 * Math.PI / 2 * t);
        model_transform = model_transform.times(Mat4.translation(0, vertical_movement, 0));

        // Jellyfish bell transformation
        var head_height = 1 + 0.5 * Math.sin(2 * Math.PI / 2 * t);
        var head_radius = 0.95 - 0.25 * Math.sin(2 * Math.PI / 2 * t);
        let jellyfish_head_transform = model_transform.times(Mat4.scale(1.2, 0.9, 1.2))
                                                      .times(Mat4.scale(head_radius, head_height, head_radius));

        // Draw jellyfish head
        this.shapes.jellyfish_head.draw(context, program_state, jellyfish_head_transform, this.materials.jellyfish_head);

        // Draw jellyfish tentacles
        this.jellyfish_tentacle.render(context, program_state, model_transform);
    }


    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location.times(Mat4.translation(0, 0.3, 0)));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        const yellow = hex_color("#fac91a");
        let model_transform = Mat4.identity();

        var light_color = color(70, 70, 70, 1);
        const light_position = vec4(0, 0, -30, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, light_color, 1)];

        //draw the beach
        let beach_transform = model_transform;

        beach_transform = beach_transform.times(Mat4.translation(0, -7, 0))
                                            .times(Mat4.scale(40, 1, 20));
        this.shapes.beach.draw(context, program_state, beach_transform, this.materials.beach);

        //draw the ocean
        let ocean_transform = model_transform;
        ocean_transform = ocean_transform.times(Mat4.scale(40, 40, 25));
        this.shapes.ocean.draw(context, program_state, ocean_transform, this.materials.ocean);

        //draw background objects
        this.background.render(context, program_state, model_transform);
        
        //draw bob
        let global = model_transform;
        if(this.set_speedUp && this.speed_start_time == 0){
            this.speed_start_time = t;
        }

        this.draw_spongebob(context, program_state, model_transform, global, t);

        // Draw the jellyfish
        //transform the jellyfish from (-6, 0, 0) to (6, 3, 0) in 3 seconds

        //let jellyfish_transform = model_transform.times(Mat4.translation(6, 3, 0));
        let cappedTime = Math.min(t, 5.8);
        let normalizedTime = cappedTime%6/6 ;

        // Interpolate positions
        // Start position: (-6, 0, 0)
        // End position: (6, 3, 0)
        // Linear interpolation: start + (end - start) * normalizedTime
        let x = -13 + (8 - (-13)) * normalizedTime; // -6 to 6
        let y = -3 + (3 + 3) * normalizedTime;     // 0 to 3
        let z = 2.5;                                // Z remains constant

        // Apply the calculated translation
        let jellyfish_transform = model_transform.times(Mat4.translation(x, y, z))
                                                 .times(Mat4.rotation(-Math.PI/4,0,0,1));    
        this.draw_jellyfish(context, program_state, jellyfish_transform, t);
        

        
        // call this .attached() to assign to the camera matrix. 
        //Set the camera position as desired 
        //update program_state.camera_inverse to desired
        if(this.attached != undefined){
            let desired = this.attached();
            if (desired == null)
                program_state.set_camera(this.initial_camera_location);
            else{
                desired = desired.map((x, i) => Vector.from( program_state.camera_inverse[i]).mix(x, .1));
                program_state.camera_inverse = desired;
            }          
        }
    }
}