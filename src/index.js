import { fabric } from 'fabric';
import slugify from '@sindresorhus/slugify';

import { renderImage as _renderImage } from './util/canvas-plus';
import { locked, computeStyles, loadSvg, clone } from './util/fabric';
import { downloadFile } from './util/download';

import './style.scss';

const get = (id) => {
    const el = document.getElementById(id);
    if (el.type === 'checkbox') return el.checked;
    if (['text', 'textarea', 'select-one', 'color'].includes(el.type)) return el.value;
    return parseFloat(el.value);
};

(async () => {
    await document.fonts.ready;

    const renderImage = async () =>
        await _renderImage(get('img-url'), {
            normalize: get('normalize'),
            curves_1: get('curves_1'),
            curves_2: get('curves_2'),
            curves_3: get('curves_3'),
            effect_1: get('effect_1'),
            effect_2: get('effect_2'),
            brightness: get('brightness'),
            saturation: get('saturation'),
            contrast: get('contrast'),
            color: get('color'),
        });

    let image_canvas = await renderImage();
    const canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });

    const tpl_guide = new fabric.Line([], { stroke: '#4affff', strokeWidth: 1, ...locked });
    const fabric_objects = {
        guides: [await clone(tpl_guide), await clone(tpl_guide), await clone(tpl_guide), await clone(tpl_guide)],
        image: new fabric.Image(),
        heading: new fabric.Text('', {
            fontFamily: 'Spartan MB',
            fontSize: 250,
            lineHeight: 1.1,
            textAlign: 'left',
            fill: '#fff',
            originX: 'center',
            originY: 'center',
            ...locked,
        }),
        logos: {
            de: await loadSvg('/img/logo-inverted-de.svg', locked),
            en: await loadSvg('/img/logo-inverted-en.svg', locked),
            fr: await loadSvg('/img/logo-inverted-fr.svg', locked),
            pt: await loadSvg('/img/logo-inverted-pt.svg', locked),
            es: await loadSvg('/img/logo-inverted-es.svg', locked),
            hr: await loadSvg('/img/logo-inverted-hr.svg', locked),
            nl: await loadSvg('/img/logo-inverted-nl.svg', locked),
        },
    };

    const updateObjects = () => {
        fabric_objects.image.setElement(image_canvas);

        fabric_objects.heading.set('width', canvas.width - 2 * get('margin'));
        fabric_objects.heading.set('text', get('text').replace(/\*/g, ''));
        fabric_objects.heading.set('styles', computeStyles(get('text')));
        fabric_objects.heading.set('top', canvas.height / 2);
        fabric_objects.heading.set('left', canvas.width / 2);
        fabric_objects.heading.set('visible', get('show_text'));

        // Scale text to fit within the margins.
        const max_height = canvas.height - 2 * get('margin');
        const max_width = canvas.width - 2 * get('margin');
        const text_ratio = fabric_objects.heading.height / fabric_objects.heading.width;
        if (max_width * text_ratio > max_height) fabric_objects.heading.scaleToHeight(max_height);
        else fabric_objects.heading.scaleToWidth(max_width);

        const coords = [
            { x1: get('margin'), y1: 0, x2: get('margin'), y2: canvas.height },
            { x1: canvas.width - get('margin'), y1: 0, x2: canvas.width - get('margin'), y2: canvas.height },
            { x1: 0, y1: get('margin'), x2: canvas.width, y2: get('margin') },
            { x1: 0, y1: canvas.height - get('margin'), x2: canvas.width, y2: canvas.height - get('margin') },
        ];
        for (let i = 0; i < fabric_objects.guides.length; i++) {
            fabric_objects.guides[i].set('x1', coords[i].x1);
            fabric_objects.guides[i].set('y1', coords[i].y1);
            fabric_objects.guides[i].set('x2', coords[i].x2);
            fabric_objects.guides[i].set('y2', coords[i].y2);
            fabric_objects.guides[i].set('visible', get('show_guides'));
        }

        for (const key in fabric_objects.logos) fabric_objects.logos[key].set('visible', false);
        fabric_objects.logos[get('site')].set('visible', get('show_logo'));

        fabric_objects.heading.top -= fabric_objects.logos[get('site')].height - 20;
        const heading_pos = fabric_objects.heading.getPointByOrigin('left', 'bottom');
        fabric_objects.logos[get('site')].top = heading_pos.y + 40;
        fabric_objects.logos[get('site')].left = heading_pos.x;

        canvas.renderAll();
    };

    updateObjects();

    canvas.add(fabric_objects.image);
    canvas.add(fabric_objects.heading);
    for (const guide of fabric_objects.guides) canvas.add(guide);
    for (const key in fabric_objects.logos) canvas.add(fabric_objects.logos[key]);

    document.getElementById('download').onclick = () => {
        for (const guide of fabric_objects.guides) guide.visible = false;
        const data_url = canvas.toDataURL({ format: 'jpeg' });
        for (const guide of fabric_objects.guides) guide.visible = true;

        downloadFile(data_url, `${slugify(get('text'))}.jpg`);
    };
    for (const id of ['text', 'site', 'margin', 'show_text', 'show_logo', 'show_guides']) {
        document.getElementById(id).oninput = updateObjects;
    }
    const rebuildImage = async () => {
        image_canvas = await renderImage();
        fabric_objects.image.setElement(image_canvas);
        canvas.renderAll();
    };
    for (const id of [
        'normalize',
        'curves_1',
        'curves_2',
        'curves_3',
        'effect_1',
        'effect_2',
        'brightness',
        'contrast',
        'saturation',
        'color',
    ]) {
        document.getElementById(id).oninput = rebuildImage;
    }
    document.getElementById('img-url').onblur = rebuildImage;
})();
