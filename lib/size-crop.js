'use strict';

/* This is actually a fill-resize, not a 'crop'. But that's what the original code calls it... */

const sizeResize = require("./size-resize");

module.exports = function(currentSize, targetSize, options = {}) {
	if (targetSize.width == null || targetSize.height == null) {
		/* If not all sizes are specified, there's no difference between a fill-resize and fit-resize. */
		return sizeResize(currentSize, targetSize, options);
	} else {
		let imageRatio = currentSize.height / currentSize.width;
		let targetRatio = targetSize.height / targetSize.width;
		let resizeOperation, resizeRatio;

		if (imageRatio < targetRatio) {
			resizeOperation = {
				operation: "resize",
				height: targetSize.height
			}

			resizeRatio = targetSize.height / currentSize.height;
		} else {
			resizeOperation = {
				operation: "resize",
				width: targetSize.width
			}

			resizeRatio = targetSize.width / currentSize.width;
		}

		let cropOperation = {
			operation: "crop",
			width: targetSize.width,
			height: targetSize.height,
			xOffset: (currentSize.width / 2 * resizeRatio) - (targetSize.width / 2),
			yOffset: (currentSize.height / 2 * resizeRatio) - (targetSize.height / 2)
		}

		let growsHorizontally = (resizeOperation.width != null && resizeOperation.width > currentSize.width);
		let growsVertically = (resizeOperation.height != null && resizeOperation.height > currentSize.height);

		if (!options.allowGrowth && (growsHorizontally || growsHorizontally)) {
			/* Only crop without growing the image first, and hope for the best. */
			return [
				cropOperation
			];
		} else {
			return [
				resizeOperation,
				cropOperation
			]
		}
	}
}
