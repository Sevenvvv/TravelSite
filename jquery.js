$(document).ready(function(){
	$(".nav-bar").hide();
	$("#menu-toggle").click(function(){
		$(".nav-bar").slideToggle();
	});

	$(".nature-content").hide();
	$(".read-less").hide();

	$(".read").click(function(){
		$(this).siblings(".read-more").slideToggle();
		$(this).siblings(".read-less").slideToggle();
		$(this).parent().next().slideToggle();
	});

});