$(document).ready(function(){
	//To Make the Tab where the mouse is currently on the navigation bar blink
	$('#textArea').hover(function(){
		$('#textArea').css({"background-color": "rgba(12,32,48,0.1)"});},
		function(){
			$('#textArea').css({"background-color": "rgba(12,32,48,0.0)"});});

	//To Change background opacity when mouse is hovered over the "div"		
	$('a.navBar').hover(function(){
		$(this).addClass("hoverTab");
		$(this).fadeTo(500,0.5).fadeTo(500,1.0);},
		function(){
			$(this).removeClass("hoverTab");
			$(this).css('visibility','visible');
		});
});