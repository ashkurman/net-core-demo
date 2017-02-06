export default class MathTools {
	/**
	 * Using formula  'V = 4/3 pi r^3' calculate sphere radius 'r' given it's volume 'V'
	 * @param volume Volume of a sphere
	 */
	public static calculateSphereRadiusFromVolume(volume: number): number {
		if (volume <= 0) return 0;
		return Math.pow( (volume*3)/(4*Math.PI), 1/3 );
	}

	/**
	 * Using formula  ' A = pi r r' calculate circle radius 'r' given it's area 'A'
	 * @param area Area of a circle.
	 */
	public static calculateCircleRadiusFromArea(area: number): number {
		if (area <= 0) return 0;
		return Math.sqrt(area / Math.PI);
	}
}