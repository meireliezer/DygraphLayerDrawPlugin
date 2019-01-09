
Plugin for drawing shapes (close and open), line, text and badge (text with background) on dygraph canvas

 How to add the plugin:
  1. add the file to your  project
  2. update dygraph property  with the plug in  plugins: [DygraphLayerDrawPlugin]
  
How to use the plugin:
  1. There are 4 class that you can use:
  
    a. DygraphClosedPolygon  - close fill polygon
  
    b. DygraphOpenPolygon - open line
  
    c. DygraphText - simple text
  
    d. DygraphBadge - text with background and border
  
 2. The plug in enable you to draw custom shape in 2 layers:
 
    a. Below dygraph lines - meaning first your shapes will first be drawn, and then the lines will be drawn (dygraph lines will cover the shapes)
  
    b. On top dygraph lines - meaning the shapes will be drawn after the dygraph lines were drawn ( the shapes will cover dygraph lines)
  
  3. To draw custom shapes you need to access function
  
      this.dygraph.cascadeEvents_(  )   
      
    create an array of custom shapes
 			  let shapesDraw = new Array<DygraphCustomShape>();
 			  shapesDraw.push(new DygraphSlaLineAndBadge( .... )
      
    to draw under dygraph lines layer call
  		  this.dygraph.cascadeEvents_('updateLayers',{baseLayer: shapesDraw});
  	before you add the data to dygraph
  			this.dygraph.updateOptions(chartdata);

    to draw on top dygraph lines
  			this.dygraph.cascadeEvents_('updateLayers',{drawTopLayer: shapesDraw});
  		after you send to dygraph the data

 	 to clean a layer just set empty array
 			this.dygraph.cascadeEvents_('updateLayers',{drawTopLayer: []});

