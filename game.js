let game=()=>{
	return Math.ceil(Math.random()*10);
}
switch(game())
{
	
	case 2: console.log('scissor');
      break;
      case 4: console.log('scissor');
      break;
      case 6: console.log('scissor');
      break;
      case 3: console.log('rock');
      break;
      case 5: console.log('rock');
      break;
      case 7: console.log('rock');
      break;
      default: console.log('paper');
}