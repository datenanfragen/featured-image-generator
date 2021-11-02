export const loadSvg = (url, options = {}) =>
    new Promise((res) =>
        fabric.loadSVGFromURL(url, (objects, opts) =>
            res(fabric.util.groupSVGElements(objects, { ...opts, ...options }))
        )
    );

export const clone = (obj) => new Promise((res) => obj.clone((new_obj) => res(new_obj)));

// Given `text` with sections that should be highlighted in asterisks (e.g. `Hello *world*.`), this computes the
// `styles` parameters that Fabric needs to render that.
export const computeStyles = (text) => {
    const styles = {};

    let is_highlight = false;
    let line_i = 0;
    let column_i = 0;
    for (let i = 0; i < text.length; i++) {
        column_i++;
        if (text[i] === '*') {
            column_i--;
            is_highlight = !is_highlight;
            continue;
        } else if (text[i] === '\n') {
            line_i++;
            column_i = 0;
            continue;
        }

        if (is_highlight) {
            if (!styles[line_i]) styles[line_i] = {};
            styles[line_i][column_i - 1] = { fill: '#9ee3cd' };
        }
    }

    return styles;
};

// Apply these properties to a Fabric object to make it locked, i.e. not-selectable or -changeable.
export const locked = {
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    selectable: false,
    hasControls: false,
    hoverCursor: 'default',
};
