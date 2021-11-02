/* global CanvasPlus */
import 'pixl-canvas-plus/browser';
let canvas_plus = new CanvasPlus();

const cache = {};

const loadRemote = (url) =>
    new Promise((res, rej) => {
        if (cache[url]) {
            canvas_plus = cache[url].clone();
            res();
        } else {
            canvas_plus.loadRemote(url, (err) => {
                if (err) rej(err);
                else {
                    cache[url] = canvas_plus.clone();
                    res();
                }
            });
        }
    });

export const renderImage = async (
    url,
    {
        normalize = true,
        curves_1 = 149,
        curves_2 = 73,
        curves_3 = 159,
        effect_1 = 0.6,
        effect_2 = 0.75,
        saturation = 0,
        brightness = 0,
        contrast = 0,
        color = '#214192',
    } = {}
) => {
    canvas_plus.reset();
    await loadRemote(url);
    canvas_plus
        .adjust({ saturation, brightness, contrast })
        .curves({ rgb: [0, 0, 0, 1, curves_1, 255, 255] })
        .desaturate()
        .draw({
            commands: [['rect', 0, 0, canvas_plus.width(), canvas_plus.height()], ['fill']],
            params: { fillStyle: color, globalCompositeOperation: 'color-burn', globalAlpha: effect_1 },
        })
        .draw({
            commands: [['rect', 0, 0, canvas_plus.width(), canvas_plus.height()], ['fill']],
            params: { fillStyle: color, globalCompositeOperation: 'luminosity', globalAlpha: effect_2 },
        })
        .curves({ rgb: [0, 0, curves_2, curves_3, 0, 0, 0] });
    if (normalize) canvas_plus.normalize();

    return canvas_plus.canvas;
};
