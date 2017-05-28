var Guitar = (function () {
    // Svg element creator
    var Svg = {
        url: 'http://www.w3.org/2000/svg',

        getNode: function (type, attrs) {
            var node = document.createElementNS(this.url, type);

            for (var attr in attrs)
                node.setAttributeNS(null, attr, attrs[attr]);

            return node;
        }
    };


    // Storage for chord data
    function ChordData(options) {
        this.chordPatterns = [{
            'type': 'clamp',
            'fret': 'isNumber:isInteger',
            'string': 'isNumber:isInteger:inStringRange'
        }, {
            'type': 'barre',
            'fret': 'isNumber:isInteger',
            'barre': {
                'from': 'isNumber:isInteger:inStringRange',
                'to': 'isNumber:isInteger:inStringRange'
            }
        }];

        this.title = null;

        this.fretNum = 3;

        this.chordFirstFret = null;
        this.chord = null;

        this.stringNum = 6;
        this.statusStringList = [null, 'open', 'closed'];
        this.statusString = null;

        this._setData(options);
    }

    ChordData.prototype._setData = function (options) {
        if (typeof options !== 'object') {
            throw new Error('Wrong options type');
        }

        if ('title' in options) {
            this.title = String(options.title);
        }

        if ('statusString' in options) {
            this.statusString = this._validateStringStatus(options.statusString);
        }

        if ('chord' in options) {
            this.chord = this._validateChord(options.chord);

            this.chordFirstFret = this.getFirstFretOfChord();

            this._filterChord();
        }
    };

    ChordData.prototype._validateStringStatus = function (statusString) {
        if (!Array.isArray(statusString)) {
            throw new Error('String status must be array');
        }

        if (statusString.length != this.stringNum) {
            throw new Error('Number of string must be equal ' + this.stringNum);
        }

        for (var i = 0; i < statusString.length; i++) {
            if (this.statusStringList.indexOf(statusString[i]) == -1) {
                throw new Error('Wrong string status');
            }
        }

        return statusString;
    };

    ChordData.prototype._validateChord = function (chord) {
        for (var i = 0, chordLength = chord.length; i < chordLength; i++) {
            var isVerify = false;

            for (var j = 0, patternsLength = this.chordPatterns.length; j < patternsLength; j++) {
                if (this._compareWithPattern(chord[i], this.chordPatterns[j])) {
                    chord[i].type = this.chordPatterns[j].type;
                    isVerify = true;
                }
            }

            if (!isVerify) {
                throw new Error('Wrong chord data');
            }
        }

        return chord;
    };

    ChordData.prototype._filterChord = function () {
        this.chord = this.chord.filter(function (obj) {
            if (obj.fret < this.chordFirstFret + this.fretNum) {
                return obj;
            }
        }, this);
    };

    ChordData.prototype._compareWithPattern = function (chord, pattern) {
        for (var prop in pattern) {
            if (prop == 'type') {
                continue;
            }

            if (typeof chord[prop] === 'object' && typeof pattern[prop] === typeof pattern[prop]) {
                return this._compareWithPattern(chord[prop], pattern[prop]);
            }

            if (chord.hasOwnProperty(prop)) {
                var functions = pattern[prop].split(':');

                for (var i = 0, length = functions.length; i < length; i++) {
                    if (!this['_' + functions[i]](chord[prop])) {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }

        return true;
    };

    ChordData.prototype._isNumber = function (num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    };

    ChordData.prototype._isInteger = function (num) {
        return (num ^ 0) === num;
    };

    ChordData.prototype._inStringRange = function (string) {
        return string >= 1 && string <= this.stringNum;
    };

    ChordData.prototype.getFirstFretOfChord = function () {
        var firstFret = null;

        for (var i = 0, length = this.chord.length; i < length; i++) {
            if (this.chord[i].fret < firstFret || firstFret == null) {
                firstFret = this.chord[i].fret;
            }
        }

        return firstFret;
    };

    ChordData.prototype.getData = function () {
        return {
            'title': this.title,
            'statusString': this.statusString,
            'chord': this.chord,
            'firstFret': this.chordFirstFret,
            "stringNum": this.stringNum
        };
    };


    function ChordDrawer(id, options) {
        // Element
        this.elementId = id;
        this.element = document.getElementById(this.elementId);

        //Margin
        this.margin = 5;

        // Svg
        this.svg = null;
        this.svgWidth = 215;
        this.svgHeigth = 112;

        // Riff
        this.riffStartX = 25;
        this.riffStartY = 6;
        this.riffWidth = 180;
        this.riffHeight = 100;
        this.stringWidth = 1;
        this.stringVerticalMargin = 20;
        this.stringHorizontalMargin = 60;

        // String status
        this.statusStringStartX = 10;
        this.radiusStatusString = 5;

        // Clamp string
        this.radiusClampString = 5;

        // Colors
        this.colors = {
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)'
        };

        //Font
        this.fontFamily = 'Tahoma';
        this.fontSize = 16;

        // Guitar data
        var chordDataObj = new ChordData(options);
        this.data = chordDataObj.getData();
    }

    ChordDrawer.prototype._drawSvg = function () {
        this.svg = Svg.getNode('svg', {
            'width': this.svgWidth,
            'height': this.svgHeigth
        });
    };

    ChordDrawer.prototype._drawRiff = function () {
        this.svg.appendChild(Svg.getNode('rect', {
            'x': this.riffStartX,
            'y': this.riffStartY,
            'height': this.riffHeight,
            'width': this.riffWidth,
            'stroke': this.colors.black,
            'stroke-width': this.stringWidth,
            'fill': this.colors.white
        }));

        for (var i = this.stringHorizontalMargin + this.riffStartX, length = this.riffStartX + this.riffWidth; i <= length; i += this.stringHorizontalMargin) {
            this.svg.appendChild(Svg.getNode('line', {
                'x1': i,
                'y1': this.riffStartY,
                'x2': i,
                'y2': this.riffHeight + this.riffStartY,
                'stroke': this.colors.black,
                'stroke-width': this.stringWidth
            }));
        }

        for (var i = this.stringVerticalMargin + this.riffStartY, length = this.riffStartY + this.riffHeight; i <= length; i += this.stringVerticalMargin) {
            this.svg.appendChild(Svg.getNode('line', {
                'x1': this.riffStartX,
                'y1': i,
                'x2': this.riffStartX + this.riffWidth,
                'y2': i,
                'stroke': this.colors.black,
                'stroke-width': this.stringWidth
            }));
        }
    };

    ChordDrawer.prototype._drawStringStatus = function () {
        for (var i = 0, length = this.data.statusString.length; i < length; i++) {
            switch (this.data.statusString[i]) {
                case 'open':
                    this.svg.appendChild(Svg.getNode('circle', {
                        'cx': this.statusStringStartX + this.radiusStatusString,
                        'cy': this.riffStartY + this.stringVerticalMargin * i,
                        'r': this.radiusStatusString,
                        'stroke': this.colors.black,
                        'stroke-width': this.stringWidth,
                        fill: this.colors.white
                    }));

                    break;
                case 'closed':
                    this.svg.appendChild(Svg.getNode('line', {
                        'x1': this.statusStringStartX,
                        'y1': this.riffStartY - this.radiusStatusString + this.stringVerticalMargin * i,
                        'x2': this.statusStringStartX + this.radiusStatusString * 2,
                        'y2': this.riffStartY + this.radiusStatusString + this.stringVerticalMargin * i,
                        'stroke': this.colors.black,
                        'stroke-width': this.stringWidth
                    }));

                    this.svg.appendChild(Svg.getNode('line', {
                        'x1': this.statusStringStartX + this.radiusStatusString * 2,
                        'y1': this.riffStartY - this.radiusStatusString + this.stringVerticalMargin * i,
                        'x2': this.statusStringStartX,
                        'y2': this.riffStartY + this.radiusStatusString + this.stringVerticalMargin * i,
                        'stroke': this.colors.black,
                        'stroke-width': this.stringWidth
                    }));

                    break;
            }
        }
    };

    ChordDrawer.prototype._drawClampString = function (fret, string) {
        this.svg.appendChild(Svg.getNode('circle', {
            'cx': this.riffStartX + this.stringHorizontalMargin / 2 + this.stringHorizontalMargin * (fret - this.data.firstFret),
            'cy': this.riffStartY + this.stringVerticalMargin * (string - 1),
            'r': this.radiusClampString,
            'stroke': this.colors.black,
            'stroke-width': this.stringWidth,
            fill: this.colors.black
        }));
    };

    ChordDrawer.prototype._drawBarre = function (fret, from, to) {
        this._drawClampString(fret, from);
        this._drawClampString(fret, to);

        if (to < from) {
            var temp = to;
            to = from;
            from = temp;
        }

        this.svg.appendChild(Svg.getNode('rect', {
            'x': this.riffStartX + this.stringHorizontalMargin / 2 - this.radiusClampString + this.stringHorizontalMargin * (fret - this.data.firstFret),
            'y': this.riffStartY + this.stringVerticalMargin * (from - 1),
            'height': this.stringVerticalMargin * (to - 1),
            'width': this.radiusClampString * 2,
            'stroke': this.colors.black,
            'stroke-width': this.stringWidth,
            'fill': this.colors.black
        }));
    };

    ChordDrawer.prototype._drawFretNumber = function (text) {
        var textElement = Svg.getNode('text', {
            'x': this.riffStartX,
            'y': this.riffStartY + this.data.stringNum * this.stringVerticalMargin,
            'font-family': this.fontFamily,
            'fill': this.colors.black
        });

        textElement.textContent = text;

        this.svg.appendChild(textElement);
    };

    ChordDrawer.prototype._drawTitle = function () {
        var textElement = Svg.getNode('text', {
            'x': this.riffStartX + this.riffWidth / 2,
            'y': this.riffStartY - this.radiusStatusString - this.margin,
            'font-family': this.fontFamily,
            'fill': this.colors.black,
            'text-anchor': 'middle'
        });

        textElement.textContent = this.data.title;

        this.svg.appendChild(textElement);
    };

    ChordDrawer.prototype.drawChord = function () {
        if (this.data.firstFret > 1) {
            this.svgHeigth = this.svgHeigth + this.fontSize;
        }

        if (this.data.title != null) {
            this.svgHeigth = this.svgHeigth + this.fontSize + this.margin;
            this.riffStartY = this.riffStartY + this.fontSize + this.margin;
        }

        this._drawSvg();
        this._drawRiff();
        this._drawStringStatus();

        for (var i = 0, length = this.data.chord.length; i < length; i++) {
            switch (this.data.chord[i].type) {
                case 'clamp':
                    this._drawClampString(this.data.chord[i].fret, this.data.chord[i].string);
                    break;
                case 'barre':
                    this._drawBarre(this.data.chord[i].fret, this.data.chord[i].barre.from, this.data.chord[i].barre.to);
                    break;
            }
        }

        if (this.data.firstFret > 1) {
            this._drawFretNumber(this.data.firstFret);
        }

        if (this.data.title != null) {
            this._drawTitle();
        }

        this.element.appendChild(this.svg);
    };

    var Guitar = {
        chord: function (element, options) {
            var chord = new ChordDrawer(element, options);
            chord.drawChord(element);
        }
    };

    return Guitar;
}());