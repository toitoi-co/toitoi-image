'use strict';

const Promise = require("bluebird");
const express = require("express");
const expressPromiseRouter = require("express-promise-router");
const multer = require("multer");
const gm = require("gm");
const mime = require("mime");
const concatStream = require("concat-stream");
const path = require("path");
const rfr = require("rfr");

const sizeResize = rfr("lib/size-resize");
const sizeCrop = rfr("lib/size-crop");

Promise.promisifyAll(gm.prototype);

const config = require("./config.json");

// FIXME: Remove old uploads? Periodically, so that they are available for debugging purposes for a while?

function applyOperations(image, operations) {
	operations.forEach((operation) => {
		console.log(operation);
		if (operation.operation === "resize") {
			image = image.resize(operation.width, operation.height);
		} else if (operation.operation === "crop") {
			image = image.crop(operation.width, operation.height, Math.floor(operation.xOffset), Math.floor(operation.yOffset));
		} else {
			throw new Error(`Unrecognized operation: ${operation.operation}`)
		}
	})

	return image;
}

function authMiddleware(req, res, next) {
	if (req.headers["x-connection-key"] === config.connectionKey) {
		next();
	} else {
		res.status(401).send("Invalid API key specified.")
	}
}

function requireImage(req, res, next) {
	if (req.file == null) {
		next(new Error("No image provided."));
	} else {
		next();
	}
}

function parseFormValue(value) {
	if (value === "") {
		return undefined;
	} else if (/^[0-9]+$/.test(value)) {
		return parseInt(value);
	} else {
		return value;
	}
}

function getTargetSize(body) {
	return {
		width: parseFormValue(body.width),
		height: parseFormValue(body.height)
	}
}

function imageOperation(type) {
	let sizeMethod;

	if (type === "resize") {
		sizeMethod = sizeResize;
	} else if (type === "crop") {
		sizeMethod = sizeCrop;
	} else {
		throw new Error("No such image operation.");
	}

	return function(req, res) {
		return Promise.try(() => {
			return gm(req.file.path).sizeAsync();
		}).then((size) => {
			let operations = sizeMethod(size, getTargetSize(req.body));
			let image = applyOperations(gm(req.file.path), operations);

			res.set("content-type", mime.lookup(req.file.originalname));

			return new Promise((resolve, reject) => {
				/* Because of `gm`s broken error handling...
				 * FIXME: File a bug on `gm` regarding errors ending up on stderr. */
				image.stream((err, stdout, stderr) => {
					if (err != null) {
						reject(err);
					} else {
						stderr.pipe(concatStream((result) => {
							let error = result.toString();

							if (error.length > 0) {
								reject(new Error(`gm error: ${error}`));
							} else {
								stdout.pipe(res).on("finish", () => {
									resolve();
								});
							}
						}));
					}
				});
			});
		});
	}
}

let app = express();

app.use(authMiddleware);

let router = expressPromiseRouter();

router.get("/", function(req, res) {
	/* FIXME: In development environments only! */
	res.sendFile(path.join(__dirname, "development/index.html"))
});

router.post("/resize",
	multer({dest: "uploads/"}).single("image"),
	requireImage,
	imageOperation("resize")
);

router.post("/crop",
	multer({dest: "uploads/"}).single("image"),
	requireImage,
	imageOperation("crop")
);

app.use(router);

app.use(function(err, req, res, next) {
	console.log(err.stack);
	res.status(500).send("Something went wrong.")
})

app.listen(6001);
