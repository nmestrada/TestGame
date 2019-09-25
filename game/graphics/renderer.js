import React, { PureComponent } from "react";
import { Platform } from "react-native";
import ExpoGraphics from "expo-graphics-rnge";
import ExpoTHREE, { THREE } from "expo-three";
import EffectComposer  from "./effect-composer";
import RenderPass from "./passes/render-pass";
import _ from "lodash";

global.THREE = THREE;

THREE.suppressExpoWarnings();

class ThreeView extends PureComponent {

  onShouldReloadContext = () => {
    return Platform.OS === "android";
  };

  onContextCreate = async ({ gl, canvas, width, height, scale: pixelRatio }) => {
    this.props.camera.resize(width, height, pixelRatio);
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      pixelRatio,
      width,
      height,
    });
    this.renderer.setClearColor(0x020202, 1.0);
    this.gl = gl;
    this.composer = new EffectComposer(this.renderer);

    const passes = [
      new RenderPass(this.props.scene, this.props.camera),
      ...this.props.passes
    ];

    passes.forEach(p => this.composer.addPass(p))
    passes[passes.length-1].renderToScreen = true;
  };

  onResize = ({ width, height, scale: pixelRatio }) => {
    this.props.camera.resize(width, height, pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pixelRatio);
  };

  render() {
     if (this.composer && this.gl) {
      this.composer.render();
      this.gl.endFrameEXP();
    }
    return (
      <ExpoGraphics.View
        onContextCreate={this.onContextCreate}
        onResize={this.onResize}
        onShouldReloadContext={this.onShouldReloadContext}
        shouldIgnoreSafeGaurds={true}
        isShadowsEnabled={false}
      />
    );
  }
}

const renderHUD = (state, screen) => {
  if (!state.hud) return null;

  const hud = state.hud;

  if (typeof hud.renderer === "object")
    return <hud.renderer.type key={"hud"} {...hud} screen={screen} />;
  else if (typeof hud.renderer === "function")
    return <hud.renderer key={"hud"} {...hud} screen={screen} />;
};

const ThreeJSRenderer = (...passes) => (state, screen) => {
  return [
    <ThreeView
      passes={_.flatten(passes)}
      key={"three-view"}
      scene={state.scene}
      camera={state.camera}
    />,
    renderHUD(state, screen)
  ];
};

export default ThreeJSRenderer;