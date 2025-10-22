vec4 mixWithDistortion(vec2 p, vec2 uv1, vec2 uv2, float radius, vec2 sphereCenter, float focusFactor) {
    vec4 tex1 = texture2D(uTexture1, uv1);
    LensDistortion dist = getLensDistortion(p, uv2, sphereCenter, radius, focusFactor);
    vec4 tex2 = texture2D(uTexture2, dist.distortedUV);

    float mask = getBubbleMask(p, sphereCenter, radius);
    float finalMask = max(mask, 1.0 - dist.inside);

    return mix(tex2, tex1, finalMask);
}