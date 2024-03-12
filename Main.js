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
            beach: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#e8c774")}),
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

        //this.contruct_spongebob_hierarchy();
    }

    make_control_panel() {
        
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
        //implement the legs' action
        const swingAmplitude = Math.PI / 6; // Adjust this for larger or smaller swings
        const shoeAM = Math.PI / 30;
        const armAM = Math.PI / 20;
        const swingFrequency = 5; // Adjust this for faster or slower swings
        let swingAngle = Math.sin(t * swingFrequency) * swingAmplitude;
        let shoe_angle = Math.sin(t * swingFrequency) * shoeAM;
        let arm_angle = Math.sin(t * swingFrequency) * armAM;

        
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

        let eyeball1_transform = sponge_eyes_transform.times(Mat4.translation(0, 0, .5))
            .times(Mat4.scale(.6, .6, .6));
        let eyeball2_transform = sponge_eyes_transform.times(Mat4.translation(1.8, 0, .5))
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
        let global = model_transform.times(Mat4.rotation(Math.PI / Math.sqrt(30), 0, 1, 0))
            .times(Mat4.translation(-3, -1, -3));
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


class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;

        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                // Directly use original vertex position.
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vertex_color = vec4( shape_color.xyz * ambient, shape_color.w );
                vertex_color.xyz += phong_model_lights(  N, vertex_worldspace );
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                gl_FragColor = vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            center = model_transform * vec4(0, 0, 0, 1);
            point_position = model_transform * vec4(position, 1.0);
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            float scalar = sin(19.0 * distance(point_position.xyz, center.xyz));
            //#B08040: 0.6902, 0.5020, 0.2510
            float red = 0.6902;
            float green = 0.5020;
            float blue = 0.2510;
            gl_FragColor = scalar * vec4(red, green, blue, 1.0);           
        }`;
    }
}