
var config = {
	cols : 0, 
	rows : 0, 
	mines : 0, 
	size : "small", 
	dificulty : "easy",
	wrongFlags : true,
	noEffects : false,
	localFlags : false,
	mineFind : false
};

var state = {
	cels : 0, 
	safe : 0, 
	mines : 0, 
	visible : 0, 
	flags : 0,
	minesClass : '',
	visibleClass : '',
	flagsClass : ''
};

var saves = {};

var options = {
	size : {
		small : {label : "Pequeno", cols : 7, rows : 5},
		normal : {label: "Normal", cols : 10, rows : 7},
		big : {label :  "Grande", cols : 15, rows : 10}
	},

	dificulty : {
		easy : {label : "Fácil", value : 0.15},
		normal : {label: "Normal", value : 0.20},
		hard : {label :  "Difícil", value : 0.30}
	}
}


function createMatrix (rows, cols) {
	rows = rows ? rows : 10;
	cols = cols ? cols : 10;
	
	$('#game').css('opacity', 0).animate({ 'opacity' : 1}, 500).width('auto');
	var content = '';
	
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			content = content + '<span class="celula c-' + i + '-' + j + ' safe hidden normal" data-count="0" data-row="' + i + '" data-col="' + j + '"><span class="texto"></span></span>';
		}
		content = content + '<br/>';
	}

	$('#game .matrix').html(content);
	$('#game').width($('#game').width());
	
	var timeOut;
	
	$('.celula').mouseup(function(event) {
		event.preventDefault();
		
		switch (event.which) {
			case 1:
				if (!$(this).hasClass('flag')) {
					if (!$(this).hasClass('disabled')) {
						show('.c-' + $(this).attr('data-row') + '-' + $(this).attr('data-col'));
						$('.mine-link').removeClass('visible');
					}
				}
				break;
			case 3:
				flag('.c-' + $(this).attr('data-row') + '-' + $(this).attr('data-col'));
				break;
			default: return;
		}
	})
	.bind("contextmenu", function(e){
		return false;
	})
	.hover(function(){
		if (config.localFlags) {
			if ($(this).hasClass('hidden') && !$(this).hasClass('disabled')) {
				var cel = $(this);
				timeOut =  window.setTimeout(function() {
					console.log(cel.position());
					$('.mine-link')
						.css({
							top: cel.position().top,
							left: cel.position().left
						})
						.addClass('visible')
						.attr({'data-target' : '.c-' + cel.attr('data-row') + '-' + cel.attr('data-col')});
					if (cel.hasClass('flag')) {
						$('.mine-link').addClass('selected');
					}
					else {
						$('.mine-link').removeClass('selected');
					}
				}, 750);
			}
		}
	},
	function(){
		window.clearTimeout(timeOut);
		$('.mine-link').removeClass('visible');
	}); 
	console.log('matrix: Matriz criada com tamanho ' +  cols + 'x' + rows + '.');
}

function populate (amount, group) {
	var cel;
	
	if (group) {
		$(group).toggleClass('mine safe');
		state.minesClass = group;
		console.log('populate: ' + amount + ' minas plantadas em células pré-determinadas na variável "group".');
	}
	else {
		state.minesClass = '';
		for (var i = 0; i < amount; i++) {
			group = $('.matrix .safe');
			cel = $(group[Math.floor(Math.random() * group.length)]);
			cel.toggleClass('mine safe');
			state.minesClass += '.c-' + cel.attr('data-row') + '-' + cel.attr('data-col') + ', ';
		}
		console.log('populate: ' + amount + ' minas plantadas em células aleatórias (' + state.minesClass + ').');
	}
}

function count () {
	$('.matrix .mine').each(function(){
		var cel;
		for (var i = -1; i < 2; i++) {
			for (var j = -1; j < 2; j++) {
				 cel = $('.c-' + (parseInt($(this).attr('data-row'))+i) + '-' + (parseInt($(this).attr('data-col'))+j) + '.safe');
				 cel.attr('data-count', (parseInt(cel.attr('data-count')) + 1)).addClass('neighbor');
			}
		}
	});
	console.log('count: Minas vizinhas foram contadas. Cada valor foi salvo no atributo "data-count" da célula.');
}

function show (celClass) {
	var cel = $(celClass + '.hidden:not(.disabled)');
	
	if (cel.length) {
		if (cel.hasClass('safe hidden')) {
			if (cel.hasClass('flag')) {
				flag(celClass);
			};
			cel.toggleClass('hidden visible');
			var text = parseInt(cel.attr('data-count'));
			cel.find('.texto').html(text ? text : '');
			
			if (parseInt(cel.attr('data-count')) == 0) {
				console.log('show: Célula ' + celClass + ' aberta e vazia. Abrindo células vizinhas.');
				for (var i = -1; i < 2; i++) {
					for (var j = -1; j < 2; j++) {
						 show('.c-' + (parseInt(cel.attr('data-row'))+i) + '-' + (parseInt(cel.attr('data-col'))+j));
					}
				}
			}
			else {
				console.log('show: Célula ' + celClass + ' aberta.');
			}
			state.visible++;
			state.visibleClass += celClass + ', ';
		}
		else {
			$('#game').addClass('lose');
			console.log('show: Célula ' + celClass + ' aberta, mas contém uma mina.');
		}
		updateState();
	}
}

function flag (celClass) {
	var cel = $(celClass + '.hidden:not(.disabled)');
	
	if (cel.length) { 
		cel.toggleClass('normal flag');
		if (cel.hasClass('flag')) {
			cel.find('.texto').html('⚑'); 
			state.flags++;
			state.flagsClass += celClass + ', ';
			console.log('flag: Bandeira colocada na célula ' + celClass + '.');
		}
		else {
			cel.find('.texto').html(''); 
			state.flags--;
			state.flagsClass = state.flagsClass.replace(celClass + ', ', '');
			console.log('flag: Bandeira retirada da célula ' + celClass + '.');
		}
		updateState();
	}
}

function tip (amount) {
	for (var i = 0; i < amount; i++) {
		group = $('.matrix .neighbor.hidden');
		var cel = $(group[Math.floor(Math.random() * group.length)]);
		console.log('tip: Nova dica de célula segura para abrir.');
		show('.c-' + cel.attr('data-row') + '-' + cel.attr('data-col'));
	}
}

function wrongFlags() {
	var error = false;
	
	//Resetar a marcação de flag incorreta
	$('#msg').removeClass('error-2');
	$('.state-flags').removeClass('warning');
	
	if (config.wrongFlags) {
		//Coletar todas as células abertas que são vizinhas de flags
		var group = $('');
		var row, col, celTest;
		$('.matrix .flag').each(function(){
			row = parseInt($(this).attr('data-row'));
			col = parseInt($(this).attr('data-col'));
			for (var i = -1; i < 2; i++) {
				for (var j = -1; j < 2; j++) {
					celTest = $('.c-' + (row+i) + '-' + (col+j));
					if (celTest.hasClass('visible')) {
						group = group.add(celTest);
					};
				}
			}
		});
		
		//Contar quantas flags foram marcadas para cada célula e comparar
		group.each(function(){
			var flags = 0;
			
			for (var i = -1; i < 2; i++) {
				for (var j = -1; j < 2; j++) {
					if ($('.c-' + (parseInt($(this).attr('data-row'))+i) + '-' + (parseInt($(this).attr('data-col'))+j) + '.flag').length) {
						flags++;
					};
				}
			}
			
			if (flags > parseInt($(this).attr('data-count'))) {
				$(this).addClass('highlight');
				error = true;
			}
		})
		
		if (error) {
			$('#msg').addClass('error error-2').stop(false,true).slideDown();
			$('.state-flags').addClass('warning');
			console.log('wrongFlags: Banderas incorretas foram detectadas.');
		}
		else {
			console.log('wrongFlags: Nenhuma bandera incorreta.');
		}
	}
	
}

function updateState () {
	$('#visibleOpened').html(state.visible);
	$('#visibleTotal').html(state.safe);
	$('#flagsUsed').html(state.flags);
	$('#flagsTotal').html(state.mines);
	
	$('.matrix .highlight').removeClass('highlight');
	$('.matrix .highlight-good').removeClass('highlight-good');
	$('.state-item').removeClass('error good');
	$('#msg').stop(false,true).slideUp(function(){
		$('#msg').removeClass('error error-1 error-2 good tip tip-1 tip-2');
	});
	
	if (config.wrongFlags && (state.flags > state.mines)) {
		$('.state-flags').addClass('error');
		console.log('oi');
		$('#msg').addClass('error error-1').stop(false,true).slideDown();
	}
	
	if (state.flags == state.mines) {
		$('.state-flags').addClass('good');
	}
	
	
	if (state.visible == state.safe) {
		$('.state-visible').addClass('good');
	}
	
	var visibleWidth = $('.state-visible').width() * (state.visible / state.safe);
	var flagsWidth = $('.state-flags').width() * ((state.flags / state.mines) > 1 ? 1 : (state.flags / state.mines));
	$('.state-visible .progress').stop(true, false).animate({width : visibleWidth}, 500);
	$('.state-flags .progress').stop(true, false).animate({width : flagsWidth}, 500);
	
	config.mineFind ? $('#mineFindLink').addClass('visible') : $('#mineFindLink').removeClass('visible');
	config.noEffects ? $('body').removeClass('fx') : $('body').addClass('fx');
	
	if ($('#game').hasClass('lose')) {
		$('#game').addClass('end');
		$('#end').addClass('lose').stop(false,true).slideDown();
		$('.matrix .celula').addClass('disabled visible').removeClass('normal hidden highlight').filter('.mine:not(.flag)').find(' .texto').html('⁕');
		console.log('updateState: Jogo perdido.');
	}
	else {
		if ((state.visible == state.safe) && (state.mines == state.flags)) {
			$('#end, #game').addClass('win end');
			$('#end').stop(false,true).slideDown();
			$('.matrix .celula').addClass('disabled visible').removeClass('normal hidden highlight');
			$('.mine-link').removeClass('visible selected').css({top: 0, left : 0});
			$('.screenshot').one('click', function(){takePhoto();});
			console.log('updateState: Jogo ganho.');
		}
		else {
			wrongFlags();
			console.log('updateState: Estado atual: ' + state.visible + '/' + state.safe + ' células seguras, ' + state.flags + '/' + state.mines + ' minas marcadas.');
		}
	}
}

function takePhoto() {
	var hasFX = false;
	if ($('body').hasClass('fx')) {
		$('body').removeClass('fx');
		hasFX = true;
	}
	
	html2canvas($('#game')[0], {
		onrendered: function(canvas) {
			$('.screenshot-canvas').html(Canvas2Image.saveAsPNG(canvas, true));
			console.log('takePhoto: Foi tirada uma foto do jogo.');
				//.attr('href', $('.screenshot-canvas img').attr('src'));
		}	
	});
	
	if (hasFX) $('body').addClass('fx');
}

function createOptions () {
	for (option in options.size) {
		$('#size').append("<button class='option' value='" + option + "' >" + options.size[option].label + " (<small class='label'>" + options.size[option].cols + "x" + options.size[option].rows + "</small>)</button> ");
	}
	
	for (option in options.dificulty) {
		$('#dificulty').append("<button class='option' value='" + option + "' >" + options.dificulty[option].label + " (<small class='label'></small>)</button> ")
	}
	
	$('.option-select .option').click(function() {
		$(this).parent().find('.selected').removeClass('selected');
		var option = $(this).parent().attr('id');
		var value = $(this).addClass('selected').attr('value');
		config[option] = value;
		localStorage.setItem(option, value);
		applyConfig();
	});
	
	$('#size .option[value="' + config.size + '"]').addClass('selected');
	$('#dificulty .option[value="' + config.dificulty + '"]').addClass('selected');
	
	var checks = [ 'wrongFlags', 'localFlags', 'mineFind', 'noEffects' ];
	for (option in checks) {
		$('#' + checks[option]).attr('checked', config[checks[option]]);
	}
	console.log('createOptions: Os controles de opções foram criados.');
}

function setSize (){
	config.cols = options.size[config.size].cols;
	config.rows = options.size[config.size].rows;
	
	for (option in options.dificulty) {
		$('#dificulty .option[value="' + option + '"] .label').html(Math.round(options.dificulty[option].value * config.cols * config.rows));
	}
	
	console.log('setSize: O tamanho do campo foi definido para ' + config.cols + 'x' + config.rows + '.');
}

function setDificulty () {
	config.mines = Math.round(options.dificulty[config.dificulty].value * options.size[config.size].cols * options.size[config.size].rows);
	console.log('setDificulty: A dificuldade foi definido para ' + config.dificulty + '.');
}

function applyConfig (newConfig) {
	$('#end, #msg').stop(false,true).slideUp(function() {
		$('#game, #end').removeClass('win lose end');	
	});
	state.minesClass = '';
	state.flagsClass = '';
	state.visibleClass = '';
	
	setSize();
	setDificulty();
	createMatrix(config.rows, config.cols);

	state.cels = config.rows * config.cols;
	state.mines = config.mines;
	state.safe = config.rows * config.cols - config.mines;
	
	state.visible = 0;
	state.flags = 0;
		
	if (newConfig) {
		console.log('applyConfig: Uma configuração de campo está sendo carregada.');
		state.visible = newConfig.visible;
		state.flags = newConfig.flags;
		
		populate(config.mines, newConfig.minesClass);
		count();
		
		//Show visibles
		$(newConfig.visibleClass).each(function(){
			$(this).toggleClass('hidden visible');
			var text = parseInt($(this).attr('data-count'));
			$(this).find('.texto').html(text ? text : '');
		});
		
		//Mark flags
		$(newConfig.flagsClass).each(function(){
			$(this).toggleClass('normal flag').find('.texto').html('⚑'); 
		});
	}
	
	else {
		console.log('applyConfig: Uma nova configuração de campo será criada.');
		populate(config.mines);
		count();
	}
	
	updateState();
}

function loadGame () {
	//~ for (prop in status) {
		//~ status[prop] = localStorage.getItem('state.' + prop);
	//~ }
	
	state.visibleClass  = localStorage.getItem('state.visibleClass');
	state.flagsClass = localStorage.getItem('state.flagsClass');
	state.minesClass = localStorage.getItem('state.minesClass');
	
	
}

function saveGame () {
	localStorage.setItem('state.visibleClass', state.visibleClass);
	localStorage.setItem('state.flagsClass', state.flagsClass);
	localStorage.setItem('state.minesClass', state.minesClass);
	console.log('saveGame: Variáveis visibleClass, flagsClass e minesClass salvas no localStorage.')
}

function init () {
	var temp;
	for (option in config) {
		temp = localStorage.getItem(option); 
		config[option] = (temp == 'true') ? true : ((temp == 'false') ? false : ((temp != null) ? temp : config[option]));
	}
	
	createOptions();
	applyConfig();
}

function lastNeighbors () {
	var found = false;
	
	//Avaliar celulas visiveis para descobrir se alguma possui vizinho que podem ser inferidos
	var row = 0, col = 0;
	var visibles = $('.matrix .visible.neighbor');
	var roundCels, roundUnknown, roundExpected;
	visibles.each(function(){
		row = parseInt($(this).attr('data-row'));
		col = parseInt($(this).attr('data-col'));
		
		//Filtrar somente células ocultas e que nao tem bandeira ao redor do pivô
		roundCels = $('.c-' + (row-1) + '-' + (col-1) + 
					   ', .c-' + (row-1) + '-' + (col) +
					   ', .c-' + (row-1) + '-' + (col+1) +
					   ', .c-' + (row) + '-' + (col-1) +
					   ', .c-' + (row) + '-' + (col+1) +
					   ', .c-' + (row+1) + '-' + (col-1) +
					   ', .c-' + (row+1) + '-' + (col) +
					   ', .c-' + (row+1) + '-' + (col+1));
		
		roundUnknown = roundCels.filter('.hidden:not(.flag)');
		roundExpected = parseInt($(this).attr('data-count')) - roundCels.filter('.flag').length;
		
		if (roundUnknown.length && (roundUnknown.length == roundExpected)) {
			found = true;
			roundUnknown.addClass('highlight');
			$(this).addClass('highlight');
			$('#msg').addClass('tip tip-1').stop(false,true).slideDown();
			console.log('lastNeighbors: A célula .c-' + $(this).attr('data-row') + '-' + $(this).attr('data-col') + ' possui vizinhos que só podem ser minas.');
			return false;
		}
	});
	return found;
}

function minesEnough () {
	var found = false;
	
	//Avaliar celulas visiveis para descobrir se alguma já possui número suficiente de minas marcadas
	var row = 0, col = 0;
	var visibles = $('.matrix .visible.neighbor');
	var roundCels;
	visibles.each(function(){
		row = parseInt($(this).attr('data-row'));
		col = parseInt($(this).attr('data-col'));
		
		roundCels = $('.c-' + (row-1) + '-' + (col-1) + ', ' + 
					   '.c-' + (row-1) + '-' + (col) + ', ' +
					   '.c-' + (row-1) + '-' + (col+1) + ', ' +
					   '.c-' + (row) + '-' + (col-1) + ', ' +
					   '.c-' + (row) + '-' + (col+1) + ', ' +
					   '.c-' + (row+1) + '-' + (col-1) + ', ' +
					   '.c-' + (row+1) + '-' + (col) + ', ' +
					   '.c-' + (row+1) + '-' + (col+1));
					   
		//Verificar se há pelo menos uma casa oculta ao redor do pivô para sugerir como segura
		if (roundCels.filter('.hidden:not(.flag)').length) {
			//Verificar se as células que tem bandeira ao redor do pivô atisfazem todas as minas vizinhas do pivô
			if (roundCels.filter('.flag').length && (roundCels.filter('.flag').length == parseInt($(this).attr('data-count')))) {
				found = true;
				roundCels.filter(':not(.flag)').addClass('highlight-good');
				$(this).addClass('highlight');
				$('#msg').addClass('tip tip-2').stop(false,true).slideDown();
				console.log('minesEnough: A célula .c-' + $(this).attr('data-row') + '-' + $(this).attr('data-col') + ' já tem todas as minas vizinhas marcadas.');
				return false;
			}
		}
	});
	return found;
}

//Encontrar a célula que tem menos chances de ser uma bomba.
function bestTry () {
	
	//Encontrar células conhecidas com bombas na vizinhança
}

//Encontrar células que compartilham minas e garantem que outras células sejam seguras. 
function sharedMines () {
	
}

$('.tip').click(function(){
	if (lastNeighbors() || minesEnough() || tip(1)) {
		return true;
	}
	
});

$('.new-game').click(function(){
	applyConfig();
});

$('.toggle').click(function(){
	$('#' + $(this).attr('data-target')).stop(false,true).slideToggle();
	$(this).toggleClass('selected');
});
$('.close').click(function(){
	$('.toggle[data-target="' + $(this).parent().attr('id') + '"]').click();
});
	
//~ 
//~ $('.help-toggle').click(function(){
	//~ $('#help').stop(false,true).slideToggle();
	//~ $(this).toggleClass('selected');
//~ });

$('.check-option').change(function(){
	var option = $(this).attr('id');
	var value = $(this).is(':checked');
	config[option] = value;
	localStorage.setItem(option, value);
	console.log(option, value);
	updateState();	
});

$('.mine-link').click(function(){
	$(this).toggleClass('selected');
	flag($(this).attr('data-target'));
});

$('.mine-find').click(function(){
	if (!$('#game').hasClass('end')) {
		$('.hidden').addClass('disabled');
		var mineFind = $(this);
		mineFind.addClass('selected');
		$('#game').addClass('mine-mode').one('click', function(event){
			$('.hidden').removeClass('disabled');
			var cel = $(event.target);
			if (cel.hasClass('texto')) {
				cel = cel.parents('.celula');
			}
			if (cel.is('.celula.hidden')) {
				flag('.c-' + cel.attr('data-row') + '-' + cel.attr('data-col'));
			}
			$('#game').removeClass('mine-mode');
			mineFind.removeClass('selected');
			$('.hidden').removeClass('disabled');
		})
	}
});

$('.loadGame').click(function(){
	loadGame();
});

$('.saveGame').click(function(){
	saveGame();
});

//~ var split = location.search.replace('?', '').split('&').map(function(val){
  //~ return val.split('=');
//~ });
//~ 
//~ console.log(split[0][0], split[0][1]);
//~ 
//~ $('body').append('<img src=' + split[0][1] + '/>');

init();

//~ var timeTaken;
//~ var start = +new Date();  // cast right now to a number
//~ 
//~ for (i = 0; i < 100000000; i++)  // Some seriously intensive loop
//~ {
    //~ // ...
//~ }
//~ 
//~ timeTaken = (+new Date()) - start;  // calculate the total time taken
//~ console.log(timeTaken);
//~ if (timeTaken > 500)  // if time taken is longer than 500ms
    //~ switchToBasic();
