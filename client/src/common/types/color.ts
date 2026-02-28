export default class Color
{
    static readonly WHITE: Color = new Color(255, 255, 255);
    static readonly BLACK: Color = new Color(0, 0, 0);
    static readonly RED: Color = new Color(255, 0, 0);
    static readonly GREEN: Color = new Color(0, 255, 0);
    static readonly BLUE: Color = new Color(0, 0, 255);
    static readonly YELLOW: Color = new Color(255, 255, 0);

    constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
        public readonly a: number = 255
    )
    {
        assertByte(r);
        assertByte(g);
        assertByte(b);
        assertByte(a);
    }

    /**
     * Returns the CSS string for this color.
     */
    get cssString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
    }
}

/**
 * Throws if the given number is not an integer in the range 0-255.
 */
function assertByte(n: number)
{
    if (n >= 0 && n < 256 && Number.isInteger(n)) {
        return;
    }

    throw new Error(n + " is not a byte.");
}