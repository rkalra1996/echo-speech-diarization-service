'use strict';
var wordCloudModule = (function (d3Object) {

  // check D3 Library is available or not
  if (!d3)
    throw new Error('D3 Library not available');

  // check D3 Library available is version 4.x or not
  if (!d3.version.split('.')[0] == '4')
    throw new Error('Please select Library D3 version 4.x');

    /**
    * Mandatory parameters : 
    * 1. containerid --> Id of the container or div in which you want to display the Word Cloud
    * 2. wordclouddata --> Data for the Word Cloud

    * Optional parameters : 
    * 3. stopwords --> Words you don't want to be displayed in the Word Cloud (Defaults already available)
       stopwords should be provided either in an array or as a string with ',' (comma) seperated values or ' ' (space) seperared values.
       stopwords are case insensitive.
       Default stopwords = ( also,just,know,now,like,we,saw,seen,see,seing,get,dad,mom,if,else,got,sir,madam,mam,go,want,yet,man,men,woman,women,to,be,in,so,the,yes,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall )
    * 4. padding --> Padding of the container as 'padding_top padding_left padding_bottom padding_right' eg. '20 40 40 20'.
    */
  function wordCloudGenerator(options) {

    var {
      containerid,
      wordclouddata,
      stopwords,
      padding
    } = options;

    var paddingAll;
    if (typeof padding == 'string' && padding.split().length == 4) {
      // apply padding id provided by the user
      paddingAll = padding;
    } else {
      // apply default padding if not provided
      paddingAll = '20 20 20 20';
    }

    // validate the mandatory request parametes and check if D3 Library is available 
    var error = validataRequest(containerid, wordclouddata);

    // Create the SVG within the component provided by the user
    var svgElement = createSVGComponent(containerid, paddingAll);

    // generate the Word Cloud
      generateWordCloud(svgElement, wordclouddata, stopwords);
  }

  function generateWordCloud(svgElement, data, stopwords) {

    // get word's count for Word CLoud  
    var word_count = getWordCount(data, stopwords);

    // get the width and height of the SVG element
    let width = svgElement.node().getBoundingClientRect().width;
    let height = svgElement.node().getBoundingClientRect().height;

    // color scheme for word cloud
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20c)

    var word_entries = d3.entries(word_count);

    // creating the scale for the word's font size
    var xScale = d3.scaleLinear()
      .domain([0, d3.max(word_entries, function (d) {
        return d.value;
      })])
      .range([10, 100]);

    // creating the layout of the word cloud
    d3.layout.cloud().size([width, height])
      .timeInterval(20)
      .words(word_entries)
      .fontSize(function (d) {
        return xScale(d.value);
      })
      .text(function (d) {
        return d.key;
      })
      .rotate(function () {
        return ~~(Math.random() * 2) * 90;
      })
      .font("Impact")
      .on("end", draw)
      .start();

    // function to draw the word cloud
    function draw(words) {

      svgElement.append("g")
        .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) {
          return xScale(d.value) + "px";
        })
        .style("font-family", "Impact")
        .style("fill", function (d, i) {
          return colorScale(i);
        })
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) {
          return d.key;
        });
    }

    d3.layout.cloud().stop();
  }


  /* 
  preparing the data for the word cloud
  calculating the frequency of each word except for the stopwords
  */
  function getWordCount(data, stopwords) {

    var common = `also,just,know,now,like,we,saw,seen,see,seing,get,dad,mom,if,else,got,sir,madam,mam,go,want,yet,man,men,woman,women,to,be,in,so,the,yes,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall`;

    if (Array.isArray(stopwords)) {
      common += ',' + stopwords.join(',');
    } else if (typeof stopwords == 'string') {
      common += ',' + stopwords.trim();
    }

    var word_count = {};
    common = common.toLowerCase();

    var words = data.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
    if (words.length == 1) {
      word_count[words[0]] = 1;
    } else {
      words.forEach(function (word) {
        var word = word.toLowerCase();
        word = word.trim();
        if (!!word && word.length > 1 && isNaN(parseFloat(word)) && ~common.indexOf(word) >= 0) {
          if (word_count[word]) {
            word_count[word]++;
          } else {
            word_count[word] = 1;
          }
        }
      })
    }
    return word_count;
  }

  // validating the D3 Library and request parameters which are mandatory
  function validataRequest(containerId, wordCloudData) {

    if (!d3)
      throw new Error('D3 Library not available');

    if (!d3.version.split('.')[0] == '4')
    throw new Error('Please select D3 Library version 4.x');

    if (!containerId && typeof containerId !== "string")
    throw new Error('Please supply Container ID');

    if (!wordCloudData || typeof wordCloudData !== "string")
    throw new Error('Please supply Word Cloud Data');

  }


  // validating the component ID provided and creating a SVG inside it
  function createSVGComponent(containerid, paddingAll) {

    // apply default word cloud size if not available
    var wordCloudSize = '750 750';

    var containerElement = d3Object.selectAll(containerid);
    let element = containerElement.nodes();

    // To check if no containers are found with the containerid
    if (!element || element.length == 0)
      throw new Error('No Container found with element selector : ' + containerid);

      // To check if multiple containers are found with the containerid
      if(element.length >1)
      throw new Error('Multiple Container found with element selector : "' + containerid + '". Please specify unique id or class of the element');


    let wordCloudSizeEach = wordCloudSize.split(' ');
    let container_height = element[0].getBoundingClientRect().height || wordCloudSizeEach[0];
    let container_width = element[0].getBoundingClientRect().width || wordCloudSizeEach[1];

    let elementStyle = window.getComputedStyle(element[0]);
    let paddingEach = paddingAll.split(' ');
    let padding_left = parseFloat(elementStyle.getPropertyValue('padding-left')) || paddingEach[0];
    let padding_right = parseFloat(elementStyle.getPropertyValue('padding-right')) || paddingEach[1];
    let padding_top = parseFloat(elementStyle.getPropertyValue('padding-top')) || paddingEach[2];
    let padding_bottom = parseFloat(elementStyle.getPropertyValue('padding-bottom')) || paddingEach[3];


    container_width = container_width - padding_left - padding_right;
    container_height = container_height - padding_top - padding_bottom - 80;

    console.log('Width : ', container_width);
    console.log('Height : ', container_height);

    var svgElement = containerElement
      .append('svg')
      .attr('class', 'svgElement')
      .style('height', container_height)
      .attr("width", container_width);

    return svgElement;
  }

  return {
    wordCloudGenerator
  }
})(d3);