$(function(){var $gallery=$('.gallery');$gallery.imagesLoaded(function(){applyIsotope();});var applyIsotope=function(){$gallery.isotope({itemSelector:'.gallery-item',percentPosition:true,masonry:{columnWidth:'.grid-sizer',gutter:0}})}});