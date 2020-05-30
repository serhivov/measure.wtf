import { Point } from "./Editor";

class ViewingTransformer {
  private vtm: SVGMatrix;

  /**
   * Initialize the transformer.
   * @param {Element} svg - An svg element from which matrices can be created.
   */
  constructor(private svg: SVGSVGElement) {
    this.svg =
      svg || document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // This is the viewing transformation matrix, which starts at identity.
    this.vtm = this.createSVGMatrix();
  }

  /**
   * Helper method to create a new SVGMatrix instance.
   */
  createSVGMatrix() {
    return this.svg.createSVGMatrix();
  }

  /**
   * Scale the vtm.
   * @param {Number} xFactor - The amount to scale in the x direction.
   * @param {Number} yFactor - The amount to scale in the y direction.
   * @param {Point} origin - The origin point at which the scale should be centered.
   */
  scale(xFactor: number, yFactor: number, origin: Point) {
    // Order is important -- read this from the bottom to the top.
    // 1) Post multiply onto the current matrix.
    // 2) Translate such that the origin is at (0, 0).
    // 3) Scale by the provided factors at the origin.
    // 4) Put the origin back where it was.
    this.vtm = this.createSVGMatrix()
      .translate(origin.x, origin.y)
      .scale(xFactor, yFactor)
      .translate(-origin.x, -origin.y)
      .multiply(this.vtm);

    return this.vtm;
  }
}

export default ViewingTransformer;
