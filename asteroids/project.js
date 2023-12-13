// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_TexCoord = a_TexCoord;\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'uniform float u_Flag;\n' + // Flag for setting which texture to use for a shape
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform sampler2D u_Sampler2;\n' +
  'uniform sampler2D u_Sampler3;\n' +
  'uniform sampler2D u_Sampler4;\n' +
  'uniform sampler2D u_Sampler5;\n' +
  'uniform sampler2D u_Sampler6;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  vec4 texColor;\n' +
  '  if (u_Flag == 0.0) {\n' +
  '    texColor = texture2D(u_Sampler0, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 1.0) {\n' +
  '    texColor = texture2D(u_Sampler1, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 2.0) {\n' +
  '    texColor = texture2D(u_Sampler2, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 3.0) {\n' +
  '    texColor = texture2D(u_Sampler3, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 4.0) {\n' +
  '    texColor = texture2D(u_Sampler4, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 5.0) {\n' +
  '    texColor = texture2D(u_Sampler5, v_TexCoord);\n' +
  '  }\n' +
  '  else if (u_Flag == 6.0) {\n' +
  '    texColor = texture2D(u_Sampler6, v_TexCoord);\n' +
  '  }\n' +
  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
  '  vec3 diffuse = u_LightColor * texColor.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * texColor.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, texColor.a);\n' +
  '}\n';

// Global variables to affect view and transformations
var g_EyeX = 0.0, g_EyeY = 0.0, g_EyeZ = 35.0; // Eye position
var g_EyeLookX = 0.0, g_EyeLookY = 0.0, g_EyeLookZ = -1.0 // Where the eye is looking
var g_EyeUpX = 0.0, g_EyeUpY = 1.0, g_EyeUpZ = 0.0; // Up vector
var fov = 45; // Field of view (in degrees)
var horizontalAngle = 0.0;
var verticalAngle = 0.0;

// Global variables relating to animations
var rotationAngle = 0.0;
var rotationAngleStep = 5.0;
var orbitAngle = 0.0;
var orbitAngleStep = 45.0;
var astPositionStep = 100.0;
var astXPos = -5.0;
var astYPos = 0.0;
var astZPos = 0.0;
var astXPos_Step = 0.1;
var astYPos_Step = 0.0;
var astZPos_Step = 0.0;

// Global variables for collision detection
var laserCollisionX = 0.0;
var laserCollisionY = 0.0;
var laserCollisionZ = 0.0;
var laserRayDirectionX = 0.0;
var laserRayDirectionY = 0.0;
var laserRayDirectionZ = 0.0;
var asteroidCollisionX = 0.0;
var asteroidCollisionY = 0.0;
var asteroidCollisionZ = 0.0;

// Number of vertices of the shapes for the draw functions
var cylinder = 0.0; // Cylinder vertices
var sphere = 0.0; // Sphere vertices
var circle = 0.0; // Circle vertices
var square = 0.0; // Square vertices
var triangle = 0.0; // Triangle vertices
var cube = 0.0; // Cube vertices

// Start variables for draw functions
var triangleStart = 0.0; // Triangle start
var squareStart = 0.0; // Square start
var circleStart = 0.0; // Circle start
var sphereStart = 0.0; // Sphere start
var cylinderStart = 0.0; // Cylinder start
var cubeStart = 0.0; // Cube start

// Matrix variables for transformations and lighting
var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjMatrix;
var u_NormalMatrix;
var u_LightColor;
var u_LightPosition;
var u_AmbientLight;

// Variables for misc drawing
var numAsteroids = 15; // Number of asteroids to draw
var asteroidPositions = []; // Array to hold the positions of the asteroids
var numSmallAsteroids = 0; // Number of small asteroids to draw
var smallAsteroidPositions = []; // Array to hold the positions of the small asteroids

// Global variables to store the laser's origin
var laserShot = false;
var laserOriginX = 0;
var laserOriginY = 0;
var laserOriginZ = 0;
var laserRotationX = 0;
var laserRotationY = 0;

// Flag for changing the texture applied to individual shapes
var u_Flag;

// Audio variables
var asteroidEffect = new Audio('./audio/asteroid-effect.mp3');
var spaceshipFlight = new Audio('./audio/spaceship-flight.mp3');
var laserEffect = new Audio('./audio/laser-effect.mp3');

// General variables for the program and canvas
var n;
var canvas;
var hud;
var gl;
var ctx;
var score = 0;

// Global variables for fetching vertex data from .obj files

async function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  hud = document.getElementById('hud');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Get the rendering context for 2DCG
  ctx = hud.getContext('2d');
  if (!ctx) {
    console.log('Failed to get the rendering context for the HUD');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates, the color and the normal
  // 'await' initVertexBuffers(gl) so that it has time to parse and load vertex data before continuing
  n = await initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  u_Flag = gl.getUniformLocation(gl.program, 'u_Flag');
  if (!u_Flag) {
    console.log('Failed to get the storage location of u_Flag');
    return false;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

  if (!u_ModelMatrix || !u_ViewMatrix || !u_ProjMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.log('Failed to get the storage locations for the matrices');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 15.0, 15.0, -35.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.4, 0.4, 0.4);

  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, g_EyeLookX, g_EyeLookY, g_EyeLookZ, g_EyeUpX, g_EyeUpY, g_EyeUpZ);
  // projMatrix.setOrtho(-100, 100, -100, 100, 0, 100);
  projMatrix.setPerspective(fov, canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  
  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  document.onkeydown = function(ev){ keydown(ev, canvas, gl, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag); };
  document.addEventListener('keyup', function(ev) { keyup(ev, canvas, gl, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag); }, false);


  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }

  // Start drawing
  var tick = function() {
    rotationAngle = animateRotationAngle(rotationAngle);  // Update the rotation angle
    orbitAngle = animateOrbit(orbitAngle); // Update the orbit angle
    astXPos = animateAsteroid(astXPos); // Update the asteroid x position
    draw2D(ctx); // Draw the HUD
    draw(gl, canvas, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag);
    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  
  tick();
}

async function initVertexBuffers(gl) {

// Retrieve the obj text data for asteroid
const asteroidResponse = await fetch('asteroid.obj');  
const asteroidText = await asteroidResponse.text();
const asteroidData = parseOBJ(asteroidText);

// Store the return data from the parseOBJ function for the asteroid
const {position: asteroidPositions, texcoord: asteroidTextureCoords, normal: asteroidNormals} = asteroidData;
asteroid = asteroidPositions.length / 3;

// Retrieve the obj text data for cube
const cubeResponse = await fetch('cube.obj');
const cubeText = await cubeResponse.text();
const cubeData = parseOBJ(cubeText);

// Store the return data from the parseOBJ function for the cube
const {position: cubePositions, texcoord: cubeTextureCoords, normal: cubeNormals} = cubeData;
cube = cubePositions.length / 3;

// Retrieve the obj text data for sphere
const sphereResponse = await fetch('sphere.obj');
const sphereText = await sphereResponse.text();
const sphereData = parseOBJ(sphereText);

// Store the return data from the parseOBJ function for the sphere
const {position: spherePositions, texcoord: sphereTextureCoords, normal: sphereNormals} = sphereData;
sphere = spherePositions.length / 3;

// Retrieve the obj text data for cylinder
const cylinderResponse = await fetch('cylinder.obj');
const cylinderText = await cylinderResponse.text();
const cylinderData = parseOBJ(cylinderText);

// Store the return data from the parseOBJ function for the cylinder
const {position: cylinderPositions, texcoord: cylinderTextureCoords, normal: cylinderNormals} = cylinderData;
cylinder = cylinderPositions.length / 3;

// Retrieve the obj text data for ship
const shipResponse = await fetch('ship.obj');
const shipText = await shipResponse.text();
const shipData = parseOBJ(shipText);

// Store the return data from the parseOBJ function for the ship
const {position: shipPositions, texcoord: shipTextureCoords, normal: shipNormals} = shipData;
ship = shipPositions.length / 3;

// Define the start/length data of the shapes
cubeStart = 0.0;
asteroidStart = cube;
sphereStart = asteroid + cube;
cylinderStart = sphere + asteroid + cube;
shipStart = cylinder + sphere + asteroid + cube;

  var vertices = new Float32Array(cubePositions.concat(asteroidPositions).concat(spherePositions).concat(cylinderPositions).concat(shipPositions));
  var n = vertices.length / 3;
  console.log(vertices);

  // var normals = new Float32Array(triangleNormals.concat(squareNormals).concat(circleNormals).concat(cubeNormals).concat(positions).concat(cylinderVertices).concat(asteroid_normals));
  var normals = new Float32Array(cubeNormals.concat(asteroidNormals).concat(sphereNormals).concat(cylinderNormals).concat(shipNormals));
  console.log(normals);

  // var texCoords = new Float32Array(triangleTexCoords.concat(squareTexCoords).concat(circleTexCoords).concat(cubeTexCoords));
  var texCoords = new Float32Array(cubeTextureCoords.concat(asteroidTextureCoords).concat(sphereTextureCoords).concat(cylinderTextureCoords).concat(shipTextureCoords));
  console.log(texCoords);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', texCoords, 2, gl.FLOAT)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

   // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  return n;
}

function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function initTextures(gl, n) {
  // Create a texture object
  var texture0 = gl.createTexture(); 
  var texture1 = gl.createTexture();
  var texture2 = gl.createTexture();
  var texture3 = gl.createTexture();
  var texture4 = gl.createTexture();
  var texture5 = gl.createTexture();
  var texture6 = gl.createTexture();
  if (!texture0 || !texture1 || !texture2 || !texture3 || !texture4 || !texture5 || !texture6) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler0 and u_Sampler1
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  var u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  var u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  var u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  var u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if (!u_Sampler0 || !u_Sampler1 || !u_Sampler2 || !u_Sampler3 || !u_Sampler4 || !u_Sampler5 || !u_Sampler6) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image object
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();
  var image5 = new Image();
  var image6 = new Image();

  if (!image0 || !image1 || !image2 || !image3 || !image4 || !image5 || !image6) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called when image loading is completed
  image0.onload = function(){ loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };
  image2.onload = function(){ loadTexture(gl, n, texture2, u_Sampler2, image2, 2); };
  image3.onload = function(){ loadTexture(gl, n, texture3, u_Sampler3, image3, 3); };
  image4.onload = function(){ loadTexture(gl, n, texture4, u_Sampler4, image4, 4); };
  image5.onload = function(){ loadTexture(gl, n, texture5, u_Sampler5, image5, 5); };
  image6.onload = function(){ loadTexture(gl, n, texture6, u_Sampler6, image6, 6); };

  // Tell the browser to load an Image
  image0.src = './images/space4k.jpg';
  image1.src = './images/sun.jpg';
  image2.src = './images/asteroid2.jpg';
  image3.src = './images/earth.jpg';
  image4.src = './images/metal.jpg';
  image5.src = './images/lazer.jpg';
  image6.src = './images/earth.jpg';

  return true;
}
// Specify whether the texture unit is ready to use
var g_texUnit0 = false, g_texUnit1 = false, g_texUnit2 = false, g_texUnit3 = false, g_texUnit4 = false, g_texUnit5 = false, g_texUnit6 = false; 
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else if (texUnit == 1) {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  } else if (texUnit == 2) {
    gl.activeTexture(gl.TEXTURE2);
    g_texUnit2 = true;
  } else if (texUnit == 3){
    gl.activeTexture(gl.TEXTURE3);
    g_texUnit3 = true;
  } else if (texUnit == 4) {
    gl.activeTexture(gl.TEXTURE4);
    g_texUnit4 = true;
  } else if (texUnit == 5) {
    gl.activeTexture(gl.TEXTURE5);
    g_texUnit5 = true;
  } else if (texUnit == 6){
    gl.activeTexture(gl.TEXTURE6);
    g_texUnit6 = true;
  }

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);   

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler, texUnit);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (g_texUnit0 && g_texUnit1 && g_texUnit2 && g_texUnit3 && g_texUnit4 && g_texUnit5 && g_texUnit6) {
    draw(gl, canvas, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag);
  }
}

var asteroidDrawn = false;

// A draw function to draw everything
function draw(gl, canvas, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag) {
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, g_EyeLookX, g_EyeLookY, g_EyeLookZ, 0, 1, 0);
  // projMatrix.setOrtho(-100, 100, -100, 100, 0, 100);
  projMatrix.setPerspective(fov, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // Clear the canvas and depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (laserShot) {
    drawLaser(gl, n, u_Flag, 1.0);
  }
  
  drawSkybox(gl, n, u_Flag, 0.0);
  drawSun(gl, u_Flag, 1.0);
  drawPlanet(gl, u_Flag);
  drawSpaceStation(gl, n, u_Flag);

  for (var i = 0; i < numAsteroids; i++) {
    drawAsteroid(gl, u_Flag, 2.0, asteroidPositions, i);
  }

  for (var i = 0; i < numSmallAsteroids; i++) {
    drawSmallAsteroid(gl, u_Flag, 2.0, smallAsteroidPositions, i);
  }

  checkCollision();
}

function checkCollision() {
  // Define the ray
  var ray = {
    origin: { x: laserCollisionX, y: laserCollisionY, z: laserCollisionZ },
    direction: { x: laserRayDirectionX, y: laserRayDirectionY, z: laserRayDirectionZ }
  };

  // Check collision with large asteroids
  for (var i = 0; i < asteroidPositions.length; i++) {
    // Define the sphere
    var sphere = {
      center: { x: asteroidPositions[i].x, y: asteroidPositions[i].y, z: asteroidPositions[i].z },
      radius: 3.0 // Adjust based on your asteroid size
    };

    if (isIntersecting(ray, sphere)) {
      console.log('Collision detected with asteroid ' + i + '!');
      
      // Play the asteroid collision sound effect
      asteroidEffect.play();

      // Increment the score
      score++;

      // Increment global small asteroid count and draw three small asteroids
      numSmallAsteroids += 3;
      for (var j = 0; j < 3; j++) {
        smallAsteroidPositions.push({
          x: asteroidPositions[i].x + Math.random() * 10 - 5,
          y: asteroidPositions[i].y + Math.random() * 10 - 5,
          z: asteroidPositions[i].z + Math.random() * 10 - 5
        });
      }

      // Remove asteroid from array
      asteroidPositions.splice(i, 1);

      // Decrement global asteroid count so that the next draw doesn't just redraw all the asteroids
      numAsteroids--;

      // Decrement i so the next iteration doesn't skip an asteroid due to the reindexing after the splice
      i--;
    }
  }

  // Check collision with small asteroids
  for (var i = 0; i < smallAsteroidPositions.length; i++) {
    // Define the sphere
    var sphere = {
      center: { x: smallAsteroidPositions[i].x, y: smallAsteroidPositions[i].y, z: smallAsteroidPositions[i].z },
      radius: 1.0 // Adjust based on your small asteroid size
    };

    if (isIntersecting(ray, sphere)) {
      console.log('Collision detected with small asteroid ' + i + '!');

      // Play the asteroid collision sound effect
      asteroidEffect.play();

      // Increment the score
      score++;

      // Remove small asteroid from array
      smallAsteroidPositions.splice(i, 1);

      // Decrement global small asteroid count so that the next draw doesn't just redraw all the small asteroids
      numSmallAsteroids--;

      // Decrement i so the next iteration doesn't skip a small asteroid due to the reindexing after the splice
      i--;
    }
  }
}

function isIntersecting(ray, sphere) {
  // Calculate the vector from the ray's origin to the sphere's center
  var oc = {
    x: ray.origin.x - sphere.center.x,
    y: ray.origin.y - sphere.center.y,
    z: ray.origin.z - sphere.center.z
  };

  // Calculate the projection of oc onto the ray's direction
  var projection = dotProduct(oc, ray.direction);

  // Calculate the squared length of the oc vector
  var ocSquared = dotProduct(oc, oc);

  // If the projection is negative and the squared length of oc is greater than the squared radius of the sphere, the ray does not intersect the sphere
  if (projection < 0 && ocSquared > sphere.radius * sphere.radius) {
    return false;
  }

  // Calculate the squared distance from the sphere's center to the projection
  var distSquared = ocSquared - projection * projection;

  // If the squared distance is greater than the squared radius of the sphere, the ray does not intersect the sphere
  if (distSquared > sphere.radius * sphere.radius) {
    return false;
  }

  return true;
}

function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/*
The following are functions to build the individual shapes that make up the rest of the drawing
*/

// Functions to draw more complex shapes
function drawSkybox(gl, n, u_Flag, flag) {
  modelMatrix.setTranslate(0.0, 0.0, 0.0);
  modelMatrix.scale(60.0, 60.0, 60.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, cubeStart, cube);
}

function drawSpaceStation(gl, n, u_Flag) {
  // Draw the top of the space station (joint model)
  modelMatrix.setScale(3.0, 3.0, 3.0);
  modelMatrix.translate(-10.0, 5.0, 10.0);
  modelMatrix.rotate(rotationAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, cubeStart, cube);

  // Draw the main body of the space station (joint model)
  modelMatrix.scale(0.5, 3.0, 0.5);
  modelMatrix.translate(0.0, -1.25, 0.0);
  modelMatrix.rotate(rotationAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, cylinderStart, cylinder);

  // Draw the arms of the space station (joint model)
  modelMatrix.rotate(90, 0.0, 0.0, 1.0);
  modelMatrix.scale(0.07, 5.0, 0.5);
  modelMatrix.translate(0.0, 0.0, 0.0);
  modelMatrix.rotate(rotationAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, cylinderStart, cylinder);

  // Draw the left wing of the space station (joint model)
  modelMatrix.rotate(90, 0.0, 0.0, 1.0);
  modelMatrix.translate(1.0, 0.0, 0.0);
  modelMatrix.scale(0.25, 1.0, 10.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, cubeStart, cube);

  // Draw the right wing of the space station (joint model)
  modelMatrix.translate(-8.0, 0.0, 0.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, cubeStart, cube);

  // Draw the bottom of the space station
  modelMatrix.setTranslate(-30.0, -8.5, 29.9); // Adjust translation to position the sphere at the end of the cylinder
  modelMatrix.scale(5.0, 5.0, 5.0); // Adjust scaling to fit the end of the cylinder
  modelMatrix.rotate(rotationAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 4.0);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphere);
}

function drawAsteroid(gl, u_Flag, flag, asteroidPosition, i) {
  // Generate a new random position each time drawAsteroid is called
  if (!asteroidPosition[i]) {
    asteroidPosition[i] = {
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      z: Math.random() * 60 - 30
    };
  }

  // Set the collision point to be the asteroid's position
  asteroidCollisionX = asteroidPosition[i].x;
  asteroidCollisionY = asteroidPosition[i].y;
  asteroidCollisionZ = asteroidPosition[i].z;

  // Set the asteroid's position
  modelMatrix.setTranslate(asteroidPosition[i].x, asteroidPosition[i].y, asteroidPosition[i].z);
  modelMatrix.rotate(rotationAngle, 1, 0, 1);
  modelMatrix.scale(2.0, 2.0, 2.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, asteroidStart, asteroid);
}

function drawSmallAsteroid(gl, u_Flag, flag, asteroidPosition, i) {
  // Generate a new random position close to the deleted asteroid
  if (!asteroidPosition[i]) {
    asteroidPosition[i] = {
      x: asteroidCollisionX + Math.random() * 10 - 5,
      y: asteroidCollisionY + Math.random() * 10 - 5,
      z: asteroidCollisionZ + Math.random() * 10 - 5
    };
  }

  // Set the asteroid's position
  modelMatrix.setTranslate(asteroidPosition[i].x, asteroidPosition[i].y, asteroidPosition[i].z);
  modelMatrix.rotate(rotationAngle, 1, 0, 1);
  modelMatrix.scale(0.5, 0.5, 0.5); // Scale down the asteroid
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, asteroidStart, asteroid);
}

// FUnction to draw the sun, which is a sphere
function drawSun(gl, u_Flag, flag) {
  modelMatrix.setTranslate(20.0, 20.0, -50.0);
  modelMatrix.rotate(rotationAngle, 1, 1, 0);
  modelMatrix.scale(3, 3, 3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphere);
}

// Function to draw the planet
function drawPlanet(gl, u_Flag) {
  modelMatrix.setTranslate(0.0, -13.0, 0.0);
  modelMatrix.rotate(rotationAngle, 0, 1, 1);
  modelMatrix.scale(10.0, 10.0, 10.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform1f(u_Flag, 3.0);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphere);

  // Draw the moon
  modelMatrix.translate(0.0, 2.0, -1.5); // Rotation angle, rotation axis (0, 0, 1)
  modelMatrix.rotate(rotationAngle, 0, 0, 1);
  modelMatrix.scale(0.25, 0.25, 0.25);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, 2.0);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphere);
}

function drawMoon(gl, n, u_Flag, flag) {
  // Set the moon rotating around the planet
  modelMatrix.setTranslate(0.0, -13.0, -10.0);
  modelMatrix.rotate(orbitAngle, 0, 1, 0);
  modelMatrix.translate(10.0, 13.0, 10.0);
  modelMatrix.rotate(rotationAngle, 0, 1, 1);
  modelMatrix.scale(1.0, 1.0, 1.0);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphere);
}

function drawLaser(gl, n, u_Flag, flag) {
  // Calculate direction vector
  var dirX = g_EyeLookX - g_EyeX;
  var dirY = g_EyeLookY - g_EyeY;
  var dirZ = g_EyeLookZ - g_EyeZ;

  // Normalize direction vector
  var dirLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
  dirX /= dirLength;
  dirY /= dirLength;
  dirZ /= dirLength;

  // Set the laser's ray direction to be the normalized direction vector
  laserRayDirectionX = dirX;
  laserRayDirectionY = dirY;
  laserRayDirectionZ = dirZ;

  // Always set the laser's origin and rotation to be in front of the camera
  laserOriginX = g_EyeX + dirX * 1.0;
  laserOriginY = g_EyeY + dirY * 1.0 - 0.20;
  laserOriginZ = g_EyeZ + dirZ * 1.0;

  // Calculate the rotation angles based on the direction vector
  laserRotationX = Math.atan2(Math.sqrt(dirX * dirX + dirZ * dirZ), dirY) * 180 / Math.PI;
  laserRotationY = Math.atan2(dirX, dirZ) * 180 / Math.PI;
  if (laserRotationY < 0) {
    laserRotationY += 360;
  }

  // Set the collision point to be the far end of the laser
  var laserLength = 20.0; // Adjust based on your laser's length
  laserCollisionX = laserOriginX + laserRayDirectionX * laserLength;
  laserCollisionY = laserOriginY + laserRayDirectionY * laserLength;
  laserCollisionZ = laserOriginZ + laserRayDirectionZ * laserLength;

  // Position the laser at its origin
  modelMatrix.setTranslate(laserOriginX, laserOriginY, laserOriginZ);

  // Rotate the laser to its calculated rotation
  modelMatrix.rotate(laserRotationY, 0, 1, 0); // Rotate around y-axis
  modelMatrix.rotate(laserRotationX, 1, 0, 0); // Rotate around x-axis

  // Scale the laser
  modelMatrix.scale(0.01, 20.0, 0.01);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform1f(u_Flag, flag);
  gl.drawArrays(gl.TRIANGLES, cylinderStart, cylinder);
}

/*
Functions to provide user input for moving the camera/player and to draw everything
*/

function keydown(ev, canvas, gl, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag) {
  var angleSpeed = 0.05;
  var moveSpeed = 0.8;
  
  if(ev.keyCode == 39) { // The right arrow key was pressed
    horizontalAngle += angleSpeed;
    // Ensure the angle is within the range [0, 2π]
    if (horizontalAngle > 2 * Math.PI) {
      horizontalAngle -= 2 * Math.PI;
    }
  }
  else if (ev.keyCode == 37) { // The left arrow key was pressed
    horizontalAngle -= angleSpeed;
    // Ensure the angle is within the range [0, 2π]
    if (horizontalAngle < 0) {
      horizontalAngle += 2 * Math.PI;
    }
  }
  else if (ev.keyCode == 38) { // The up arrow key was pressed
    verticalAngle += angleSpeed;
    // Clamp the angle to the range [-π/2, π/2] to prevent flipping
    verticalAngle = Math.max(Math.min(verticalAngle, Math.PI / 2), -Math.PI / 2);
  }
  else if (ev.keyCode == 40) { // The down arrow key was pressed
    verticalAngle -= angleSpeed;
    // Clamp the angle to the range [-π/2, π/2] to prevent flipping
    verticalAngle = Math.max(Math.min(verticalAngle, Math.PI / 2), -Math.PI / 2);
  }

  // Calculate the new look-at point
  var dx = Math.sin(horizontalAngle);
  var dy = Math.sin(verticalAngle);
  var dz = -Math.cos(horizontalAngle);
  
  g_EyeLookX = g_EyeX + dx;
  g_EyeLookY = g_EyeY + dy;
  g_EyeLookZ = g_EyeZ + dz;

  // Calculate the forward and right vectors
  var forward = [dx, dy, dz];
  var right = [-dz, 0, dx];

  if (ev.keyCode == 65) { // The a key was pressed
    spaceshipFlight.play();
    g_EyeX -= right[0] * moveSpeed;
    g_EyeY -= right[1] * moveSpeed;
    g_EyeZ -= right[2] * moveSpeed;
  }
  
  else if (ev.keyCode == 68) { // The d key was pressed
    spaceshipFlight.play();
    g_EyeX += right[0] * moveSpeed;
    g_EyeY += right[1] * moveSpeed;
    g_EyeZ += right[2] * moveSpeed;
  }
  
  else if (ev.keyCode == 87) { // The w key was pressed
    spaceshipFlight.play();
    g_EyeX += forward[0] * moveSpeed;
    g_EyeY += forward[1] * moveSpeed;
    g_EyeZ += forward[2] * moveSpeed;
  }
  
  else if (ev.keyCode == 83) { // The s key was pressed
    spaceshipFlight.play();
    g_EyeX -= forward[0] * moveSpeed;
    g_EyeY -= forward[1] * moveSpeed;
    g_EyeZ -= forward[2] * moveSpeed;
  }

  // If the spacebar is pressed, shoot a laser
  else if (ev.keyCode == 32) {
    laserShot = true;
    laserEffect.play();
  }

  draw2D(ctx); // Draw the HUD
  draw(gl, canvas, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag);
}

// Add a new function to handle the keyup event
function keyup(ev, canvas, gl, n, u_ViewMatrix, viewMatrix, u_ProjMatrix, projMatrix, u_ModelMatrix, modelMatrix, u_Flag) {
  if (ev.keyCode == 32) { // The spacebar was released
    laserShot = false;
    laserEffect.pause();
    laserEffect.currentTime = 0;
  }

  // else if keyup is the wasd keys
  else if (ev.keyCode == 65 || ev.keyCode == 68 || ev.keyCode == 87 || ev.keyCode == 83) {
    spaceshipFlight.pause();
    spaceshipFlight.currentTime = 0;
  }
}

// Last time that this function was called
var g_last = Date.now();

function animateRotationAngle(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (rotationAngleStep * elapsed) / 1000.0;
  return newAngle %= 360;
}

function animateOrbit(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (orbitAngleStep * elapsed) / 1000.0;
  return newAngle %= 360;
}

function animateAsteroid(position) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newPosition = position + (astPositionStep * elapsed) / 1000.0;
  return newPosition;
}

function draw2D(ctx) {
  // Fill the entire canvas with a dark grey color
  ctx.fillStyle = 'rgba(33, 33, 33, 1)'; // Dark grey
  ctx.fillRect(0, 0, 1280, 720);

  // Cut out a smaller rectangle for the transparent area
  roundedRect(ctx, 50, 50, 1180, 620, 20, true); // Adjusted dimensions

  // Draw spaceship window border
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(33, 33, 33, 1)'; // Dark grey
  ctx.lineWidth = 10;
  roundedRect(ctx, 50, 50, 1180, 620, 20); // Adjusted dimensions

  // Draw console at the bottom
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a semi-transparent gray color
  roundedRect(ctx, 55, 600, 1170, 100, 20, false, true); // Adjusted dimensions

  // Draw neon letters
  ctx.font = '16px "Orbitron"'; // Sci-fi font
  ctx.fillStyle = 'rgba(84, 255, 159, 1)'; // Neon color

  // Score
  ctx.fillText('Score: ' + score, 605, 85); // Adjusted position

  // Left column
  ctx.fillText('W - Move Forward', 65, 620); // Adjusted position
  ctx.fillText('S - Move Backward', 65, 640); // Adjusted position
  ctx.fillText('A - Turn Left', 65, 660); // Adjusted position
  ctx.fillText('D - Turn Right', 65, 680); // Adjusted position

  // Center column
  ctx.fillText('Space - Shoot', 605, 620); // Adjusted position
  ctx.fillText('X Loc: '+ Math.floor(g_EyeX), 605, 640); // Adjusted position
  ctx.fillText('Y Loc: '+ Math.floor(g_EyeY), 605, 660); // Adjusted position
  ctx.fillText('Z Loc: '+ Math.floor(g_EyeZ), 605, 680); // Adjusted position

  // Right column
  ctx.fillText('Up - Look Up', 1085, 620); // Adjusted position
  ctx.fillText('Down - Look Down', 1085, 640); // Adjusted position
  ctx.fillText('Left - Look Left', 1085, 660); // Adjusted position
  ctx.fillText('Right - Look Right', 1085, 680); // Adjusted position

  // Draw two small semi-transparent rectangles overlapping in the center of the canvas for a target reticle
  var centerX = 1280 / 2; // Half of the new canvas width
  var centerY = 720 / 2; // Half of the new canvas height
  var length = 30; // Adjust based on your desired target size
  var thickness = 3; // Adjust based on your desired target thickness
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // More semi-transparent white
  ctx.fillRect(centerX - length / 2, centerY - thickness / 2, length, thickness); // Horizontal rectangle
  ctx.fillRect(centerX - thickness / 2, centerY - length / 2, thickness, length); // Vertical rectangle
}

// Function to draw a rectangle with rounded corners
function roundedRect(ctx, x, y, width, height, radius, clear = false, fill = false, stroke = true) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  if (clear) ctx.clearRect(x, y, width, height);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2],
  };
}
