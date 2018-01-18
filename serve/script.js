/* jshint node: false, browser: true, esversion: 3, varstmt: false */

/*

  Copyright 2017 Emil Hemdal (https://emil.hemdal.se/) and
    Datateknologsektionen Chalmers Studentkår (https://www.dtek.se/)

  This file is part of tv.dtek.se.

  tv.dtek.se is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  tv.dtek.se is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with tv.dtek.se.  If not, see <http://www.gnu.org/licenses/>.

*/

(function() {
    'use strict';

    var slideshow = document.getElementById('slideshow');
    var currentImg = 0;
    var currentImages = [];

    var first = true;

    /**
     *
     * nextImg
     *
     * Very simple function that triggers the next image to display.
     * Could be made smaller but that I like its explicitness (if that is even a word).
     *
     */

    function nextImg() {
        var newImg = currentImg + 1 < currentImages.length ? currentImg + 1 : 0;
        if(currentImg !== newImg) {
          showImg(newImg);
          currentImg = newImg;
        }
    }

    /**
     *
     * showImg
     *
     * Very simple function that display the image with the correct index and removes the other images.
     *
     */
    function showImg(index) {
        if(currentImages.length > 0) {
            var newImg = document.createElement("img");
            newImg.src = '/img/' + currentImages[index];
            while (slideshow.firstChild) {
              slideshow.removeChild(slideshow.firstChild);
            }
            slideshow.appendChild(newImg);
        }
    }

    function updateJSON() {
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    currentImages = JSON.parse(httpRequest.responseText);
                    if(first) {
                        first = false;
                        nextImg();
                        setInterval(nextImg, 15000); // 15 seconds
                    }
                }
            }
        };
        httpRequest.open('GET', '/currentImages.json?t='+Date.now(), true);
        httpRequest.send();
    }

    setInterval(updateJSON, 300000); // 5 minutes
    setTimeout(updateJSON, 1000);

})();
