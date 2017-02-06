/// <reference path="../node_modules/@types/mocha/index.d.ts"/>
/// <reference path="../node_modules/@types/chai/index.d.ts"/>

import MathTools from 'MathTools';

describe('MathTools', function() {
	describe('calculateSphereRadiusFromVolume()', function() {
		it('calculated radius should be convertible back to original volume', function() {
			const initialVolume = 10;
			const radius = MathTools.calculateSphereRadiusFromVolume( initialVolume );
			const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
			chai.assert.equal( initialVolume, volume );
		});
	});
	describe('calculateCircleRadiusFromArea()', function() {
		it('calculated radius should be convertible back to original area', function() {
			const initialArea = 10;
			const radius = MathTools.calculateCircleRadiusFromArea( initialArea );
			const area = Math.PI * Math.pow(radius, 2);
			chai.assert.equal( initialArea, area );
		});
	});
});