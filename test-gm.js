const gm = require("gm");

gm("image.png").resize(400, undefined).write("image_resized.png", (err, result) => {
	console.log(err);
})
