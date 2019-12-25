import FontFaceObserver from 'fontfaceobserver';
import Mesh from './Mesh';

const iconFont = new FontFaceObserver('Maax');
iconFont.load().then(() => {
  document.body.classList.add('font-loaded');
});

const canvas = document.getElementById('canvas');

const mesh = new Mesh(canvas, {});
mesh.start();
