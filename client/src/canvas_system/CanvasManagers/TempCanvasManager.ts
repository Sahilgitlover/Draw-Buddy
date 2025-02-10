import { temp_canvas, temp_ctx } from "../../main";
import { Shape } from "../Shape/Shape";

// only knows about temp_ctx
export default class TempCanvasManager {
	static init() {
		console.log("TempCanvasManager init");
	}

	static render_shape(Shape: Shape) {
		Shape.render_me_whole(temp_ctx);
		return this;
	}

	static clear_canvas_only_unrender() {
		temp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);
		return this;
	}
}
