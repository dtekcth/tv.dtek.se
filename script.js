/* jshint node: false, browser: true */

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
        var newImg = (currentImg + 1 < currentImages.length ? currentImg + 1 : 0);
        showImg(newImg);
        currentImg = newImg;
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

    setInterval(updateJSON, 900000); // 15 minutes
    setTimeout(updateJSON, 1000);

})();
