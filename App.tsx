/**
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React, { useState, FunctionComponent, useEffect, useCallback } from "react";
 import { SafeAreaView, StatusBar, Button, View, Text, ViewProps, Image } from "react-native";
 import { EngineView, useEngine } from "@babylonjs/react-native";
 import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
 import { Camera } from "@babylonjs/core/Cameras/camera";
 import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
 import "@babylonjs/loaders/glTF";
 import { HemisphericLight, Mesh, MeshBuilder, GlowLayer, Engine, CubeTexture, StandardMaterial, Color3, DirectionalLight, Vector3, TransformNode, VolumetricLightScatteringPostProcess, Tools, Animation, Scalar, NodeMaterial, TextureBlock, Texture, Scene, WebXRSessionManager, WebXRTrackingState, AbstractMesh, Quaternion } from "@babylonjs/core";
 import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const EngineScreen: FunctionComponent<ViewProps> = (props: ViewProps) => {
  const defaultScale = 1;
  const engine = useEngine();
  const [camera, setCamera] = useState<Camera>();
  const [rootNode, setRootNode] = useState<TransformNode>();
  const [starfield, setStarfield] = useState<AbstractMesh>();
  const [scene, setScene] = useState<Scene>();
  const [xrSession, setXrSession] = useState<WebXRSessionManager>();
  const [scale, setScale] = useState<number>(defaultScale);
  const [trackingState, setTrackingState] = useState<WebXRTrackingState>();

  const switchAR = (arMode: boolean) : void => {
    let arAssets = ["__root__", "valkyrie_mesh"];
      let atmosphere = scene.getMeshByName("atmosphereSphere_mesh");
      let planet = scene.getMeshByName("planet_mesh");

      
      for(const each of scene.meshes){
        if(!arAssets.includes(each.name)){
          each.setEnabled(!arMode);
        }
      }

      atmosphere.setEnabled(false);
      planet.setEnabled(false);

      starfield?.setEnabled(!arMode);
      if(arMode){
        atmosphere.scaling = new Vector3(0.15, 0.15, 0.15);
        planet.scaling = new Vector3(0.15, 0.15, 0.15);
        atmosphere.position.x = 8;
        planet.position.x = 8;
        camera.alpha = 3.65;
        camera.beta = 1.52;
        camera.radius = 10.7;
    }
    else {
        atmosphere.scaling = new Vector3(1,1,1);
        planet.scaling = new Vector3(1,1,1);
        atmosphere.position.x = 0;
        planet.position.x = 0;
        camera.alpha = 3.73;
        camera.beta = 1.28;
        camera.radius = 3.5;
    }
  };

  useEffect(() => {
    if (engine) {
      const scene = new Scene(engine);
      setScene(scene);
      engine.setHardwareScalingLevel(3);

      console.disableYellowBox = true;

      var camera = new ArcRotateCamera("camera", 3.73, 1.28, 3.5, Vector3.Zero(), scene);
      camera.attachControl();
      setCamera(camera!);

      scene.skipPointerMovePicking = true;
      scene.pointerUpPredicate = ()=> false;
      scene.pointerDownPredicate = ()=> false;
      scene.pointerMovePredicate = ()=> false;
    
      const rootNode = new TransformNode('Root Container', scene);
      setRootNode(rootNode);

      // lighting
    const dirLight = new DirectionalLight("dirLight", new Vector3(0.47, 0.0, -0.86), scene);
    dirLight.diffuse = Color3.FromInts(255, 251, 199);
    dirLight.intensity = 3;


    var light = new HemisphericLight("light", new Vector3(0.47, 0.0, -0.86), scene);
    light.intensity = 0.5;

    // envirronment
    /*
    const envUri = resolveAssetSource(require('./assets/environment.env')).uri;
    var envCube = CubeTexture.CreateFromPrefilteredData(envUri, scene);
    envCube.name = "environment";
    envCube.gammaSpace = false;
    envCube.rotationY = 1.977;
    scene.environmentTexture = envCube;
    */
    // glow
    const glowLayer = new GlowLayer("glowLayer", scene);
    glowLayer.intensity = 0.5;

      const sceneGLBUri = resolveAssetSource(require('./assets/nativeStaticScene.glb')).uri;
      SceneLoader.AppendAsync("", sceneGLBUri, scene).then(() => {
        const starsGLBUri = resolveAssetSource(require('./assets/starsGeo.glb')).uri;
        SceneLoader.AppendAsync("", starsGLBUri, scene).then(() => {
          const starfield = scene.getMeshByName("starsGeo");
          starfield.scaling = new Vector3(4500, 4500, 4500);
          setStarfield(starfield);
          const starsShader = require('./assets/starfieldShader.json');
          const starsPanoramaUri = resolveAssetSource(require('./assets/starfield_panorama_texture.jpg')).uri;

          var starsShaderMaterial = new NodeMaterial("starsShader", scene);
          starsShaderMaterial.loadFromSerialization(starsShader, "");
          starsShaderMaterial.build();

          const starfieldTexture = new Texture(starsPanoramaUri, scene, false, false);
          if(starsShaderMaterial.getBlockByName("emissiveTex")) {
              const starfieldTextureBlock = starsShaderMaterial.getBlockByName("emissiveTex");
              (starfieldTextureBlock as TextureBlock).texture = starfieldTexture;
          }
          starfield.material = starsShaderMaterial;
        });

        let asteroids = ["asteroidModule2_i30", "asteroidGroup187", "asteroidModule4_i82", "asteroidGroup106", "asteroidGroup84", "asteroidGroup74", "asteroidGroup73", "asteroidGroup65", "asteroidGroup87", "asteroidGroup61", "asteroidGroup104", "asteroidGroup105", "asteroidGroup127", "asteroidGroup141", "asteroidGroup135", "asteroidGroup129", "asteroidGroup126", "asteroidGroup100", "asteroidGroup63", "asteroidGroup81", "asteroidGroup72", "asteroidGroup102", "asteroidGroup26", "asteroidGroup235", "asteroidGroup78", "asteroidGroup88", "asteroidGroup3", "asteroidGroup7", "asteroidModule3_i148", "asteroidModule3_i117", "asteroidModule2_i107"];
    
        const frameRate = 10;
        let rotationSpeedMin = 200;
        let rotationSpeedMax = 700

        for (let each = 0; each < asteroids.length; each++){
            let asteroid = scene.getMeshByName(asteroids[each])
            if(!asteroid){
                asteroid = scene.getTransformNodeByName(asteroids[each])
            }

            asteroid.rotationQuaternion = null;

            let parentTransform = new TransformNode("parent", scene);
            parentTransform.parent = asteroid.parent;
            parentTransform.position.copyFrom(asteroid.position);
            asteroid.position.setAll(0);
            asteroid.parent = parentTransform;
            parentTransform.rotation = new Vector3(
                Scalar.RandomRange(-Math.PI, Math.PI),
                Scalar.RandomRange(-Math.PI, Math.PI),
                Scalar.RandomRange(-Math.PI, Math.PI)
            );

            let rotationSpeed = Math.floor(Math.random() * (rotationSpeedMax - rotationSpeedMin + 1)) + rotationSpeedMin;

            const randomRotation = new Animation("rotation", "rotation.x", frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
            const keys = [];
            keys.push({
                frame: 0,
                value: Tools.ToRadians(0),
            });
            keys.push({
                frame: rotationSpeed,
                value: Tools.ToRadians(360),
            });
            randomRotation.setKeys(keys);
            asteroid.animations.push(randomRotation);
            scene.beginAnimation(asteroid, 0, rotationSpeed, true);
          
            
            for (each in scene.transformNodes){
              let randomScale = (Math.random() * 0.4) + 0.9;
              randomScale *= randomScale;
              //randomScale *= randomScale;
              scene.transformNodes[each].scaling = new Vector3(randomScale, randomScale, randomScale);
            }
          }
          scene.getMeshByName("__root__").parent = rootNode;
          scene.getTransformNodeByName("asteroidGroup104").scaling = new Vector3(1.3, 1.3, 1.3);
          scene.getTransformNodeByName("asteroidGroup104").parent.scaling = new Vector3(1.22, 1.22, 1.22);
          scene.getTransformNodeByName("asteroidGroup3").scaling = new Vector3(1, 1, 1);
          scene.getTransformNodeByName("asteroidGroup3").parent.scaling = new Vector3(1, 1, 1);
          scene.getTransformNodeByName("asteroidGroup105").scaling = new Vector3(1, 1, 1);
          scene.getTransformNodeByName("asteroidGroup105").parent.scaling = new Vector3(1.25, 1.25, 1.25);
          scene.getTransformNodeByName("asteroidGroup100").scaling = new Vector3(1, 1, 1);
          scene.getTransformNodeByName("asteroidGroup100").parent.scaling = new Vector3(1.25, 1.25, 1.25);
          scene.getTransformNodeByName("asteroidGroup102").scaling = new Vector3(1.52, 1.52, 1.52);
          scene.getTransformNodeByName("asteroidGroup102").parent.scaling = new Vector3(1.29, 1.29, 1.29);
          scene.getTransformNodeByName("asteroidGroup87").scaling = new Vector3(1.03, 1.03, 1.03);
          scene.getTransformNodeByName("asteroidGroup87").parent.scaling = new Vector3(1.54, 1.54, 1.54);
          scene.getTransformNodeByName("asteroidGroup84").scaling = new Vector3(1.28, 1.28, 1.28);
          scene.getTransformNodeByName("asteroidGroup84").parent.scaling = new Vector3(1.47, 1.47, 1.47);
          scene.getMeshByName("asteroidModule2_i30").parent.scaling = new Vector3(1.13, 1.13, 1.13);
          scene.getMeshByName("asteroidModule1_i13").parent.scaling = new Vector3(1, 1, 1);
          
          camera.checkCollisions = false;
          camera.collisionRadius = new Vector3(3.5, 3.5, 3.5);
          camera.minZ = 0.01;

          let atmosphere = scene.getMeshByName("atmosphereSphere_mesh");
          let oplanet = scene.getMeshByName("planet_mesh");
          atmosphere.setEnabled(false);
          oplanet.setEnabled(false);

          // lasers
          var mat = new StandardMaterial("laserMat", scene);
          mat.disableLighting = true;
          mat.emissiveColor = Color3.Red();
          mat.alphaMode = Engine.ALPHA_ADD;
          mat.alpha = 0.33;
          scene.getMeshByName("laser1").material = mat;
          scene.getMeshByName("laser1").scaling = new Vector3(3, 1, 3);
          scene.getMeshByName("laser2").scaling = new Vector3(3, 1, 3);
          scene.getMeshByName("laser3").scaling = new Vector3(3, 1, 3);
          scene.getMeshByName("laser2").material = mat;
          scene.getMeshByName("laser3").material = mat;

          const sunUri = resolveAssetSource(require('./assets/sun.png')).uri;
          const planetUri = resolveAssetSource(require('./assets/planetImage.png')).uri;

          // volumetric sun
          var sun = new VolumetricLightScatteringPostProcess('volumetric', 1.0, camera, undefined, 100, Texture.BILINEAR_SAMPLINGMODE, scene.getEngine(), false);
          sun.mesh.material.diffuseTexture = new Texture(sunUri, scene, true, false, Texture.BILINEAR_SAMPLINGMODE);
          sun.mesh.material.diffuseTexture.hasAlpha = true;
          sun.mesh.scaling = new Vector3(50, 50, 50);
          glowLayer.addExcludedMesh(sun.mesh);

          // planet                
          var planet = MeshBuilder.CreatePlane("planetPlane", { size: 100 }, scene);
          planet.position.x = 200;
          planet.billboardMode = Mesh.BILLBOARDMODE_ALL | Mesh.BILLBOARDMODE_USE_POSITION;
          
          var planetMaterial = new StandardMaterial("", scene);
          planetMaterial.backFaceCulling = false;
          planetMaterial.disableLighting = true;
          
          planetMaterial.diffuseTexture = new Texture(planetUri, scene, true, false, Texture.BILINEAR_SAMPLINGMODE);
          planetMaterial.emissiveColor = new Color3(1, 1, 1);
          planetMaterial.alphaMode = Engine.ALPHA_COMBINE;
          planetMaterial.diffuseTexture.hasAlpha = true;
          planetMaterial.useAlphaFromDiffuseTexture = true;
          glowLayer.addExcludedMesh(planet);
          planet.material = planetMaterial;

          scene.onBeforeRenderObservable.add(()=> {
            sun.mesh.position.copyFrom(scene.activeCamera.position);
            sun.mesh.position.x -= 0.47 * 300;
            sun.mesh.position.y += 0.00 * 300;
            sun.mesh.position.z += 0.86 * 300;

            var msh = scene.getMeshByName("valkyrie_mesh");
            if (msh && !msh.parent)
            {
              msh.rotate(Vector3.Up(), 0.01);
            }
        });
      });
    }
  }, [engine,xrSession]);


  const trackingStateToString = (trackingState: WebXRTrackingState | undefined) : string => {
    return trackingState === '';//undefined ? '' : WebXRTrackingState[trackingState];
  };

  const onToggleXr = useCallback(() => {
    (async () => {
      if (xrSession) {
        await xrSession.exitXRAsync();
        rootNode.position.set(0,0,0);
        scene.getMeshByName("valkyrie_mesh")?.scaling.scaleInPlace(0.5);
      } else {
        if (rootNode !== undefined && scene !== undefined) {
          const xr = await scene.createDefaultXRExperienceAsync({ disableDefaultUI: true, disableTeleportation: true })
          const session = await xr.baseExperience.enterXRAsync('immersive-ar', 'unbounded', xr.renderTarget);
          setXrSession(session);
          session.onXRSessionEnded.add(() => {
            setXrSession(undefined);
            setTrackingState(undefined);
            switchAR(false);
          })
  
          setTrackingState(xr.baseExperience.camera.trackingState);
          xr.baseExperience.camera.onTrackingStateChanged.add((newTrackingState) => {
            setTrackingState(newTrackingState);
          });

          switchAR(true);

          var msh = scene.getMeshByName("valkyrie_mesh");
          if (msh) {
            msh.parent = null;
            msh.rotation = new Vector3(0, Math.PI, 0);
            msh.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI, 0);
            msh.scaling.scaleInPlace(2);
            msh.position = new Vector3(0,-0.1,0.5);
          }

          rootNode.position.set(0., 0, 0);
          
          rootNode.rotate(Vector3.Up(), 3.14159);
        }
      }
    })();
  }, [rootNode, scene, xrSession, starfield, camera]);

  return (
    <>
      <View style={props.style}>
      <Button title={ xrSession ? 'Stop XR' : 'Start XR'} onPress={onToggleXr} />
        <View style={{ flex: 1 }}>
          <EngineView camera={camera} displayFrameRate={false} />
          <Text style={{color: 'yellow',  position: 'absolute', margin: 3}}>{trackingStateToString(trackingState)}</Text>
        </View>
      </View>
    </>
  );

  useEffect(() => {
    if (rootNode) {
      rootNode.scaling = new Vector3(scale, scale, scale);
    }
  }, [rootNode, scale]);

};

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <EngineScreen style={{ flex: 1 }} />
      </SafeAreaView>
    </>
  );
};

export default App;
