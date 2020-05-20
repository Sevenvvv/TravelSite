$(document).ready(function(){

	/*Make navbar show when hamburger button is clicked*/
	$(".nav-bar").hide();
	$("#menu-toggle").click(function(){
		$(".nav-bar").slideToggle();
	});

	/*Content and read-less-button is hidden when page loads*/
	$(".nature-content").hide();
	$(".read-less").hide();

	/*Event when read-checkbox is clicked*/
	$(".read").click(function(){
		$(this).siblings(".read-more").slideToggle();
		$(this).siblings(".read-less").slideToggle();
		$(this).parent().next().slideToggle();
	});


});