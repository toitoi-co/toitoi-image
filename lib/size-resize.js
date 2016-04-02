'use strict';

/* This is a fit-resize. */

module.exports = function(currentSize, targetSize, options = {}) {
	let resizeOperation;

	if (targetSize.width == null && targetSize.height == null) {
		throw new Error("Must specify either a width or a height.")
	} else if (targetSize.width == null) {
		resizeOperation = {
			operation: "resize",
			height: targetSize.height
		};
	} else if (targetSize.height == null) {
		resizeOperation = {
			operation: "resize",
			width: targetSize.width
		};
	} else {
		let imageRatio = currentSize.height / currentSize.width;
		let targetRatio = targetSize.height / targetSize.width;

		if (imageRatio < targetRatio) {
			resizeOperation = {
				operation: "resize",
				width: targetSize.width
			};
		} else {
			resizeOperation = {
				operation: "resize",
				height: targetSize.height
			};
		}
	}

	let growsHorizontally = (resizeOperation.width != null && resizeOperation.width > currentSize.width);
	let growsVertically = (resizeOperation.height != null && resizeOperation.height > currentSize.height);

	if (!options.allowGrowth && (growsHorizontally || growsHorizontally)) {
		/* Leave the image unchanged. */
		return [];
	} else {
		return [
			resizeOperation
		];
	}
}
