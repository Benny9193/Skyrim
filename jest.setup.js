// Jest setup file for global test configuration

// Mock canvas for Three.js tests
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4)
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      getExtension: jest.fn(),
      getParameter: jest.fn(),
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(() => true),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      enable: jest.fn(),
      viewport: jest.fn(),
      clear: jest.fn(),
      clearColor: jest.fn(),
    };
  }
  return null;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for JSON data loading
global.fetch = jest.fn((url) => {
  if (url.includes('characters.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        characters: [
          {
            id: 1,
            name: 'Test Character',
            race: 'Test Race',
            level: 10
          }
        ]
      })
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  });
});

console.log('Jest setup complete');
