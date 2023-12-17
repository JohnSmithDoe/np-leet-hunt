## Allgemein

### How should this work

* Need a more specific game structure
  * Setup:
    * You distorted reality, so it's closing in on you (timer)
      * Everything is possible because it's not real, (no explanation needed :)
        * especially space travel, mystical creatures... 
    * You got robbed of something (Family, Toys, Emotions...) (5 Mission items)
      * From the Final boss
    * You set off in a spaceship towards the rescue mission
  * Actions:
    * Fly from Planet to Planet
    * Trigger Planet Events (Gain, Lose, Planet Dungeon)
      * Explore the Planet Dungeon (Goals?)
    * Trigger On Route Events (Gain, Lose, Spaceship boarding, Spaceship fight )
      * Explore the Spaceship Dungeon (Conquer Bridge, Destroy enough so the crew surrenders)
    * (Mini)Boss fight at the end of each sector (5 sectors)
  * You'll get a robo-pet that can evolve like paradroids


### So what's plan

### Milestone v0.1 - np-space-map ... Make it work 

* Let's go with no navigation first
  * Travel ui and auto travel
* Planet and en route events
  * Event ui and QA handler
  * On route should intercept visually (Enemy flies towards ship or something like this)
* Start and Exit Points
  * 5 Sectors with increasing size and difficulty
* Camera handling - since layer is broken in phaser :(
  * Here we need multiple cameras (tileimages, map, space eyes) 
    * it's the same for the ui layer
    * but the layer has a destroy problem for now and it seems is under heavy discussion... so better stay away for now

### Milestone v0.2 - np-pixel-dungeon ... get the basics right

* Finish tilemap stitching
* Dungeon generation
  * Start / Exit 
  * Junctions with different types (open, lockedBy (key-cards), secret)
    * key-cards must be reachable
    * good place to start to figure out a struct for this kind of relation
* FoV - Walls should be seen, occupied as well, but they should be used as sight blocker...
* Player
  * Fix move on path
* Mobs
  * Spawning, Distribution... 
  * Simple Behaviour - Wait until you see the player -> go attack


### TypeScript
* switch to strict i guess

### Overall
* hmm ui should be done as a scene ... this is kind of a layer
  * does this make all the strange scene components unnecessary!?
  * each scene has its own camera and game objects soc vs (camera container layer)
* do i want an own spaceship map??? could be nice for boarding on space fights, story telling...
* create mit addTo.. ist ungünstig -> scene soll add machen.... hmm auch nicht so gut
* scene transitions
* game state / start -> starmap -> dungeon || paradroid -> starmap -> exit -> end....
* ui
* move some nice stuff np-phaser -> generate starmap, dungeon,... external usage 

### Space map

* generator
* planets
* interactive / hit detection mayba...
* star eyes and others
* enemies
* exit
* entrance
* Events
* decide: fly on your own or just click next planet... tending to fire and forget

### Paradroid

* ai
* deco
* timing / intro -> select game -> play -> end -> return result
* clean up layout
*

### Pixel-Dungeon

* so much :D
* FoV should light up more walls, edge detection is not ready and causes some weird behaviour,
  * like seeing tiles on a diagonal but missing one.
  * Standing on an edge like a door. One step to the side
