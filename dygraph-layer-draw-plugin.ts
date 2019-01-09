
/*
*  Plugin for drawing shapes (close and open), line, text and badge (text with background) on dygraph canvas
*
*  How to add the plugin:
*  	1. add the file to your  project
*   2. update dygraph property  with the plug in  plugins: [DygraphLayerDrawPlugin],
*  How to use the plugin:
*  	1. There are 4 class that you can use:
*  		a. DygraphClosedPolygon  - close fill polygon  (
*  		b. DygraphOpenPolygon - open line
*  		c. DygraphText - simple text
*  		d. DygraphBadge - text with background and border
*  	2. The plug in enable you to draw custom shape in 2 layers
*  		a. Below dygraph lines - meaning first your shapes will first be drawn, and then the lines will be drawn (dygraph lines will cover the shapes)
*  		b. On to dygraph lines - meaning the shapes will be drawn after the dygraph lines were drawn ( the shapes will cover dygraph lines)
*  	3. To draw custom shapes you need to access
*  			this.dygraph.cascadeEvents_(  )   function
*
* 		create an array of custom shapes
* 			let shapesDraw = new Array<DygraphCustomShape>();
* 			shapesDraw.push(new DygraphSlaLineAndBadge( .... )
*
*  		to draw under dygraph lines layer call
*  			this.dygraph.cascadeEvents_('updateLayers',{baseLayer: shapesDraw});
*  		before you add the data to dygraph
*  			this.dygraph.updateOptions(chartdata);
*
*  		to draw on top dygraph lines
*  			this.dygraph.cascadeEvents_('updateLayers',{drawTopLayer: shapesDraw});
*  		after you send to dygraph the data
*
* 		to clean a layer just set empty array
* 			this.dygraph.cascadeEvents_('updateLayers',{drawTopLayer: []});
*
* */


export class Point {
	x:number;
	y:number;

	constructor(x: number, y: number){
		this.x = x;
		this.y = y;
	}
}

export abstract class DygraphCustomShape{
	protected polygon: Array<Point>;
	protected color: string;

	public constructor (polygon: Array<Point>, color: string){
		this.polygon = polygon;
		this.color = color;
	}

	public draw (dygraph: any, ctx:any) {

		let data = this.polygon;
		ctx.beginPath();

		for (let i=0 ; i< data.length ; ++i){
			let point = data[i];
			let toDomXCoord  = dygraph.toDomXCoord(point.x);
			let toDomYCoord  = dygraph.toDomYCoord(point.y);
			if(i === 0){
				ctx.moveTo(toDomXCoord, toDomYCoord);
				continue;
			}
			ctx.lineTo(toDomXCoord, toDomYCoord);
		}
	}
};

// Filled shape
export class DygraphClosedPolygon extends DygraphCustomShape {

	public constructor (polygon: Array<Point>, color: string){
		super(polygon, color);
	}

	public draw (dygraph: any, ctx:any){
		let oldColor;

		if(this.color){
			oldColor = ctx.fillStyle;
			ctx.fillStyle= this.color;
		}

		super.draw(dygraph, ctx);
		ctx.fill();

		if(this.color){
			ctx.fillStyle= oldColor;
		}
	}
};

export class DygraphOpenPolygon extends DygraphCustomShape {
	private lineDash: Array<number>;

	public constructor (polygon: Array<Point>, color: string, lineDash?: Array<number>){
		super(polygon, color);
		this.lineDash = lineDash;
	}

	public draw (dygraph: any, ctx:any){
		let oldLineDash;
		let oldStrokeStyle;
		if(this.lineDash){
			oldLineDash = ctx.getLineDash();
			ctx.setLineDash(this.lineDash);
		}

		if(this.color){
			oldStrokeStyle = ctx.strokeStyle;
			ctx.strokeStyle= this.color;
		}

		super.draw(dygraph, ctx);
		ctx.stroke();

		if (this.lineDash) {
			ctx.setLineDash(oldLineDash);
		}
		if(this.color) {
			ctx.strokeStyle = oldStrokeStyle;
		}
	}
};

export class DygraphText extends DygraphCustomShape {
	private text: string;
	private font: string;

	public constructor (polygon: Array<Point>, color: string, text: string, font?:string){
		super(polygon, color);
		this.text = text;
		this.font = font;
	}

	public draw (dygraph: any, ctx:any){
		let oldFont;
		let oldFillStyle;
		if(this.font){
			oldFont	= ctx.font;
			ctx.font = this.font;
		}

		if(this.color){
			oldFillStyle = ctx.fillStyle;
			ctx.fillStyle= this.color;
		}

		ctx.fillText(this.text, dygraph.toDomXCoord(this.polygon[0].x), dygraph.toDomYCoord(this.polygon[0].y));


		if(this.font){
			ctx.font = oldFont;
		}
		if(this.color){
			ctx.fillStyle= oldFillStyle;
		}

	}
}

// new DygraphBadge({x:25, toDomXCoord:false, y:10, toDomYCoord: true, position:'bl'|'tl'},, 'Meir', '14px MetricWeb-Regular', 9, '#ffffff',  2, '#AAAAAA', 1,  '#ffffff');
export class DygraphBadge extends DygraphCustomShape {

	public constructor (
						private cord:{x: number, toDomXCoord: boolean, y: number, toDomYCoord: boolean, position:string},
						private text: string,
						private textFont: string,
						private textHeight: number,
						private textColor: string,
						private padding: number,
						private bgColor: string,
						private borderWidth: number,
						private borderColor: string,

	){
		super(null, null);
	}

	public draw (dygraph: any, ctx:any){

		// Save config
		let oldFont = ctx.font;
		let oldFillStyle = ctx.fillStyle;

		// Set Text font + size
		ctx.font = this.textFont;
		let textWidth = Math.ceil(ctx.measureText(this.text).width);
		let bgWidth =  textWidth + this.padding * 2;
		let bgHeight = this.textHeight + this.padding * 2;

		// X&Y values
		let xCord = this.cord.x;
		if(this.cord.toDomXCoord){
			xCord = dygraph.toDomXCoord(xCord);
		}
		let yCord = this.cord.y;
		if(this.cord.toDomYCoord){
			yCord = dygraph.toDomYCoord(yCord);
		}
		// Change position of y (bottom or top)
		if(this.cord.position.toLowerCase() === 'bl'){
			yCord -= (this.borderWidth*2 + bgHeight);
		}

		// Border
		ctx.fillStyle = this.borderColor;
		ctx.fillRect(xCord,  yCord , (this.borderWidth*2 + bgWidth), (bgHeight + this.borderWidth*2));
		//
		// Background
		ctx.fillStyle = this.bgColor;
		ctx.fillRect(xCord + this.borderWidth , yCord + this.borderWidth, bgWidth, bgHeight);

		// Text
		ctx.fillStyle = this.textColor;
		ctx.font = this.textFont;
		ctx.fillText(this.text, xCord + this.borderWidth + this.padding, yCord + this.borderWidth + this.padding + this.textHeight);

		// Restore
		ctx.font = oldFont;
		ctx.fillStyle = oldFillStyle;
	}
}


export class DygraphLayerDrawPlugin {
	private imageData: any;
	private baseLayer: Array<DygraphCustomShape> =[];
	private topLayer:Array<DygraphCustomShape> = [];

	constructor(){

	}

	public toString (){
		return 'DygraphLayerDrawPlugin';
	}

	public activate(dygraph, registerer){
		console.log('activate', dygraph);

		return {

			// Dygraph events
			//select: this.select,
			//deselect: this.deselect,
			//predraw: this.predraw,
			//clearChart: this.clearChart,
			//click: this.click,
			//dblclick: this.dblclick,
			//pointClick: this.pointClick,
			//layout: this.layout,
			//dataDidUpdate: this.dataDidUpdate,
			//dataWillUpdate: this.dataWillUpdate,
			willDrawChart: this.willDrawChart,
			didDrawChart: this.didDrawChart,

			// Custom events
			updateLayers: this.updateLayers,
			drawTopLayer: this.drawTopLayer
		};
	}

	public willDrawChart(e){
		// console.log('willDrawChart',e);
		let dygraph = e.dygraph;
		let ctx = dygraph.hidden_ctx_;
		this.drawShapes(dygraph, ctx, this.baseLayer);

	}

	public didDrawChart(e){
		// console.log('didDrawChart',e);
		let dygraph = e.dygraph;
		let ctx = dygraph.hidden_ctx_;
		if(ctx.canvas.width !== 0 && ctx.canvas.height !== 0){
			this.imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		} else {
			this.imageData =  null;
			//console.log(`width=${ctx.canvas.width}, height=${ctx.canvas.height} `);
		}



		if(this.topLayer.length){
			this.drawShapes(dygraph, ctx, this.topLayer);
		}


	}


	// {
	//		baseLayer: Array<DygraphCustomShapes>
	//		topLayer: Array<DygraphCustomShapes>
	// }
	public updateLayers(e){
		// console.log('updateLayers',e);
		if(e.baseLayer){
			this.baseLayer = e.baseLayer;
		}
		if(e.topLayer){
			this.topLayer = e.topLayer;
		}
	}

	public drawTopLayer(e){
		// console.log('drawTopLayer',e);
		let dygraph = e.dygraph;
		let ctx = dygraph.hidden_ctx_;

		this.topLayer = e.topLayer;

		if(this.imageData && this.imageData.height){
			ctx.putImageData(this.imageData, 0, 0);
		}
		this.drawShapes(dygraph, ctx, this.topLayer);

	}



	private drawShapes(dygraph: any, ctx:any,  shapes: Array<DygraphCustomShape>){
		for (let shape of shapes){
			shape.draw(dygraph, ctx);
		}
	}



}