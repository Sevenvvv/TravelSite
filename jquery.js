$(document).ready(function(){
	$(".nav-bar").hide();
	$("#menu-toggle").click(function(){
		$(".nav-bar").slideToggle();
	});

	$(".nature-content").hide();

	$("#read-less-volcano").hide();
	$("#read-volcano").click(function(){
		$("#volcano-content").slideToggle();
		$("#read-more-volcano").slideToggle();
		$("#read-less-volcano").slideToggle();
	});

	$("#read-less-geyser").hide();
	$("#read-geyser").click(function(){
		$("#geyser-content").slideToggle();
		$("#read-more-geyser").slideToggle();
		$("#read-less-geyser").slideToggle();
	});

	$("#read-less-lagoon").hide();
	$("#read-lagoon").click(function(){
		$("#lagoon-content").slideToggle();
		$("#read-more-lagoon").slideToggle();
		$("#read-less-lagoon").slideToggle();
	});

});