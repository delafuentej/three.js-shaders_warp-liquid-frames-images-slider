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

vec4 mixWithDistortion(vec2 p, vec2 uv1, vec2 uv2, float radius, vec2 sphereCenter, float focusFactor) {
    vec4 tex1 = texture2D(uTexture1, uv1);
    LensDistortion dist = getLensDistortion(p, uv2, sphereCenter, radius, focusFactor);
    vec4 tex2 = texture2D(uTexture2, dist.distortedUV);

    float mask = getBubbleMask(p, sphereCenter, radius);
    float finalMask = max(mask, 1.0 - dist.inside);

    return mix(tex2, tex1, finalMask);
}

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
