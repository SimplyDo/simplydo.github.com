window.onload = function() {
	adjustContent();
	enablePreview();
	
	$(window).resize(function() {
	  adjustContent();
	});
	

	
}


function enablePreview() {
	
	if (isCanvasSupported()) { 
		
		$('#icon').bind('click', function() {
		  toggleTeaser();
		});
		
		$('#icon').attr("href","#");
	
		$('#previewLink').bind('click', function() {
		  toggleTeaser();
		});
	
		$('#closeLink').bind('click', function() {
		  toggleTeaser();
		});
		
		$('#icon').popover({
			placement: "right",
			title: "Try it now",
			content: "Click for a real functional preview right in your Browser.<br /><br />Maze Me fully supports the Retina displays of the iPhone 4 and the new iPad. <strong>Available on the App Store.</strong>"
		});
		
	} else {
		
		$('#previewLink').hide();
		
		$('#icon').popover({
			placement: "right",
			title: "Get it today",
			content: "Maze Me fully supports the Retina displays of the iPhone 4 and the new iPad.<br /><strong>Available on the App Store.</strong>"
		});
		
		$('#icon').attr("href","http://apple.com");
		
		
	}
	
}



function toggleTeaser() {
	var teaser = $('#teaser');
	if (teaser.css("top") != "0px") {
		showTeaser();
	} else {
		hideTeaser();
	}
}

function hideTeaser() {
	var windowHeight = $(window).height();
	$('#previewLink').slideUp();
	$('#closeLink').fadeIn();
	$('#buttons').animate({
	    bottom: "12px"
	  }, 200, function() {
		  // Animation complete.
	  });
	$('#teaser').animate({
	    top: (windowHeight*-1+100)+"px"
	  }, 1000, function() {
		  // Animation complete.
	  });
	$('#icon').popover('hide')
}

function showTeaser() {
	$('#previewLink').slideDown();
	$('#closeLink').fadeOut();
	$('#buttons').animate({
	    bottom: "40px"
	  }, 250, function() {
		 // Animation complete.
	  });
	
	$('#teaser').animate({
	    top: "0px"
	  }, 1000, function() {
	    // Animation complete.
	  });
	
}


function adjustContent() {
	var content = $('#content');
	var contentHeight = content.height();
	var windowHeight = $(window).height();
	var icon = $("#icon");
	if (windowHeight < 600) {
		icon.css("height", "150px");
		icon.css("width", "150px");
		icon.css("border-radius", "25px");
	} else {
		icon.css("height", "300px");
		icon.css("width", "300px");
		icon.css("border-radius", "50px");
		
	}
	content.css('top',(windowHeight-contentHeight-150)/2);
}


function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}