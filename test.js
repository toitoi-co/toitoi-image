'use strict';

const resize = require("./lib/size-resize");
const crop = require("./lib/size-crop");

let sizes = [
	{
		width: 5,
		height: 10
	}, {
		width: 5,
		height: 5
	}, {
		width: 10,
		height: 10
	}, {
		width: 10,
		height: 5
	}, {
		width: 20,
		height: 5
	}, {
		width: 2.5,
		height: 5
	}
]

let targetSizes = [
	{
		width: 5
	}, {
		height: 5
	}, {
		width: 5,
		height: 5
	}, {
		width: 10,
		height: 5
	}, {
		width: 10,
		height: 2.5
	}
]

function formatSize(size) {
	let width = (size.width != null) ? size.width : "?";
	let height = (size.height != null) ? size.height : "?";

	return `${width}x${height}`;
}

function formatOperation(operation) {
	return Object.keys(operation).map((key) => {
		return `${key}=${operation[key]}`;
	}).join(" ");
}

function formatOperations(operations) {
	return operations
		.map(formatOperation)
		.join(" && ");
}

targetSizes.forEach((targetSize) => {
	sizes.forEach((size) => {
		["crop", "resize"].forEach((type) => {
			let operations;

			if (type === "crop") {
				operations = crop(size, targetSize);
			} else if (type === "resize") {
				operations = resize(size, targetSize);
			} else {
				operations = [];
			}

			console.log(`${formatSize(size)} => ${formatSize(targetSize)} (${type}) // ${formatOperations(operations)}`);
		});
	})
})
