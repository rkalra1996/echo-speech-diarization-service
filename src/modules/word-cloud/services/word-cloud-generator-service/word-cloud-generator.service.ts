        // tslint:disable: prefer-for-of
        // tslint:disable: prefer-const

import { Injectable } from '@nestjs/common';
import * as d3Object from 'd3-node';

const d3 = new d3Object();

@Injectable()
export class WordCloudGeneratorService {

    drawWordCloud(requestBody) {
        let {data, width, height,type} = requestBody;
        const common = `abc,also,just,know,now,like,we,saw,seen,see,seing,get,dad,mom,if,else,got,sir,madam,mam,go,want,yet,man,men,woman,women,to,be,in,so,the,yes,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall`;

        width = width ? width : 100;
        height = height ? height : 100;
        const svgElement = d3.createSVG(width, height).append('g');

        const wordCount = {};

        const words = data.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
        if (words.length === 1) {
            wordCount[words[0]] = 1;
        } else {
            words.forEach((wordEach) => {
                let word = wordEach.toLowerCase();
                word = word.trim();
                if (!!word && word.length > 1 && isNaN(parseFloat(word)) && ~common.indexOf(word) >= 0) {
                    if (wordCount[word]) {
                        wordCount[word]++;
                    } else {
                        wordCount[word] = 1;
                    }
                }
            });
        }

        //   let svg_location = "#chart";
        //   let width = document.width();
        //   let height = document.height();

        //   let margin = {left:100, right:20, top:20, bottom:200};
        // let width = 1000-margin.left-margin.right;
        // let height = 750-margin.top-margin.bottom;

        //   let fill = d3.scale.category20();
        const colorScale = 'blue';

        const wordEntries = d3.entries(wordCount);
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(wordEntries, (d) => {
                return d.value;
            }),
            ])
            .range([10, 100]);

        d3.layout.cloud().size([width, height])
            .timeInterval(20)
            .words(wordEntries)
            .fontSize((d) => { xScale(d.value); })
            .text((d) => { d.key; })
            .rotate(() => { ~~(Math.random() * 2) * 90; })
            .font('Impact')
            .on('end', draw)
            .start();

        function draw(words) {
            svgElement.append('g')
                .attr('transform', 'translate(" + [width >> 1, height >> 1] + ")')
                .selectAll('text')
                .data(words)
                .enter().append('text')
                .style('font-size', (d) => xScale(d.value) + 'px')
                .style('font-family', 'Impact')
                .style('fill', (d, i) =>  colorScale )
                .attr('text-anchor', 'middle')
                .attr('transform', (d) => {
                    return 'translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")';
                })
                .text((d) => d.key);
        }

        d3.layout.cloud().stop();
        return this.convertWordCloudToImage(svgElement, width, height, type);
    }

    convertWordCloudToImage(svg, width, height, type) {
        let svgString = this.getSVGString(svg.node());
        return this.svgString2Image(svgString, 2 * width, 2 * height, type, save); // passes Blob and filesize String to the callback

        function save(dataBlob, filesize) {
            this.saveAs(dataBlob, 'D3 vis exported to PNG.png'); // FileSaver.js function
        }
    }

    // Below are the functions that handle actual exporting:
    // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
    getSVGString(svgNode) {
        svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        let cssStyleText = this.getCSSStyles(svgNode);
        this.appendCSS(cssStyleText, svgNode);

        let serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
        svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

        return svgString;
    }

    getCSSStyles(parentElement) {
        let selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (let c = 0; c < parentElement.classList.length; c++) {
            if (!this.contains('.' + parentElement.classList[c], selectorTextArr)) {
                selectorTextArr.push('.' + parentElement.classList[c]);
            }
        }

        // Add Children element Ids and Classes to the list
        let nodes = parentElement.getElementsByTagName('*');
        for (let i = 0; i < nodes.length; i++) {
            let id = nodes[i].id;
            if (!this.contains('#' + id, selectorTextArr)) {
                selectorTextArr.push('#' + id);
            }

            let classes = nodes[i].classList;
            for (let c = 0; c < classes.length; c++) {
                if (!this.contains('.' + classes[c], selectorTextArr)) {
                    selectorTextArr.push('.' + classes[c]);
                }
            }
        }

        // Extract CSS Rules
        let extractedCSSText = '';
        for (let i = 0; i < document.styleSheets.length; i++) {
            let s = document.styleSheets[i];

            try {
                if (!s['cssRules']) {continue; }
            } catch (e) {
                if (e.name !== 'SecurityError') {throw e; } // for Firefox
                continue;
            }

            let cssRules = s['cssRules'];
            for (let r = 0; r < cssRules.length; r++) {
                if (this.contains(cssRules[r].selectorText, selectorTextArr)) {
                    extractedCSSText += cssRules[r].cssText;
                }
            }
        }
        return extractedCSSText;
    }

    contains(str, arr) {
        return arr.indexOf(str) === -1 ? false : true;
    }

    appendCSS(cssText, element) {
        let styleElement = document.createElement('style');
        styleElement.setAttribute('type', 'text/css');
        styleElement.innerHTML = cssText;
        let refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
    }

    svgString2Image(svgString, width, height, format, callback) {
        format = format ? format : 'png';

        let imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        let image = new Image();
        image.onload = () => {
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob((blob: any) => {
                let filesize = Math.round(blob.length / 1024) + ' KB';
                if (callback) {callback(blob, filesize); }
            });

        };

        image.src = imgsrc;
        return image;
    }
}
