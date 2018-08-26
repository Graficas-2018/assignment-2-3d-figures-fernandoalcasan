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

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.

function createPyramid(gl, translation, rotationAxis)
{
  // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        // triangulo 1 (base)
        -0.5, -1.0,  0.0,
         0.5, -1.0,  0.0,
         1.0, -1.0,  -1.0,

        // triangulo 2 (base)
        -0.5, -1.0,  0.0,
         1.0, -1.0,  -1.0,
         0.0, -1.0, -2.0,

        // triangulo 3 (base)
        -0.5, -1.0,  0.0,
         0.0, -1.0, -2.0,
        -1.0, -1.0, -1.0,

        // triangulo 4
        -0.5, -1.0,  0.0,
         0.5, -1.0,  0.0,
         0.0,  1.0, -1.0,

        // triangulo 5
         0.5, -1.0,  0.0,
         1.0, -1.0, -1.0,
         0.0, 1.0,  -1.0,

         // triangulo 6
         1.0, -1.0, -1.0,
         0.0, -1.0, -2.0,
         0.0,  1.0, -1.0,

         // triangulo 7
         0.0, -1.0, -2.0,
        -1.0, -1.0, -1.0,
         0.0,  1.0, -1.0,

         // triangulo 8
        -1.0, -1.0, -1.0,
        -0.5, -1.0, 0.0,
         0.0, 1.0, -1.0

       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0], // Triangulo 1 (base)
        [1.0, 0.0, 0.0], // Triangulo 2 (base)
        [1.0, 0.0, 0.0], // Triangulo 3 (base)
        [1.0, 1.0, 0.0], // Triangulo 4
        [0.0, 1.0, 1.0], // Triangulo 5
        [1.0, 0.0, 1.0], // Triangulo 6
        [0.0, 1.0, 0.0], // Triangulo 7
        [0.0, 0.0, 1.0]  // Triangulo 8
    ];

    var vertexColors = [];
    for (const color of faceColors)
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [
        0, 1, 2,      //Triangulo 1 (base)
        3, 4, 5,      //Triangulo 2 (base)
        6, 7, 8,      //Triangulo 3 (base)
        9, 10, 11,    //Triangulo 4
        12, 13, 14,   //Triangulo 5
        15, 16, 17,   //Triangulo 6
        18, 19, 20,   //Triangulo 7
        21, 22, 23    //Triangulo 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    var pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:24, colorSize:3, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createScutoid(gl, translation, rotationAxis)
{
  // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        // triangulo 1 (techo)
        -1.0,  2.0, -1.2,
        -0.45, 2.0, -2.0,
         0.35, 2.0, -1.8,

        // triangulo 2 (techo)
        -1.0,  2.0, -1.2,
         0.35, 2.0, -1.8,
        -0.75, 2.0, -0.2,

        // triangulo 3 (techo)
        -0.75, 2.0, -0.2,
         0.35, 2.0, -1.8,
         1.0,  2.0, -0.8,

        // triangulo 4 (techo)
        -0.75, 2.0, -0.2,
         1.0,  2.0, -0.8,
         0.15, 2.0,  0.0,

        // triangulo 5 (piso)
        0.55, -2.0, -1.8,
        1.00, -2.0, -0.8,
       -0.35, -2.0,  0.0,

        // triangulo 6 (piso)
        0.55, -2.0, -1.8,
       -0.35, -2.0,  0.0,
       -1.00, -2.0, -1.2,

        // triangulo 7 (piso)
        0.55, -2.0, -1.8,
       -1.00, -2.0, -1.2,
       -0.60, -2.0, -2.0,

       // triangulo 8 (cuerpo)
       -1.00, 2.00, -1.2,
       -0.55, 0.55,  0.2,
       -0.75, 2.00, -0.2,

       // triangulo 9 (cuerpo)
       -1.00, 2.0, -1.2,
       -0.55, 0.55, 0.2,
       -1.00, -2.0, -1.2,

       // triangulo 10 (cuerpo)
       -1.00, -2.0, -1.2,
       -0.55, 0.55, 0.2,
       -0.35, -2.0, 0.0,

       // triangulo 11 (cuerpo)
       -0.75, 2.0, -0.2,
       -0.55, 0.55, 0.2,
        0.15, 2.0, 0.0,

       // triangulo 12 (cuerpo)
        0.15, 2.0, 0.0,
       -0.55, 0.55, 0.2,
        1.00, 2.0, -0.8,

       // triangulo 13 (cuerpo)
        1.00, 2.0, -0.8,
       -0.55, 0.55, 0.2,
        1.00, -2.0, -0.8,

       // triangulo 14 (cuerpo)
       -0.35, -2.0, 0.0,
       -0.55, 0.55, 0.2,
        1.00, -2.0, -0.8,

       // triangulo 15 (cuerpo)
        1.00, 2.0, -0.8,
        0.35, 2.0, -1.8,
        1.00, -2.0, -0.8,

       // triangulo 16 (cuerpo)
        1.00, -2.0, -0.8,
        0.55, -2.0, -1.8,
        0.35, 2.0, -1.8,

       // triangulo 17 (cuerpo)
       -0.45, 2.0, -2.0,
        0.35, 2.0, -1.8,
        0.55, -2.0, -1.8,

       // triangulo 18 (cuerpo)
        0.55, -2.0, -1.8,
       -0.60, -2.0, -2.0,
       -0.45, 2.0, -2.0,

       // triangulo 19 (cuerpo)
       -1.00, 2.0, -1.2,
       -0.45, 2.0, -2.0,
       -0.60, -2.0, -2.0,

       // triangulo 20 (cuerpo)
       -0.60, -2.0, -2.0,
       -1.0, -2.0, -1.2,
       -1.00, 2.0, -1.2
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0],  // Triangulo 1 (techo)
        [1.0, 0.0, 0.0],  // Triangulo 2 (techo)
        [1.0, 0.0, 0.0],  // Triangulo 3 (techo)
        [1.0, 0.0, 0.0],  // Triangulo 4 (techo)
        [0.0, 1.0, 0.0],  // Triangulo 5 (piso)
        [0.0, 1.0, 0.0],  // Triangulo 6 (piso)
        [0.0, 1.0, 0.0],  // Triangulo 7 (piso)
        [0.0, 0.0, 1.0],  // Triangulo 8 (cuerpo)
        [0.0, 0.0, 1.0],  // Triangulo 9 (cuerpo)
        [0.0, 0.0, 1.0],  // Triangulo 10 (cuerpo)
        [1.0, 1.0, 0.0],  // Triangulo 11 (cuerpo)
        [0.0, 1.0, 1.0],  // Triangulo 12 (cuerpo)
        [0.0, 1.0, 1.0],  // Triangulo 13 (cuerpo)
        [0.0, 1.0, 1.0],  // Triangulo 14 (cuerpo)
        [1.0, 0.0, 1.0],  // Triangulo 15 (cuerpo)
        [1.0, 0.0, 1.0],  // Triangulo 16 (cuerpo)
        [0.7, 0.5, 0.2],  // Triangulo 17 (cuerpo)
        [0.7, 0.5, 0.2],  // Triangulo 18 (cuerpo)
        [0.0, 0.9, 0.5],  // Triangulo 19 (cuerpo)
        [0.0, 0.9, 0.5]   // Triangulo 20 (cuerpo)
    ];

    var vertexColors = [];
    for (const color of faceColors)
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var scutoidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);
    var scutoidIndices = [
        0, 1, 2,      //Triangulo 1 (techo)
        3, 4, 5,      //Triangulo 2 (techo)
        6, 7, 8,      //Triangulo 3 (techo)
        9, 10, 11,    //Triangulo 4 (techo)
        12, 13, 14,   //Triangulo 5 (piso)
        15, 16, 17,   //Triangulo 6 (piso)
        18, 19, 20,   //Triangulo 7 (piso)
        21, 22, 23,   //Triangulo 8 (cuerpo)
        24, 25, 26,   //Triangulo 9 (cuerpo)
        27, 28, 29,   //Triangulo 10 (cuerpo)
        30, 31, 32,   //Triangulo 11 (cuerpo)
        33, 34, 35,   //Triangulo 12 (cuerpo)
        36, 37, 38,   //Triangulo 13 (cuerpo)
        39, 40, 41,   //Triangulo 14 (cuerpo)
        42, 43, 44,   //Triangulo 15 (cuerpo)
        45, 46, 47,   //Triangulo 16 (cuerpo)
        48, 49, 50,   //Triangulo 17 (cuerpo)
        51, 52, 53,   //Triangulo 18 (cuerpo)
        54, 55, 56,   //Triangulo 19 (cuerpo)
        57, 58, 59    //Triangulo 20 (cuerpo)
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);

    var scutoid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
            vertSize:3, nVerts:60, colorSize:3, nColors: 60, nIndices:60,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

    scutoid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return scutoid;
}

function createOctahedron(gl, translation, rotationAxis)
{
  // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
        // triangulo 1
        0.0,  1.0, -1.0,
        0.0,  0.0,  0.0,
        1.0,  0.0, -1.0,

        // triangulo 2
        0.0,  1.0, -1.0,
        1.0,  0.0, -1.0,
        0.0,  0.0, -2.0,

        // triangulo 3
        0.0,  1.0, -1.0,
        0.0,  0.0, -2.0,
       -1.0,  0.0, -1.0,

        // triangulo 4
        0.0,  1.0, -1.0,
       -1.0,  0.0, -1.0,
        0.0,  0.0,  0.0,

        // triangulo 5
        0.0, -1.0, -1.0,
        0.0,  0.0,  0.0,
        1.0,  0.0, -1.0,

        // triangulo 6
        0.0, -1.0, -1.0,
        1.0,  0.0, -1.0,
        0.0,  0.0, -2.0,

        // triangulo 7
        0.0, -1.0, -1.0,
        0.0,  0.0, -2.0,
       -1.0,  0.0, -1.0,

        // triangulo 8
        0.0, -1.0, -1.0,
       -1.0,  0.0, -1.0,
        0.0,  0.0,  0.0,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0], // Triangulo 1
        [0.0, 1.0, 0.0], // Triangulo 2
        [0.0, 0.0, 1.0], // Triangulo 3
        [1.0, 1.0, 0.0], // Triangulo 4
        [0.0, 1.0, 1.0], // Triangulo 5
        [1.0, 0.0, 1.0], // Triangulo 6
        [0.5, 0.9, 0.9], // Triangulo 7
        [0.3, 0.9, 0.5]  // Triangulo 8
    ];

    var vertexColors = [];
    for (const color of faceColors)
    {
        for (var j=0; j < 3; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
    var octahedronIndices = [
        0, 1, 2,      //Triangulo 1
        3, 4, 5,      //Triangulo 2
        6, 7, 8,      //Triangulo 3
        9, 10, 11,    //Triangulo 4
        12, 13, 14,   //Triangulo 5
        15, 16, 17,   //Triangulo 6
        18, 19, 20,   //Triangulo 7
        21, 22, 23    //Triangulo 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

    var octahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:3, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    var up = true;
    var y = 0;

    octahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

        if(up == true)
        {
          y += 0.01;
          mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0,0.1,0]);
          if(y >= 0.2)
          {
            up = false;
          }
        }
        else
        {
          y -= 0.01;
          mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0,-0.1,0]);
          if(y <= -0.2)
          {
            up = true;
          }
        }
    };

    return octahedron;
}

function createShader(gl, str, type)
{
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

function initShader(gl)
{
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

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
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

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
