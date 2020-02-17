import { World } from "core";
import { Cell, Tile } from "core/tile";
import { SPRITESHEET } from "game/spritesheet";
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import glsl from "../glsl";

const vertexShader = glsl`
precision mediump float;

// the vertex shader's main goals are:
// 1. set gl_Position to a clip-coordinate
// 2. pass varyings along to fragment shader.
// you can accept two types of inputs:
//   'attribute' variables, which change per vertex
//   'uniform' variables, which are constant for a given draw context.
// WebGL thankfully hooks up a bunch of attributes and uniforms, see https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram
// see also my explorations: https://codesandbox.io/s/reactthreejstemplate-lwvhu


// Comes from WebGLProgram
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Comes from threejs Geometry
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// attributes we provide
// these are constant per instance
attribute vec3 instancedTileCenter;
attribute vec3 instancedTileScale;
attribute vec3 instancedTileColor;
attribute vec2 instancedTexturePosition;
attribute float instancedAlpha;

// things we pass onto fragment
varying vec3 vTileCenter;
varying vec3 vColor;
varying vec2 vUv;
varying vec2 vTexturePosition;
varying float vAlpha;

// based on https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_instancing_billboards.html
void main() {
  vTileCenter = instancedTileCenter;
  vColor = instancedTileColor;
  vUv = uv;
  vTexturePosition = instancedTexturePosition;
  vAlpha = instancedAlpha;

  vec4 mvPosition = modelViewMatrix * vec4(instancedTileCenter, 1.);
  mvPosition.xyz += position * instancedTileScale;
  // mvPosition.xyz += position;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = glsl`
// for the fragment shader, the main goal is to set gl_FragColor. Its inputs are
//   'varying' variables from the vertex shader, interpolated along the triangle
//   'uniform' variables
precision mediump float;

// these should match the corresponding section in the vertexShader exactly
varying vec3 vTileCenter;
varying vec3 vColor;
varying vec2 vUv;
varying vec2 vTexturePosition;
varying float vAlpha;

const vec2 spritesheetSize = vec2(256., 256.);
uniform sampler2D spriteSheet;

float myRound(float x) {
  return sign(x) * floor(abs(x) + 0.5);
}

float random(float x) {
  return fract(sin(x * .43));
}

// uv - [0,1]x[0,1] - our local sprite (16x16) UV coords
// texturePosition - the grid x/y where our sprite lives in our texture. NOTE:
// for texturePosition, top-left is 0, 0 (Y is image coordinates)
// textureSize - the pixel width/height of the full spritesheet
// returns: a UV coordinate for this sprite, relative to the full spritesheet
vec2 getCorrectUv(vec2 uv, vec2 texturePosition, vec2 textureSize) {
  vec2 spriteSheetPxStart = texturePosition * vec2(32.);
  spriteSheetPxStart.y = textureSize.y - spriteSheetPxStart.y - 32.;
  vec2 spriteSheetUv = spriteSheetPxStart + uv * vec2(32.);
  vec2 minUv = spriteSheetPxStart + vec2(1.);
  vec2 maxUv = spriteSheetPxStart + vec2(32. - 1.);
  return clamp(spriteSheetUv / textureSize, minUv / textureSize, maxUv / textureSize);
}

void main() {
  vec2 correctUv = getCorrectUv(vUv, vTexturePosition, spritesheetSize);
  vec4 textureColor = texture2D(spriteSheet, correctUv);
  gl_FragColor = vec4(textureColor.rgb * vColor, textureColor.a * vAlpha);
}
`;

const TileShaderMaterial = new RawShaderMaterial({
  uniforms: {
    spriteSheet: { value: SPRITESHEET() },
  },
  transparent: true,
  vertexShader,
  fragmentShader,
  side: DoubleSide,
});

class TileBatcher {
  private static newGeometry() {
    const referenceGeometry = new PlaneBufferGeometry(1, 1);
    const geometry = new InstancedBufferGeometry();
    // this copies:
    // [0, 2, 1, 2, 3, 1]
    // index has a specific and somewhat cryptic data storage format
    // it's a flattened array of size three elements
    // each three adjacent numbers gets interpreted as one triangle
    // each individual number's value is an *index* into a "virtual
    // vertex array" that's defined the attributes array.
    geometry.index = referenceGeometry.index;
    // this copies:
    // position: BufferAttribute, 4 items, size 3
    // normal: BufferAttribute, 4 items, size 3
    // uv: BufferAttribute, 4 items, size 2
    geometry.attributes = referenceGeometry.attributes;
    return geometry;
  }

  geometry!: InstancedBufferGeometry;

  public maxTiles = this.world.height * this.world.width * 2;

  centers = new InstancedBufferAttribute(new Float32Array(3 * this.maxTiles), 3, false, 1);

  colors = new InstancedBufferAttribute(new Float32Array(3 * this.maxTiles), 3, false, 1);

  scales = new InstancedBufferAttribute(new Float32Array(3 * this.maxTiles), 3, false, 1);

  texturePositions = new InstancedBufferAttribute(new Float32Array(2 * this.maxTiles), 2, false, 1);

  alphas = new InstancedBufferAttribute(new Float32Array(this.maxTiles).fill(1), 1, false, 1);

  public readonly mesh: Mesh;

  constructor(public world: World) {
    this.geometry = TileBatcher.newGeometry();
    this.mesh = new Mesh(this.geometry, TileShaderMaterial);
    this.mesh.name = "TileBatcher Mesh";
    this.mesh.frustumCulled = false;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrixWorld();
    this.centers.setUsage(DynamicDrawUsage);
    this.colors.setUsage(DynamicDrawUsage);
    this.scales.setUsage(DynamicDrawUsage);
    this.texturePositions.setUsage(DynamicDrawUsage);
    this.alphas.setUsage(DynamicDrawUsage);
    this.geometry.setAttribute("instancedTileCenter", this.centers);
    this.geometry.setAttribute("instancedTileColor", this.colors);
    this.geometry.setAttribute("instancedTileScale", this.scales);
    this.geometry.setAttribute("instancedTexturePosition", this.texturePositions);
    this.geometry.setAttribute("instancedAlpha", this.alphas);
  }

  private instances = new Map<string, BatchInstance>();

  // getInstance(layer: number, pos: Vector2) {
  getBatchInstance(tile: Tile) {
    const pos = tile.pos;
    const layer = tile instanceof Cell ? 1 : 0;
    const layerOffset = (layer * this.maxTiles) / 2;
    const positionOffset = pos.y * this.world.width + pos.x;
    const index = layerOffset + positionOffset;
    if (!Number.isInteger(index)) {
      throw new Error("index " + index + " is not integer!");
    }
    const key = String(index);
    if (!this.instances.has(key)) {
      this.instances.set(key, new BatchInstance(this, index));
    }
    const instance = this.instances.get(key)!;
    instance.checkout(tile);
    return instance;
  }

  endFrame() {
    this.centers.needsUpdate = true;
    this.colors.needsUpdate = true;
    this.scales.needsUpdate = true;
    this.texturePositions.needsUpdate = true;
    this.alphas.needsUpdate = true;
  }
}

const BLACK = new Color(0, 0, 0);
const ZERO = new Vector3(0, 0, 0);
export class BatchInstance {
  public readonly batcher: TileBatcher;

  public readonly index: number;

  private static numInUse = 0;

  private owner?: object;

  constructor(batcher: TileBatcher, index: number) {
    this.batcher = batcher;
    this.index = index;
  }

  checkout(owner: object) {
    if (this.owner != null) {
      // throw new Error("Checking out instance that's already in use!" + this.index);
      console.warn("Checking out instance that's already in use!", this.index, owner);
    }
    this.owner = owner;
    BatchInstance.numInUse++;
  }

  commitColor(color: Color) {
    if (!this.owner) {
      throw new Error("freed tileBatcher still in use!");
    }
    this.batcher.colors.setXYZ(this.index, color.r, color.g, color.b);
  }

  commitCenter(x: number, y: number, z: number) {
    if (!this.owner) {
      throw new Error("freed tileBatcher still in use!");
    }
    this.batcher.centers.setXYZ(this.index, x, y, z);
  }

  commitScale(scale: Vector3) {
    if (!this.owner) {
      throw new Error("freed tileBatcher still in use!");
    }
    this.batcher.scales.setXYZ(this.index, scale.x, scale.y, scale.z);
  }

  commitTexturePosition(pos: Vector2) {
    this.batcher.texturePositions.setXY(this.index, pos.x, pos.y);
  }

  commitAlpha(alpha: number) {
    this.batcher.alphas.setX(this.index, alpha);
  }

  destroy() {
    this.commitColor(BLACK);
    this.commitScale(ZERO);
    this.owner = undefined;
    BatchInstance.numInUse--;
  }
}

export default TileBatcher;