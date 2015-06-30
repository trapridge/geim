##Three.js and Browserify Enviroment

This is a basic starting point for a project using Three.js and Browserify. It includes a central project graph called a poem, and a level manifest to load in multiple poem configurations. There is a components directory for reusable modules.

### Install

 * Git clone this repo.
 * In terminal go into the directory and run `npm install`
 * In terminal run `gulp` to start watching for changed files
 * Replace the credits with your own info, and put in your Google Analytics account.

### Poem

The main graph for your project is the `Poem` object, as in programing poem (or sketch, demo, code art, etc.) It's passed in to each component and is available globally for ease in debugging.

 * `poem.scene` - Three.js scene
 * `poem.camera` - Custom camera object
 * `poem.camera.object` - Three.js camera
 * `poem.clock` - Custom clock object
 * `poem.div` - div element that holds the canvas
 * `poem.ratio` - pixel ratio
 * `poem.on` - add event listener
 * `poem.off` - remove event listener
 * `poem.trigger` - trigger event listener
 
#### Poem events

 * update - dispatched on every requestAnimationFrame, the event holds timing info
 * resize - dispatched on window resize
 * destroy - dispatched when destroying the poem's level

Usage: `poem.on('update', callback);`

### Levels

Create multiple levels by creating level manifest files in the `/js/levels/` folder. These manifests add the reusable components in `/js/components/` or other folders.

#### Example level manifest:

	module.exports = {
		config : {
			//Add general poem configuration here if you want to make Poem.js configurable
		},
		objects : {
			sphere : {
				object: require("../components/Spheres"),
				properties: {
					count : 50,
					dispersion : 120,
					radius : 10
				} 
			},
			controls : {
				object: require("../components/CameraControls"),
			},
			grid : {
				object: require("../components/Grid"),
			},
			stats : {
				object: require("../components/Stats")
			}
		}
	}

So in this example the `poem` object will have `poem.sphere` as a property. For some pseudocode explaining what it looks like when the poem creates the sphere, it basically runs this:

	poem.sphere = new Spheres( poem, level.properties );

### Create a new level

 * Create a level manifest like the above
 * Add an entry to `/js/levels/index.js` where the key is the string you will use in the `LevelLoader`
 * Create some logic using the LevelLoader to actually load in the level

### Level Loader

To load a level using the level manifest:

	var LevelLoader = require('./LevelLoader');
	LevelLoader("demo");

Loading a new level will load the `levels/demo.js` file. It will then destroy the current poem if it exists, and initiate a new one. `LevelLoader` is set as a global variable for debugging purposes.

### Components

Components are accessible from the main `poem` object. You can also create a manager component which manually loads in other components as a different option. Keep an eye out for tight coupling of different components.


### To-do

 - [ ] Add some kind of URL router
 - [ ] The gulpfile is kind of a mess

Project copyright (c) 2014 Greg Tatum under The MIT License (MIT)
