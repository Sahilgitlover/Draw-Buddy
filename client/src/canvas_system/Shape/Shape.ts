export abstract class Shape {
	getCopy: () => Shape = () => this; // not this, but copy
	prepare_for_render(ctx: CanvasRenderingContext2D) {}
	render_me_whole(ctx: CanvasRenderingContext2D) {}
}
