import { useRef, useEffect } from "react";

export default function GradientShader({
  speed = 1.0,
  lineCount = 10,
  amplitude = 0.15,
  yOffset = 0.15,
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformLocationsRef = useRef({});

  // Vertex shader
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }
  `;

  // Fragment shader - Creates the wave pattern on the gpu
  const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uSpeed;
    uniform float uLineCount;
    uniform float uAmplitude;
    uniform float uYOffset;

    const float MAX_LINES = 20.0;

    float wave(vec2 uv, float speed, float yPos, float thickness, float softness) {
      float falloff = smoothstep(1., 0.5, abs(uv.x));
      float y = falloff * sin(iTime * speed + uv.x * 10.0) * yPos - uYOffset;
      return 1.0 - smoothstep(thickness, thickness + softness + falloff * 0.0, abs(uv.y - y));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / iResolution.y;
      vec4 col = vec4(0.0, 0.0, 0.0, 1.0);

      vec3 gradCol1 = vec3(0.0, 0.1, 0.3); // Azul profundo tipo Industrial
      vec3 gradCol2 = vec3(0.0, 0.3, 0.6); // Azul más claro
      col.xyz = mix(gradCol1, gradCol2, uv.x + uv.y);

      uv -= 0.5;
      
      const vec3 col1 = vec3(0.4, 0.7, 1.0); // Lineas celestes
      const vec3 col2 = vec3(1.0, 1.0, 1.0); // Lineas blancas

      float aaDy = iResolution.y * 0.000005;
      
      for (float i = 0.; i < MAX_LINES; i += 1.) {
        if (i <= uLineCount) {
          float t = i / (uLineCount - 1.0);
          vec3 lineCol = mix(col1, col2, t);
          float bokeh = pow(t, 3.0);
          float thickness = 0.003;
          float softness = aaDy + bokeh * 0.2;
          float amp = uAmplitude - 0.05 * t;
          float amt = max(0.0, pow(1.0 - bokeh, 2.0) * 0.9);
          col.xyz += wave(uv, uSpeed * (1.0 + t), uAmplitude, thickness, softness) * lineCol * amt;
        }
      }

      gl_FragColor = col;
    }
  `;

  const initWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return false;
    glRef.current = gl;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    uniformLocationsRef.current = {
      iResolution: gl.getUniformLocation(program, "iResolution"),
      iTime: gl.getUniformLocation(program, "iTime"),
      uSpeed: gl.getUniformLocation(program, "uSpeed"),
      uLineCount: gl.getUniformLocation(program, "uLineCount"),
      uAmplitude: gl.getUniformLocation(program, "uAmplitude"),
      uYOffset: gl.getUniformLocation(program, "uYOffset"),
    };

    return true;
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  };

  const render = () => {
    const gl = glRef.current;
    const program = programRef.current;
    const uniforms = uniformLocationsRef.current;

    if (!gl || !program) return;

    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTimeRef.current) / 1000;

    gl.uniform2f(uniforms.iResolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(uniforms.iTime, elapsedTime);
    gl.uniform1f(uniforms.uSpeed, speed);
    gl.uniform1f(uniforms.uLineCount, lineCount);
    gl.uniform1f(uniforms.uAmplitude, amplitude);
    gl.uniform1f(uniforms.uYOffset, yOffset);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationFrameRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (initWebGL()) {
      handleResize();
      render();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
