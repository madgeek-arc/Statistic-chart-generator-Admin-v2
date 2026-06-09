import { MarkedOptions, Renderer } from "marked";

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new Renderer();

  renderer.link = ({ href, title, tokens }) => {
    const text = tokens?.map(t => t.raw).join('') ?? '';

    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  return {
    renderer,
  };
}
