// SPDX-FileCopyrightText: 2026 Progmasoft <support@progmasoft.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

"use client";

import { useEffect, useRef } from "react";

export type FlowColours = [string, string, string, string];

interface FlowProps {
  /** Four colours, from the deepest to the lightest, as #rrggbb. */
  colours: FlowColours;
  /** Shifts the pattern so that two fields never look the same. */
  seed?: number;
  /** How fast the field moves; 0 keeps it still. */
  speed?: number;
  /** Stops the motion while true. */
  paused?: boolean;
  className?: string;
}

const vertex = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

/*
 * Layered value noise, warped by itself, mapped onto four colours: a slow
 * field like sand under water.
 */
const fragment = `precision mediump float;
uniform vec2 r;uniform float t;uniform float s;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float b(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 u=gl_FragCoord.xy/r.y;vec2 p=u*1.6+s;
vec2 q=vec2(b(p+vec2(0.,t*.05)),b(p+vec2(5.2,1.3)-t*.04));
vec2 w=vec2(b(p+3.*q+vec2(1.7,9.2)+t*.03),b(p+3.*q+vec2(8.3,2.8)));
float v=b(p+2.5*w);
float band=smoothstep(.25,.75,gl_FragCoord.y/r.y+.25*(v-.5));
vec3 col=mix(c0,c1,smoothstep(.2,.6,v));
col=mix(col,c2,smoothstep(.45,.85,length(w)*.9));
col=mix(col,c3,band*.55);
col+=(h(gl_FragCoord.xy+t)-.5)*.035;
gl_FragColor=vec4(col,1.);}`;

function rgb(hex: string): number[] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

/**
 * A field of slowly moving colour drawn by the browser, in place of a
 * photograph or a video. New colours blend in over a second. It stops when it
 * leaves the screen or is paused, and for those who ask for less motion it
 * draws still frames. Without WebGL the element keeps its CSS background.
 */
export function Flow({
  colours,
  seed = 0,
  speed = 1,
  paused = false,
  className,
}: FlowProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const target = useRef(colours.map(rgb));
  const pausedRef = useRef(paused);
  const redraw = useRef<() => void>(() => undefined);

  useEffect(() => {
    target.current = colours.map(rgb);
    redraw.current();
  }, [colours]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!element || !gl) {
      return;
    }

    const shader = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = shader(gl.VERTEX_SHADER, vertex);
    const fs = shader(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const slots = [0, 1, 2, 3].map((index) =>
      gl.getUniformLocation(program, `c${index}`),
    );
    gl.uniform1f(gl.getUniformLocation(program, "s"), seed);
    const size = gl.getUniformLocation(program, "r");
    const time = gl.getUniformLocation(program, "t");

    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      speed === 0;
    let current = target.current.map((colour) => [...colour]);
    let visible = true;
    let frame = 0;
    let clock = seed * 10;
    let last = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
      element.width = Math.max(1, Math.round(element.clientWidth * scale));
      element.height = Math.max(1, Math.round(element.clientHeight * scale));
      gl.viewport(0, 0, element.width, element.height);
      gl.uniform2f(size, element.width, element.height);
    };
    const draw = () => {
      current.forEach((colour, index) => {
        gl.uniform3fv(slots.at(index) ?? null, colour);
      });
      gl.uniform1f(time, clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    /** Moves every colour the given share of the way to its target. */
    const blend = (amount: number) => {
      current = current.map((colour, index) => {
        const goal = target.current.at(index) ?? colour;
        return colour.map(
          (value, channel) =>
            value + ((goal.at(channel) ?? value) - value) * amount,
        );
      });
    };
    const tick = (now: number) => {
      const seconds = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (visible) {
        if (!pausedRef.current) clock += seconds * speed;
        blend(Math.min(1, seconds * 2.4));
        draw();
      }
      frame = requestAnimationFrame(tick);
    };

    resize();
    draw();
    element.dataset.ready = "true";
    redraw.current = () => {
      if (still) {
        blend(1);
        draw();
      }
    };
    const resizer = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizer.observe(element);
    const watcher = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    });
    watcher.observe(element);
    if (!still) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizer.disconnect();
      watcher.disconnect();
      redraw.current = () => undefined;
    };
  }, [seed, speed]);

  return (
    <div className={className ? `pm-flow ${className}` : "pm-flow"}>
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}
