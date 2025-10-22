uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uTexture1Size;
uniform vec2 uTexture2Size;
varying vec2 vUv;

#include ../includes/getCoverUV.glsl
#include ../includes/getDistortedUV.glsl
#include ../includes/getLensDistortion.glsl
#include ../includes/getBubbleMask.glsl
#include ../includes/mixWithDistortion.glsl

void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = vUv * uResolution;

    vec2 uv1 = getCoverUV(vUv, uTexture1Size);
    vec2 uv2 = getCoverUV(vUv, uTexture2Size);

    float maxRadius = length(uResolution) * 1.5;
    float bubbleRadius = uProgress * maxRadius;
    vec2 sphereCenter = center * uResolution;
    float focusFactor = 0.25;

    gl_FragColor = mixWithDistortion(p, uv1, uv2, bubbleRadius, sphereCenter, focusFactor);
}
