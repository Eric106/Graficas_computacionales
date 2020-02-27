let mat4 = glMatrix.mat4

var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try {
        gl = canvas.getContext("experimental-webgl");
    } catch (e) {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl) {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.
function createOctahedron(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //1 top face
        0, 2, 0,
        0, 0, 2,
        2, 0, 0,
        //2 top face
        0, 2, 0,
        2, 0, 0,
        0, 0, -2,
        //3 top face
        0, 2, 0,
        0, 0, -2, -2, 0, 0,
        //4 top face
        0, 2, 0, -2, 0, 0,
        0, 0, 2,
        //1 bot face
        0, -2, 0,
        0, 0, 2,
        2, 0, 0,
        //2 bot face
        0, -2, 0,
        2, 0, 0,
        0, 0, -2,
        //3 bot face
        0, -2, 0,
        0, 0, -2, -2, 0, 0,
        //4 bot face
        0, -2, 0, -2, 0, 0,
        0, 0, 2,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 0.5, 0.0, 1.0],
        [0.0, 0.5, 0.5, 1.0]
    ];
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
    let octahedronIndices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17,
        18, 19, 20,
        21, 22, 23
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    let octahedron = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: octahedronIndexBuffer,
        vertSize: 3,
        nVerts: 24,
        colorSize: 4,
        nColors: 24,
        nIndices: 24,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    }
    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
    octahedron.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angel = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angel, rotationAxis);
    };
    return octahedron;
}

function createPentaPyramid(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //1 face
        0, 4, 0,
        0, 0, 2,
        2, 0, 0.5,
        //2 face
        0, 4, 0,
        2, 0, 0.5,
        1.25, 0, -2,
        //3 face
        0, 4, 0,
        1.25, 0, -2, -1.25, 0, -2,
        //4 face
        0, 4, 0, -1.25, 0, -2, -2, 0, 0.5,
        //5 face
        0, 4, 0, -2, 0, 0.5,
        0, 0, 2,
        //base
        0, 0, 2, -1.25, 0, -2, -2, 0, 0.5,
        1.25, 0, -2,
        2, 0, 0.5
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0]
    ];
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color => {
        if (faceColors.indexOf(color) == 5) {
            for (let j = 0; j < 5; j++)
                vertexColors.push(...color);
        } else {
            for (let j = 0; j < 3; j++)
                vertexColors.push(...color);
        }
    });
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let pentaPyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pentaPyramidIndexBuffer);
    let pentaPyramidIndices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11,
        12, 13, 14,
        15, 16, 17, 15, 18, 16, 15, 19, 18
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pentaPyramidIndices), gl.STATIC_DRAW);
    let pentaPyramid = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: pentaPyramidIndexBuffer,
        vertSize: 3,
        nVerts: 20,
        colorSize: 4,
        nColors: 20,
        nIndices: 24,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    }
    mat4.translate(pentaPyramid.modelViewMatrix, pentaPyramid.modelViewMatrix, translation);
    pentaPyramid.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angel = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angel, rotationAxis);
    };
    return pentaPyramid;
}

function createDodecahedron(gl, translation, rotationAxis) {
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //1 face front
        0, 0.62, 1.62, -1, 1, 1, -0.62, 1.62, 0,
        0.62, 1.62, 0,
        1, 1, 1,
        //2 face front
        0, 0.62, 1.62,
        1, 1, 1,
        1.62, 0, 0.62,
        1, -1, 1,
        0, -0.62, 1.62,
        //3 face front
        0, -0.62, 1.62,
        1, -1, 1,
        0.62, -1.62, 0, -0.62, -1.62, 0, -1, -1, 1,
        //4 face front
        0, 0.62, 1.62, -1, 1, 1, -1.62, 0, 0.62, -1, -1, 1,
        0, -0.62, 1.62,

        //1 face back
        0, 0.62, -1.62,
        1, 1, -1,
        0.62, 1.62, 0, -0.62, 1.62, 0, -1, 1, -1,
        //2 face back
        0, 0.62, -1.62, -1, 1, -1, -1.62, 0, -0.62, -1, -1, -1,
        0, -0.64, -1.62,
        //3 face back
        0, -0.64, -1.62, -1, -1, -1, -0.62, -1.62, 0,
        0.62, -1.62, 0,
        1, -1, -1,
        //4 face back
        0, 0.62, -1.62,
        0, -0.62, -1.62,
        1, -1, -1,
        1.62, 0, -0.62,
        1, 1, -1,
        //1 face rigth
        0.62, 1.62, 0,
        1, 1, -1,
        1.62, 0, -0.62,
        1.62, 0, 0.62,
        1, 1, 1,
        //2 face rigth
        0.62, -1.62, 0,
        1, -1, 1,
        1.62, 0, 0.62,
        1.62, 0, -0.62,
        1, -1, -1,
        //1 face left
        -0.62, 1.62, 0, -1, 1, 1, -1.62, 0, 0.62, -1.62, 0, -0.62, -1, 1, -1,
        //2 face left
        -0.62, -1.62, 0, -1, -1, -1, -1.62, 0, -0.62, -1.62, 0, 0.62, -1, -1, 1

    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 0.5, 1.0],
        [1.0, 1.0, 0.5, 1.0]
    ];
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++)
            vertexColors.push(...color);
    });
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);
    let dodecahedronIndices = [
        0, 1, 2, 0, 2, 3, 0, 3, 4,
        5, 6, 7, 5, 7, 8, 5, 8, 9,
        10, 11, 12, 10, 12, 13, 10, 13, 14,
        15, 16, 17, 15, 17, 18, 15, 18, 19,

        20, 21, 22, 20, 22, 23, 20, 23, 24,
        25, 26, 27, 25, 27, 28, 25, 28, 29,
        30, 31, 32, 30, 32, 33, 30, 33, 34,
        35, 36, 37, 35, 37, 38, 35, 38, 39,
        40, 41, 42, 40, 42, 43, 40, 43, 44,
        45, 46, 47, 45, 47, 48, 45, 48, 49,
        50, 51, 52, 50, 52, 53, 50, 53, 54,
        55, 56, 57, 55, 57, 58, 55, 58, 59
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    let dodecahedron = {
        buffer: vertexBuffer,
        colorBuffer: colorBuffer,
        indices: dodecahedronIndexBuffer,
        vertSize: 3,
        nVerts: 60,
        colorSize: 4,
        nColors: 60,
        nIndices: 108,
        primtype: gl.TRIANGLES,
        modelViewMatrix: mat4.create(),
        currentTime: Date.now()
    }
    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);
    dodecahedron.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angel = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angel, rotationAxis);
    };
    return dodecahedron;
}

function createShader(gl, str, type) {
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for (i = 0; i < objs.length; i++)
        objs[i].update();
}