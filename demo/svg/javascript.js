// Generate a svg randomly
chance.mixin({
    svg: function(options){
        options = options || {};
        options.size = options.max_size || 30;
        if (typeof options.lines === 'undefined') options.lines = 20;
        if (typeof options.circles === 'undefined') options.circles = 10;
        if (typeof options.triangles === 'undefined') options.triangles = 10;
        if (typeof options.opacity === 'undefined') options.opacity = 0.3;
        options.background = options.background || chance.color();

        // Create a coordinate within an area bigger than the svg
        function point(min, max){
            return chance.integer({ min: min || -50, max: max || 150 });
        }

        // Generate the actual svg
        // Docs: developer.mozilla.org/en-US/docs/Web/SVG/Element/line
        // viewBox use: stackoverflow.com/q/17498855
        var svg = '<svg version="1.1" viewBox="0 0 100 100"';
        svg += 'xmlns="http://www.w3.org/2000/svg"';
        svg += 'style="background-color:' + options.background + '">';
        for (var i = 0; i < options.lines; i++) {
            svg += '<line stroke="' + chance.color() + '" ';
            svg += 'stroke-width="' + point(1, 5) + '" ';
            svg += 'opacity="' + options.opacity + '" ';
            svg += 'x1="' + point() + '" y1="' + point() + '" ';
            svg += 'x2="' + point() + '" y2="' + point() + '" />';
        }
        for (var i = 0; i < options.circles; i++) {
            svg += '<circle cx="' + point() + '" ';
            svg += 'cy="' + point() + '" ';
            svg += 'r="' + point(1, options.max_size / 2) + '" ';
            svg += 'opacity="' + options.opacity + '" ';
            svg += 'fill="' + chance.color() + '"/>';
        }
        for (var i = 0; i < options.triangles; i++) {
            var s = size = options.max_size;
            svg += '<polygon fill="' + chance.color() + '" points="';
            svg += (x = point()) + ',' + (y = point()) + ' ';
            svg += (x + point(-s, s)) + ',' + (y + point(-s, s)) + ' ';
            svg += (x + point(-s, s)) + ',' + (y + point(-s, s));
            svg += '" opacity="' + options.opacity + '" ';
            svg += 'fill="' + chance.color() + '"/>';
        }
        return svg + '</svg>';
    }
});


document.querySelector('body').innerHTML = chance.svg({
    lines: 20,
    triangles: 10,
    circles: 10,
    max_size: 30,
    opacity: 0.3
});
